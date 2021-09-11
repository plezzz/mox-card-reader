
module.exports = (mongoose) => {
    const {Schema, model: Model} = mongoose;
    const {String} = Schema.Types;

    const entriesSchema = new Schema({
        deviceID: {
            type:String,
            unique: false
        },
    }, {timestamps: true,offset: +3});

    return Model('Entries', entriesSchema);
};
