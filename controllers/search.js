const {Member,Card} = require('../models');

module.exports = {
    get: {
        search(req, res, next) {

            let q = req.query.q;
            let query = `/${q}/i`
            console.log(query)
            console.log(q)
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
                console.log(value)
                let members = value[0]
                let cards = value[1]
              //  console.log(cards)
                res.render(`search/search`, {members,cards,q})
            }))

        }
    }
};
