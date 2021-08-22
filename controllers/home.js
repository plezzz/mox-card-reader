const {Member} = require('../models');

module.exports = {
    get: {
        home(req, res, next) {
            if (req.user) {

                let search = {}
                if (req.query.search) {
                    let searchArgs = req.query.search
                    console.log(searchArgs)
                    search = {title: {$regex: new RegExp(searchArgs, "i")}}
                }
            }
            Member
                .find({})
                .lean()
                .then(members => {
                    //console.log(members)
                    res.render('home/home', {members})
                })
                .catch(next);
        }
    }
};
