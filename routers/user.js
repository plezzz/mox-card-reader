const {user} = require('../controllers')
const {checkAuth, loginValidator} = require('../utils')


module.exports = (router) => {
    router.get('/login', checkAuth(false), user.get.login);
    router.get('/register', checkAuth(true), user.get.register);
    router.get('/logout', checkAuth(true), user.get.logout);

    router.post('/login', checkAuth(false), loginValidator, user.post.login)
    router.post('/register', checkAuth(true), user.post.register)

    return router
}
