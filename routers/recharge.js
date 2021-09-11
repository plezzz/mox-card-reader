const {recharge} = require('../controllers');
const {checkAuth} = require("../utils");

module.exports = (router) => {
    router.get('/creater', checkAuth(true), recharge.get.create);

    router.post('/creater', checkAuth(true),recharge.post.create);
    router.post('/editr/:id', checkAuth(true), recharge.post.edit);
    router.post('/deleter/:id', checkAuth(true), recharge.post.delete);

    return router
}
