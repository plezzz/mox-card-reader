const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const getUserModel = require('./User');
const getEntriesModel = require('./Entries');
const getMemberModel = require('./Member');
const getRechargeModel = require('./Recharge');
const getCardModel = require('./Card');

module.exports = {
    User: getUserModel(mongoose, bcrypt),
    Entries: getEntriesModel(mongoose),
    Member: getMemberModel(mongoose),
    Recharge: getRechargeModel(mongoose),
    Card: getCardModel(mongoose)
};
