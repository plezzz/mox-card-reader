const {Member,Card} = require('../models');

module.exports = {
    get: {
        search(req, res, next) {

            let q = req.query.q;
            let queryOptions = {$regex: q, $options: 'i'}

            Promise.all([
                Member.find({
                    $or: [
                        {firstName: queryOptions},
                        {lastName: queryOptions},
                        {email: queryOptions},
                        {phone: queryOptions}
                    ]
                }).populate('createdBy').lean(),
                Card.find({serialNumber: queryOptions}).lean()
            ]).then((value => {
                let members = value[0]
                let cards = value[1]
                let countMembers = members.length,countCards = cards.length,countTotal = countMembers + countCards
                res.render(`search/search`, {members,cards,q,countMembers,countCards,countTotal})
            }))

        }
    }
};
