const {errorMember} = require('../config/messages')();

module.exports = (mongoose) => {
    const {Schema, model: Model} = mongoose;
    const {String, ObjectId, Array} = Schema.Types;

    const memberSchema = new Schema({
        firstName: {
            type: String,
        },
        lastName: {
            type: String,
        },
        email: {
            type: String,
            unique: [true, errorMember.alreadyInUseEmail],
        },
        phone: {
            type: String,
            unique: [true, errorMember.alreadyInUsePhone],
            required: [true, errorMember.phone]
        },
        type:{
            type:String,
        },
        cards: [{
            type: ObjectId,
            ref: "Card"
        }],
        createdBy: {
            type: ObjectId,
            ref: "User",
            required: true
        },
        editedBy: {
            type: ObjectId,
            ref: "User",
            required: true
        },
        recharge: [{
            type: ObjectId,
            ref: "Recharge",
        }],
    }, {timestamps: true});

    memberSchema.post('save', function (error, doc, next) {
        if (error.name === 'MongoError' && error.code === 11000) {
            next(errorMember.alreadyInUsePhone);
        } else {
            next(error);
        }
    });

    return Model('Member', memberSchema);
};
