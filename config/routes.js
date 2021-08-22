module.exports = (express, app) => {
    const routers = require('../routers')(express.Router());

    app.use('/search', routers.search);
    app.use('/home', routers.home);
    app.use('/user', routers.user);
    app.use('/member', routers.member);
    app.use('/card', routers.card);
    app.use('/recharge', routers.recharge);
    app.use('/', routers.home);
    app.use('*', routers.error)
}
