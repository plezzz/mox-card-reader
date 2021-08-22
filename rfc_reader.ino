#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

#ifndef STASSID
#define STASSID "GM_ZonE_Lulin"
#define STAPSK  "asdfghjkl"
//#define STASSID "Mox Staff"
//#define STAPSK  "moxgaming2021!"
#endif


// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);

constexpr uint8_t RST_PIN = 0;     // Configurable, see typical pin layout above
constexpr uint8_t SS_PIN = 2;     // Configurable, see typical pin layout above

const String REQUEST_LED_R = "/led_r";
const String REQUEST_LED_G = "/led_g";
const String REQUEST_LED_B = "/led_b";
const char PARAM_VALUE[]   = "value";
const char STATE[]         = "state";
const int  R_PIN           = 15;
const int  G_PIN           = 16;
const int  B_PIN           = 10;

const int MIN_ANALOG = 1023;
const int MAX_ANALOG = 0;
const int MIN_COLOR  = 0;
const int MAX_COLOR  = 255;

MFRC522 rfid(SS_PIN, RST_PIN); // Instance of the class

MFRC522::MIFARE_Key key;

// Init array that will store new NUID
byte nuidPICC[4];


void setup() {
  Serial.begin(115200);
  WiFi.begin(STASSID, STAPSK);

int counter = 0;
  pinMode(R_PIN, OUTPUT);
  pinMode(B_PIN, OUTPUT);
  pinMode(G_PIN, OUTPUT);
  while (WiFi.status() != WL_CONNECTED) {

    delay(500);
    Serial.print(".");
    if(!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for(;;);
  }
      analogWrite (R_PIN, 100);
      analogWrite (G_PIN, 120);
      analogWrite (B_PIN, 100);
  if(counter == 0)
     displayPrint("Conecting.");
  if (counter == 1)
    displayPrint("Conecting..");
  if (counter == 2)
    displayPrint("Conecting...");
  counter++;
   if (counter > 2){
     counter = 0;
   }
  }

  Serial.begin(115200);
  SPI.begin(); // Init SPI bus
  rfid.PCD_Init(); // Init MFRC522

  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
}

void loop() {
//      analogWrite (R_PIN, 0);
//      analogWrite (B_PIN, 255);
//      analogWrite (G_PIN, 0);
//      displayPrint("Ready");
  // wait for WiFi connection
  if ((WiFi.status() == WL_CONNECTED)) {

  // Look for new cards
  if ( ! rfid.PICC_IsNewCardPresent())
    return;
  // Verify if the NUID has been readed
  if ( ! rfid.PICC_ReadCardSerial())
    return;
  Serial.print(F("PICC type: "));
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  Serial.println(rfid.PICC_GetTypeName(piccType));

  Serial.println();
  Serial.print(F("In dec: "));
  printDec(rfid.uid.uidByte, rfid.uid.size);
  Serial.println();

  // Halt PICC
  rfid.PICC_HaltA();

  // Stop encryption on PCD
  rfid.PCD_StopCrypto1();

  WiFiClient client;
  HTTPClient http;

  // configure traged server and url
  http.begin(client, "http://192.168.88.70:3000/card/card-data"); //HTTP
  http.addHeader("Content-Type", "application/json");
  DynamicJsonDocument doc(1024);
  doc["cardType"] = piccType;
  doc["cardName"] = rfid.PICC_GetTypeName(piccType);
  doc["serialNumber0"]   = rfid.uid.uidByte[0];
  doc["serialNumber1"]   = rfid.uid.uidByte[1];
  doc["serialNumber2"]   = rfid.uid.uidByte[2];
  doc["serialNumber3"]   = rfid.uid.uidByte[3];
  doc["serialNumber"] = printRoute(rfid.uid.uidByte, rfid.uid.size);
  String json;
  serializeJson(doc, json);

  // start connection and send HTTP header and body
  int httpCode = http.POST(json);

  // httpCode will be negative on error
  if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("HTTPcode: ", httpCode);

      // file found at server
      if (httpCode == HTTP_CODE_OK) {
        const String& payload = http.getString();
        Serial.println(payload);
        Serial.println(">>");

      const size_t bufferSize = JSON_OBJECT_SIZE(2) + JSON_OBJECT_SIZE(3) + JSON_OBJECT_SIZE(5) + JSON_OBJECT_SIZE(8) + 370;
      DynamicJsonDocument res(1024);
      deserializeJson(res, http.getString());
      const char * user = res ["item1"];
      const char * cardStatus = res ["item2"];
      const int cardStatusNum = res ["item3"];
       Serial.println(cardStatusNum);
       if(cardStatusNum == 1){
      analogWrite (R_PIN, 0);
      analogWrite (B_PIN, 0);
      analogWrite (G_PIN, 255);
      Serial.println("if valid");
  }else{
      analogWrite (R_PIN, 255);
      analogWrite (B_PIN, 0);
      analogWrite (G_PIN, 0);
       Serial.println("if not valid");
    }
       display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(0, 5);
  // Display static text
  display.println("Card:");
  display.println(printRoute(rfid.uid.uidByte, rfid.uid.size));
  display.println("User:");
  display.println(user);
  display.println("Status:");
  display.setTextSize(1.5);
  display.println(cardStatus);
  display.display();



      }
    } else {
      Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }

    http.end();
  }

  delay(5000);
}

/**
 * Helper routine to dump a byte array as hex values to POST.
 */
String printRoute(byte *buffer, byte bufferSize) {
   String stringOne = "";
  for (byte i = 0; i < bufferSize; i++) {
    stringOne = stringOne + buffer[i];
  }
  return stringOne;
}

/**
 * Helper routine to dump a byte array as dec values to Serial.
 */
void printDec(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? " 0" : " ");
    Serial.print(buffer[i], DEC);
  }
}

void displayPrint(String str){
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(30, 20);
  // Display static text
  display.println(str);
  display.display();
}

void displayPrint2(String str,String str2){
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(30, 20);
  // Display static text
  display.println(str);
  display.setCursor(30, 35);
  display.println(str2);
  display.display();
}
