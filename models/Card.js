const {errorMember} = require('../config/messages')();

module.exports = (mongoose) => {
    const {Schema, model: Model} = mongoose;
    const {String, ObjectId, Array} = Schema.Types;

    const cardSchema = new Schema({
        cardName: {
            type: String,
            unique: false
        },
        title: {
          type:String,
          unique: false
        },
        serialNumber: {
            type: String,
        },
        serialNumberByValue: {
            type: Array,
        },
        cardOwner: {
          type: ObjectId,
          ref: "Member"
        },
        status: {
          type: Boolean,
          default: true
        },
        entries: [{
            type: ObjectId,
            ref: "Entries",
        }],


    }, {timestamps: true});

    // cardSchema.post('save', function (error, doc, next) {
    //     if (error.name === 'MongoError' && error.code === 11000) {
    //         next(errorMember.alreadyInUsePhone);
    //     } else {
    //         next(error);
    //     }
    // });

    return Model('Card', cardSchema);
};
