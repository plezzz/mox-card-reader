const {Member} = require('../models');

module.exports = {
    get: {
        home(req, res, next) {
            if (req.user) {
                Member
                    .find({})
                    .lean()
                    .then(members => {
                        //console.log(members)
                        res.render('home/home', {members})
                    })
                    .catch(next);
            }
            res.render('home/home')
        }
    }
};
