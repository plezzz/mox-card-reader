const required = function (filed) {
    return `${filed} is required!`;
};
module.exports = (data = null) => {
    return {
        db: 'Connected to database successfully!',
        app: `Server is ready, listening on port: ${data}...`,
        errorRegister: {
            username:  required('Username'),
            password:  required('Password'),
            repeatPassword: required('Repeat password'),
            dontMatch: 'The repeat password should be equal to the password',
            alreadyInUse: 'The given username is already is use!',
            alreadyInUseObj: {
                _message: "User validation failed",
                errors: {error: {properties: {message: 'The given username is already is use!'}}}
            },
            minLengthUsername: 'The username should be at least 4 characters long',
            minLengthPass: 'The password should be at least 4 characters long',
            containsCharUsername: 'The username should consist only english letters and digits!',
            containsCharPassword: 'The password should consist only english letters and digits!',
        },
        errorLogin: {
            password: 'The provided username or password does not matched'
        },
        errorCourse: {
            alreadyInUse: 'The given title is already is use!',
            name: required('Name'),
            minTitle: 'The title should be at least 4 characters',
            imageURL: 'Image URL' + required,
            imageURLHTTP: 'The imageURL should starts with http or https',
            description: 'Description' + required,
            maxDesc: 'The description must be no longer than 50 characters',
            minDesc: 'The description should be at least 20 characters long',
            duration: 'Duration' + required,
            alreadyInUseObj: {
                _message: "Course validation failed",
                errors: {error: {properties: {message: 'The given title is already is use!'}}}
            },
        },
        errorMember:{
            alreadyInUseEmail: 'The given email is already is use!',
            alreadyInUsePhone: 'The given phone is already is use!',
            email: required('Email'),
            phone: required('Phone'),
        }
    }
};
