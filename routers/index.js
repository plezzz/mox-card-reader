const routers = [
    {search: require('./search')},
    {home: require('./home')},
    {user: require('./user')},
    {member: require('./member')},
    {recharge: require('./recharge')},
    {card: require('./card')},
    {error: require('./error')}
];

module.exports = (router) => {
    return routers.reduce((acc, curr) => {
        const key = Object.keys(curr)[0];
        return Object.assign(acc, {[key]: curr[key](router)});
    }, {});
};
