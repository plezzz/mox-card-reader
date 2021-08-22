const {checkAuth} = require("../utils");
const {search} = require('../controllers');

module.exports = (router) => {
    router.get('/result', checkAuth(true), search.get.search);

    return router
}
