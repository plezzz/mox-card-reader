const {member} = require('../controllers');
const {checkAuth} = require("../utils");

module.exports = (router) => {
    router.get('/create', checkAuth(true), member.get.create);
    router.get('/details/:memberID', checkAuth(true), member.get.details);
    router.get('/edit/:memberID', checkAuth(true), member.get.edit);
    router.get('/all', checkAuth(true), member.get.all);

    router.post('/create', checkAuth(true), member.post.create)
    router.post('/edit/:memberID', checkAuth(true), member.post.edit);
    router.post('/add-card/:memberID', checkAuth(true), member.post.addCard);

    return router
}
