/**
 * Libraries
 */
#include <ESP8266WiFi.h>
#include <ESP8266WiFiMulti.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <SPI.h>
#include <MFRC522.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

/**
 * START General settings
 */
   /**
   * WiFi
   */
   ESP8266WiFiMulti WiFiMulti;
   boolean connectioWasAlive = true;
  /**
   * Display (GME12864)
   */
   #define SCREEN_WIDTH 128 // OLED display width, in pixels
   #define SCREEN_HEIGHT 64 // OLED display height, in pixels
   Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);
  /**
   * RFID Reader (RFID-RC522)
   */
   constexpr uint8_t RST_PIN = 0;     // Configurable, see typical pin layout above
   constexpr uint8_t SS_PIN = 2;     // Configurable, see typical pin layout above
   MFRC522 rfid(SS_PIN, RST_PIN); // Instance of the class
   MFRC522::MIFARE_Key key;
   byte nuidPICC[4]; // Init array that will store new NUID
   /**
   * RGB LED
   */
   const int  R_PIN = 15;
   const int  G_PIN = 16;
   const int  B_PIN = 3;
/**
 * END General settings
 */


void setup() {
  Serial.begin(115200);
  led(255, 51, 204);
  /**
   * Initialization Display
   */
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) { // Address 0x3D for 128x64
      Serial.println(F("SSD1306 allocation failed"));
      for (;;); // Don't proceed, loop forever
  }

  /**
   * Initialization WiFi
   */
  WiFi.mode(WIFI_STA);
  WiFiMulti.addAP("GM_ZonE_Lulin", "asdfghjkl");
  WiFiMulti.addAP("Mox Staff", "moxgaming2021!");
  displayPrint("Connecting to WiFi",10,30);
  Serial.print("Connecting to WiFi:");
  while (WiFiMulti.run() != WL_CONNECTED) {
    Serial.print(".");
    displayPrintSL(".");
  }
  Serial.printf(" connected to %s\n", WiFi.SSID().c_str());
  displayPrint2("Connected to", WiFi.SSID().c_str());
  Serial.println();

  /**
   * Initialization RGB LED
   */
//  pinMode(R_PIN, OUTPUT);
//  pinMode(B_PIN, OUTPUT);
//  pinMode(G_PIN, OUTPUT);

  /**
   * Initialization RFID Reader
   */
  SPI.begin(); // Init SPI bus
  rfid.PCD_Init(); // Init MFRC522

  for (byte i = 0; i < 6; i++) {
    key.keyByte[i] = 0xFF;
  }
  MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
  delay(3000);
  displayPrint("Ready",50,30);
  led(0, 0, 220);
}

void loop() {
  mainCode();
}

void mainCode(){
    // Look for new cards
    if ( ! rfid.PICC_IsNewCardPresent())
      return;
    // Verify if the NUID has been readed
    if ( ! rfid.PICC_ReadCardSerial())
      return;
    displayPrint("Check Status",30,30);
    MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
    printCardDetails();
    Serial.println("Check network connection:");
    if (WiFi.status() == WL_CONNECTED) {
      Serial.printf(" connected to %s\n", WiFi.SSID().c_str());

      std::unique_ptr<BearSSL::WiFiClientSecure>client(new BearSSL::WiFiClientSecure);

     //client->setFingerprint("B8:B9:B1:3F:37:1F:2B:1B:38:E8:A7:72:8E:29:12:07:1E:1F:98:E8");
     // Or, if you happy to ignore the SSL certificate, then use the following line instead:
     client->setInsecure();

     HTTPClient https;


     https.begin(*client, "https://mox-cards.herokuapp.com/card/card-data"); //HTTPS
     https.addHeader("Content-Type", "application/json");
     DynamicJsonDocument doc(1024);
     doc["cardType"] = piccType;
     doc["cardName"] = rfid.PICC_GetTypeName(piccType);
     doc["serialNumber0"]   = rfid.uid.uidByte[0];
     doc["serialNumber1"]   = rfid.uid.uidByte[1];
     doc["serialNumber2"]   = rfid.uid.uidByte[2];
     doc["serialNumber3"]   = rfid.uid.uidByte[3];
     doc["serialNumber"] = printRoute(rfid.uid.uidByte, rfid.uid.size);
     doc["deviceID"] = 1001;
     String json;
     serializeJson(doc, json);

  // start connection and send HTTP header and body
  int httpCode = https.POST(json);

  // httpCode will be negative on error
  if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("HTTPcode: ", httpCode);

      // file found at server
      if (httpCode == HTTP_CODE_OK) {
        const String& payload = https.getString();
        Serial.println(payload);
        Serial.println(">>");

      const size_t bufferSize = JSON_OBJECT_SIZE(2) + JSON_OBJECT_SIZE(3) + JSON_OBJECT_SIZE(5) + JSON_OBJECT_SIZE(8) + 370;
      DynamicJsonDocument res(1024);
      deserializeJson(res, https.getString());
      const char * user = res ["item1"];
      const char * cardStatus = res ["item2"];
      const int cardStatusNum = res ["item3"];
       Serial.println(cardStatusNum);
       display.clearDisplay();
       display.setCursor(0, 5);
       if(cardStatusNum == 1){
        led(0,230,0);
        display.println("Card:");
        display.println(printRoute(rfid.uid.uidByte, rfid.uid.size));
        display.println("User:");
        display.println(user);
        display.println("Status:");
        display.println();
        display.println(cardStatus);
        Serial.println("if valid");
       }else if (cardStatusNum == 2){
        led(100,230,100);
        display.println("Card:");
        display.println(printRoute(rfid.uid.uidByte, rfid.uid.size));
        display.println(user);
        }
        else if (cardStatusNum == 3){
        led(230,230,100);
        display.println("Card:");
        display.println(printRoute(rfid.uid.uidByte, rfid.uid.size));
        display.println(user);
        display.println(cardStatus);
        }
        else{
       led(230,0,0);
       display.println("Card:");
       display.println(printRoute(rfid.uid.uidByte, rfid.uid.size));
       display.println("User:");
       display.println(user);
       display.println("Status:");
       display.println();
       display.println(cardStatus);
       Serial.println("if not valid");
       }
    display.display();
      }
    } else {
      Serial.printf("[HTTPS] POST... failed, error: %s\n", https.errorToString(httpCode).c_str());
      displayPrint2("HTTP ERROR","Call Niki");
    }
    https.end();
    }else{
      Serial.println("Not Connected2!");
      Serial.printf(" Is connected but block %s\n", WiFi.SSID().c_str());
      displayPrint3("Network error:","Check WiFi", "Check Internet");
      while(WiFi.status() != WL_CONNECTED){
              WiFiMulti.run();
              Serial.println("Not conected");
      }
      Serial.printf(" connected4 to %s\n", WiFi.SSID().c_str());
      displayPrint2(" connected4 to %s\n", WiFi.SSID().c_str());
      return;
    }
    delay(10000);
    displayPrint("Ready",50,30);
    led(0,0,220);
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
/**
 * Print on I2C display 1 line of text.
 */
void displayPrint(String str,int w,int h){
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(w, h);
  display.println(str);
  display.display();
}
/**
 * Print on I2C display 2 line of text.
 */
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
void displayPrint3(String str, String str2, String str3){
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(WHITE);
  display.setCursor(30, 20);
  // Display static text
  display.println(str);
  display.setCursor(30, 35);
  display.println(str2);
  display.setCursor(30, 50);
  display.println(str3);
  display.display();
}
/**
 * Print on I2C display on same line.
 */
void displayPrintSL(String str){
  display.print(str);
  display.display();
}


/**
 * Print on serial monitor card detils
 */
void printCardDetails (){
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
  }

/**
 * Set RGB LED Color
 */
void led (int r,int g,int b){
  analogWrite (R_PIN, r);
  analogWrite (G_PIN, g);
  analogWrite (B_PIN, b);
}

//  void scrollText(String str) {
//  display.setTextSize(1); // Draw 2X-scale text
//  display.setTextColor(SSD1306_WHITE);
//  display.setCursor(40, 50);
//  display.println(str);
//  display.display();      // Show initial text
//  delay(100);
//
//  // Scroll in various directions, pausing in-between:
//  display.startscrollright(0x00, 0x0F);
//  delay(2000);
//  display.stopscroll();
//  delay(1000);
//  display.startscrollleft(0x00, 0x0F);
//  delay(2000);
//  display.stopscroll();
//  delay(1000);
//  display.startscrolldiagright(0x00, 0x07);
//  delay(2000);
//  display.startscrolldiagleft(0x00, 0x07);
//  delay(2000);
//  display.stopscroll();
//  delay(1000);
//}
