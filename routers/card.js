const {checkAuth} = require("../utils");
const {card} = require('../controllers');

module.exports = (router) => {
    router.post('/card-data', card.post.cardData)

    return router
}
