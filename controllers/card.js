const {Card, Entries, Member} = require('../models');
const {errorCourse} = require('../config/messages');
const uuid = require('uuid');
const Moment = require('moment');
const MomentRange = require('moment-range');

const moment = MomentRange.extendMoment(Moment);

let templateDir = (doc) => {
    return `card/${doc}`
};

module.exports = {
    get: {
        all: function (req, res, next) {
            Card
                .find({})
                .populate('cardOwner')
                .lean()
                .then(cards => {
                    res.render(templateDir('all'), {cards})
                })
        },
        delete: function (req, res, next) {
            let cardID = req.params.cardID;
            Card
                .findOne({_id: cardID})
                .lean()
                .then(card => {
                    card.entries.forEach(entry => {
                        Entries.findOne({_id: entry._id}).remove().exec()
                    })

                })
            Card
                .findOne({_id: cardID}).deleteOne().exec().then(() => {
                res.redirect('/card/all-cards');
            })
        }
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
            console.log("Card data type: ", cardType);
            console.log("Card data type: ");
            console.log(cardType);

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
                            res.json({item1: `Created new card with id ${el._id}`, item2: "????????", item3: 2})
                        })
                    } else if (result.length === 1) {
                        if (result[0].cardOwner) {
                            Member
                                .findById(result[0].cardOwner)
                                .populate({
                                    path: 'recharge',
                                    options: {limit: 10, sort: {'createdAt': -1}}
                                })
                                .then(member => {
                                    if (member === null){
                                        res.json({
                                            item1: `Error:`,
                                            item2: "Card is archive without card holder",
                                            item3: 3
                                        })
                                        return
                                    }
                                    let periods = [];
                                    member.recharge.forEach(recharge => {
                                        let range = moment().range(moment(recharge.from), moment(recharge.to))
                                        periods.push(range.contains(moment()));
                                    })
                                    if (periods.includes(true) && result[0].status) {
                                        Entries.create({deviceID}).then(function (el) {
                                            Card.updateOne({_id: result[0]._id}, {$push: {entries: el._id}}).then(function () {
                                                res.json({
                                                    item1: `${member.firstName} ${member.lastName}`,
                                                    item2: "Valid",
                                                    item3: 1
                                                })
                                            })
                                        })
                                    } else {
                                        res.json({
                                            item1: `${member.firstName} ${member.lastName}`,
                                            item2: "Not Valid",
                                            item3: 0
                                        })
                                    }
                                })
                        }else {
                            res.json({
                                item1: `Error:`,
                                item2: "Card is not assigned",
                                item3: 3
                            })
                        }
                    } else {
                        res.json({item1: "Call Niki, Not unique serial number", item2: "item2val"});
                        //TODO: Is unique serialNumber or not
                    }
                }
            })
        },
        archive(req, res, next) {
            let id = req.params.cardID;
            let memberID = req.body.memberID;
            console.log(id,memberID)
            Card.findOneAndUpdate({_id: id}, {status: false})
                .then(
                    res.redirect(`/member/details/${memberID}`)
                )
        }
    },

};


