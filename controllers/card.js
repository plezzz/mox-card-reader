const {Card, User, Entries, Member, Recharge} = require('../models');
const {errorCourse} = require('../config/messages');
const uuid = require('uuid');
const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);


module.exports = {
    get: {

    },

    post: {
        cardData: function (req, res, next) {
            console.log('card read')
            let {
                cardType,
                cardName,
                serialNumber0,
                serialNumber1,
                serialNumber2,
                serialNumber3,
                serialNumber,
                deviceID
            } = req.body

            let serialNumberByValue = [serialNumber0, serialNumber1, serialNumber2, serialNumber3];

            Card.find({serialNumber: serialNumber}, function (err, result) {
                if (err) {
                    console.log(err);
                } else {
                    if (result.length === 0) {
                        Card.create({
                            cardName,
                            serialNumber,
                            serialNumberByValue,
                            title: uuid.v4()
                        }).then(function (el) {
                            res.json({item1: `Created new card with id ${el._id}`, item2: "Пешо", item3: 1})
                        })
                    } else if (result.length === 1) {
                        Member.findById(result[0].cardOwner).populate({
                            path: 'recharge',
                            options: {limit: 10, sort: {'createdAt': -1}}
                        })
                            .then(member => {
                                let periods = [];
                                member.recharge.forEach(recharge => {
                                    let range = moment().range(moment(recharge.from), moment(recharge.to))
                                    periods.push(range.contains(moment()));
                                })
                                if (periods.includes(true)) {
                                    Entries.create({deviceID}).then(function (el) {
                                        Card.updateOne({_id: result[0]._id}, {$push: {entries: el._id}}).then(function (el) {
                                            res.json({item1: `${member.firstName} ${member.lastName}`, item2: "Valid", item3: 1})
                                            console.log('valid card')
                                        })
                                    })
                                } else {
                                    res.json({item1: `${member.firstName} ${member.lastName}`, item2: "Not Valid", item3: 0})
                                    console.log('not valid card')
                                }
                            })



                    } else {
                        res.json({text: "Call Niki, Not unique serial number", item2: "item2val"});
                        //TODO: Is unique serialNumber or not
                    }
                }
            })
        },
    }
};


