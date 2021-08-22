
module.exports = (mongoose) => {
    const {Schema, model: Model} = mongoose;
    const {} = Schema.Types;

    const entriesSchema = new Schema({

    }, {timestamps: true,offset: +3});

    return Model('Entries', entriesSchema);
};
