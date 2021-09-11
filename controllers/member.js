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
            let activeCard = false
            let lastTenEntries = [];
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
                        model: 'Entries'
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
                .then(member => {
                    let options = {member}
                    if (message.length > 0) {
                        console.log(message.length)
                        console.log(message)
                        options['message'] = message
                    }

                    member.cards.forEach(card=>{
                        console.log(card.entries)
                        lastTenEntries.concat(card.entries)
                        if (card.status === true){
                            activeCard = true
                        }
                    })
                    console.log(lastTenEntries)
                    if (activeCard) {

                        // Card.findOne({_id: member.card[0]._id})
                        //     .lean()
                        //     .populate({
                        //         path: 'entries',
                        //         options: {
                        //             limit: 10,
                        //             sort: {createdAt: -1},
                        //             // skip: req.params.pageIndex*2
                        //         }
                        //     })
                        //     .limit(1)
                        //     .then(card => {
                        //         // card.entries.sort(function (a, b) {
                        //         //     var c = new Date(a.createdAt);
                        //         //     var d = new Date(b.createdAt);
                        //         //     return c - d;
                        //         // });
                        //         options['card'] = card
                        //         //   console.log(options)
                        //         res.render(templateDir('details'), options)
                        //     })

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
        edit(req, res, next) {
            let id = req.params.memberID;

            Member
                .findOne({_id: id})
                .lean()
                .then(member => {
                    res.render(templateDir('edit'), member)
                })
                .catch(next)
        },
        delete(req, res, next) {
            let id = req.params.courseId;
            Course
                .deleteOne({_id: id})
                .then(() => {
                    res.redirect('/')
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
                        res.render(templateDir('all'),{members})
                    }
                )
        }
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
                            console.log(err)
                            if (err.code === 11000) {
                                next(errorCourse.alreadyInUseObj);

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
            //  console.log("Serial Number: " + cardID, "User: " + userID, "Member: " + id)
            Promise.all([
                Card.updateOne({_id: serialNumber}, {cardOwner: id}),
                Member.updateOne({_id: id}, {$push: {card: serialNumber}}),
            ]).then((value => {
                res.redirect(`/member/details/${id}`)
            }))
        }
    }
};


