const {Card, User, Entries, Member, Recharge} = require('../models');
const {errorCourse} = require('../config/messages');
const uuid = require('uuid');
const moment = require('moment');

let templateDir = (doc) => {
    return `member/${doc}`
};

module.exports = {
    get: {
        create(req, res) {
            res.render(templateDir('create'))
        },
        details(req, res, next) {
            let id = req.params.memberID;
            let isActiveCard = false
            let lastTenEntries;
            let activeCardDetails;
            let totalEntries = 0;
            //TODO: Get Json array from cookie, not just string

            let message = []
            if (req.cookies["error"] !== undefined) {
                message.push(req.cookies["error"])
            }
            res.clearCookie("error", {httpOnly: true});
            Member
                .findOne({_id: id})
                .populate('createdBy')
                .populate('editedBy')
                .populate({
                    path: 'cards',
                    populate: {
                        path: 'entries',
                        model: 'Entries',
                    },
                    options: {sort: {'createdAt': -1}}
                })
                .populate({
                    path: 'recharge',
                    populate: {
                        path: 'createdBy',
                        model: 'User'
                    },
                    options: {sort: {'createdAt': -1}}
                })
                .lean()
                .then(async member => {
                    let options = {member}
                    if (message.length > 0) {
                        options['message'] = message
                    }
                    let ids = [];
                    member.cards.forEach(card => {
                        let entries = card.entries.length;
                        card.enteriesCount = entries;
                        totalEntries += entries;
                        card.entries.forEach(entry => {
                            ids.push(entry._id)
                        })
                        if (card.status === true) {
                            isActiveCard = true
                            activeCardDetails = card
                        }
                    })
                    member.totalEntries = totalEntries;
                    await Entries.find({_id: {$in: ids}}).sort({createdAt: -1}).limit(10).lean().then((results) => {
                        options['entries'] = results
                    })
                    await Entries.find({_id: {$in: ids}}).sort({createdAt: -1}).lean().then((results) => {
                        options['entriesAll'] = results
                    })
                    if (isActiveCard) {
                        options['card'] = activeCardDetails
                        res.render(templateDir('details'), options)
                    } else {
                        Card
                            .find({cardOwner: {$eq: null}})
                            .lean()
                            .then(cards => {
                                options['cards'] = cards
                                res.render(templateDir('details'), options)
                            })
                    }
                })
        },
        delete(req, res, next) {
            let id = req.params.memberID;
            Member
                .deleteOne({_id: id})
                .then(() => {
                    res.redirect('/member/all')
                })
                .catch(next)
        },
        all(req, res, next) {

            Member
                .find({})
                .populate('createdBy')
                .populate('editedBy')
                .lean()
                .then(
                    members => {
                        res.render(templateDir('all'), {members})
                    }
                )
        },

    },

    post: {
        create(req, res, next) {
            const createdBy = req.user._id;
            let {firstName, lastName, email, phone, type} = req.body
            Member
                .create({firstName, lastName, email, phone, type, createdBy, editedBy: createdBy})
                .then((el) => {
                    res.redirect(`/member/details/${el._id}`)
                })
                .catch(next)
        },
        edit(req, res, next) {
            let id = req.params.memberID;
            const editedBy = req.user._id;
            let {firstName, lastName, email, phone, type} = req.body

            Member
                .updateOne({_id: id}, {
                        firstName, lastName, email, phone, type, editedBy
                    }, {runValidators: true}, function (err, result) {
                        if (err) {
                            if (err.code === 11000) {
                                next("Existing filed");
                            }
                        }
                    }
                )
                .then(() => {
                    res.status(204);
                    res.redirect(`/member/details/${id}`)
                })
                .catch(next)
        },
        addCard(req, res, next) {
            let id = req.params.memberID;
            const userID = req.user._id;
            let {serialNumber} = req.body;
            if (serialNumber === "#") {
                throw new Error(`Invalid serial number`)
            }
            Promise.all([
                Card.updateOne({_id: serialNumber}, {cardOwner: id}),
                Member.updateOne({_id: id}, {$push: {cards: serialNumber}}),
            ]).then((value => {
                res.redirect(`/member/details/${id}`)
            }))
        }
    }
};


