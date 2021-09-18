const {Member,Card} = require('../models');

module.exports = {
    get: {
        home(req, res, next) {
            if (req.user) {
               Promise.all([
                   Member.find({}).sort({createdAt: -1}).limit(5).lean(),
                   Card.find({}).sort({createdAt: -1}).limit(5).lean(),
               ]).then(value => {
                        let options = {
                            members: value[0],
                            cards: value[1],
                        }
                        res.render('home/dashboard', options)
                    })
                    .catch(next);
            }else {
                res.render('home/home')
            }
        }
    }
};
