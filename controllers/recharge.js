const {Card, User, Entries, Member, Recharge} = require('../models');
const {errorCourse} = require('../config/messages');
const uuid = require('uuid');
const {momentDates} = require('../utils');

let templateDir = (doc) => {
    return `recharge/${doc}`
};

module.exports = {
    get: {
    },

    post: {
        create: function (req, res, next) {
            // let id = req.params.memberID;
            const user = req.user._id;
            let {date, months, memberID} = req.body
            let {from, to} = momentDates.fromTo(date, months)
            Member.findOne({_id: memberID}).populate({
                path: 'recharge',
                options: {limit: 10, sort: {'createdAt': -1}}
            }).then(member => {

                let isInRange = momentDates.checkRange(member.recharge, from, to)
                if (!isInRange) {
                    Recharge
                        .create({from, to, months, createdBy: user, editedBy: user})
                        .then(recharge => {
                            Member.updateOne({_id: member}, {$push: {recharge: recharge}})
                                .then(() => {
                                    res.redirect(`/member/details/${member._id}`)
                                })
                        })
                } else {
                    throw new Error('The start date falls within a paid period')
                }
            }).catch(next)
        },
        edit: function (req, res, next) {
            const id = req.params.id;
            const user = req.user._id;
            let {date, months, member} = req.body
            let {from, to} = momentDates.fromTo(date, months);

            Member.findOne({_id: member}).populate({
                path: 'recharge',
                options: {limit: 10, sort: {'createdAt': -1}}
            }).then(member => {
                let filtered = member.recharge.filter(recharge => recharge._id != id);
                let isInRange = momentDates.checkRange(filtered, from, to)

                if (!isInRange) {
                    Recharge
                        .updateOne({_id: id}, {$set: {from, to, months, editedBy: user}})
                        .then(() => {
                            res.redirect(`/member/details/${member._id}`)
                        }).catch(next)
                } else {
                    next('Edit: The start date falls within a paid period')
                }
            }).catch(next)


        },
        delete: function (req, res, next) {
            const id = req.params.id;
            let {memberID} = req.body
            //.pull({ _id: 4815162342 }
            Promise.all([
                Member.updateOne({_id: memberID}, {$pull: {recharge: id}}),
                Recharge.deleteOne({_id: id})
            ]).then(
                res.redirect(`/member/details/${memberID}`)
            )
        }
    },

};


