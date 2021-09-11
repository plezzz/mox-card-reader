const {checkAuth} = require("../utils");
const {card} = require('../controllers');

module.exports = (router) => {
    router.get('/allc', checkAuth(true), card.get.all);

    router.post('/card-data', card.post.cardData)

    return router
}
