const {checkAuth} = require("../utils");
const {card} = require('../controllers');

module.exports = (router) => {
    router.get('/all-cards', checkAuth(true), card.get.all);
    router.get('/delete-card/:cardID', checkAuth(true), card.get.delete);

    router.post('/archive/:cardID', checkAuth(true), card.post.archive);
    router.post('/card-data', card.post.cardData);

    return router
}
