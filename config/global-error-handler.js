const {cookie} = require('./');
const {errorLogin} = require('../config/messages')()

module.exports = function globalErrorHandler(err, req, res, next) {

    let message = [err] || ['SERVER ERROR'];
    if (res.locals.validationErrorViewName) {
        res.render(res.locals.validationErrorViewName, {errors: err, ...req.body});
        return;
    }
    console.log("Error is:", err)
    console.log("Error code is:", err.code)
    console.log("Messages is:", err.message)
    console.log("Messages is:", err._message)

    if (err === "Existing filed" || err.code === 11000){
        if (err.code !== 10000){
            res.cookie("error", `Съществуващо поле`, {httpOnly: true});
        }else {
            res.cookie("error", `Съществуващо поле ${Object.keys(err.keyValue)} - ${Object.values(err.keyValue)}`, {httpOnly: true});
        }
        res.redirect(`/member/details/${getMemberID(req.originalUrl)}`)
        return;
    }


    if (err.message === 'The start date falls within a paid period') {
        res.cookie("error", "Зададената дата попада в платен период", {httpOnly: true});
        res.redirect(`/member/details/${req.body.memberID}`)
        return;
    }
    if (err.message === 'Invalid serial number') {
        res.cookie("error", "Невалиден сериен номер на картата", {httpOnly: true});
        res.redirect(`/member/details/${getMemberID(req.originalUrl)}`)
        return;
    }

    if (err.message === 'BAD_REQUEST') {
        message = 'Bad Request!';
    } else if (err.message === 'UNAUTHORIZED') {
        message = 'Нямате позволение да гледате това';
    }

    if (['jwt malformed'].includes(err.message)) {
        res.clearCookie(cookie);
        res.redirect('user/login');
        return;
    }

    if (Object.values(errorLogin).includes(err.message)) {
        render('user/login', message, true)
        return;
    }

    if (err._message === 'Login validation failed') {
        let messages = normalizeErrors(err.errors)
        render('user/login', messages, true)
        return;
    }

    if (err._message === 'Course validation failed' || err._message === 'Validation failed') {
        let messages = normalizeErrors(err.errors)
        render('member/create', messages, true)
        return;
    }
    if (err._message === 'User validation failed') {
        let messages = normalizeErrors(err.errors)
        render('user/register', messages, true)
        return;
    }

    if (err === 'The given phone is already is use!') {
        let messages = ['The given phone is already is use!']
        render('member/create', messages, true)
        return;
    }

    if (err.message === 'Member validation failed: email: Email is required!') {
        let messages = normalizeErrors(err.errors)
        render('member/create', messages, true)
        return;
    }


    function normalizeErrors(errors) {
        let messages = [];
        Object.values(errors).forEach(error => {
            messages.push(error.properties.message)
        });
        return messages
    }

    function render(path, message, obj = null) {
        obj ? obj = req.body : null;
        res.render(path, {message, obj});
    }

    function getMemberID(url) {
        let path = url.split('/')
        return path[3]
    }


    res.render('error/error', {message});
};
