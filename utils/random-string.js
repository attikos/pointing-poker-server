// let ALL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
let UPPERCASE_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function generateString(length, characters) {
    let result = '';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random()
 * charactersLength));
    }
    return result;
}

function generateNiceId() {
    return generateString(6, UPPERCASE_LETTERS);
}

module.exports = {
    generateString,
    generateNiceId,
};
