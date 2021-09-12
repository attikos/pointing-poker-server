const camelize = require('camelize');
const decamelizeKeys = require('decamelize-keys-deep');
const decamelizeString = require('decamelize');

// /**
//  * Умеет в строки и в объекты
//  * @param {object|string}
//  */
const decamelize = (...args) => {
    if (typeof args[0] === 'string') {
        return decamelizeString(args[0]);
    }

    if (!args[1]) {
        args[1] = '_'; // separator
    }

    return decamelizeKeys(...args);
};

const exportData = {
    camelize,
    decamelize,
};

module.exports = exportData;
