let errors = {
    mName: {
        code: 'mName',
        msg: 'missing name'
    },
    mPW: {
        code: 'mPW',
        msg: 'missing password'
    },
    mPW2: {
        code: 'mPW2',
        msg: 'missing password2'
    },
    eName: {
        code: 'eName',
        msg: 'name is empty'
    },
    ePW: {
        code: 'ePW',
        msg: 'password is empty'
    },
    ePW2: {
        code: 'ePW2',
        msg: 'password2 is empty'
    },
    uneqPW: {
        code: 'uneqPW',
        msg: 'passwords unequal'
    },
    wrongPW: {
        code: 'wrongPW',
        msg: 'wrong password'
    },
    noRoom: {
        code: 'noRoom',
        msg: `room closed`
    },
    alreadyLoggedIn: {
        code: 'alreadyLoggedIn',
        msg: 'user already logged in'
    }
}

/**
 * Returns the error with @code
 * 
 * @param {string} code 
 */
function genError(code) {
    return { error: errors[code] }
}

module.exports = {
    errors,
    genError
}