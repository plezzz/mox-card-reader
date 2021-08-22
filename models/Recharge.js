const {errorCourse} = require('../config/messages')();

module.exports = (mongoose) => {
    const {Schema, model: Model} = mongoose;
    const {ObjectId, Date, String} = Schema.Types;

    const rechargeSchema = new Schema({
        from: {
            type: Date,
        },
        to: {
            type: Date,
        },
        months: {
            type: String,
        },
        createdBy: {
            type: ObjectId,
            ref: "User",
            required: true
        },
        editedBy: {
            type: ObjectId,
            ref: "User",
            required: true
        }
    }, {timestamps: true});


    return Model('Recharge', rechargeSchema);
};
