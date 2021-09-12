import camelize from 'camelize';
import decamelizeKeys from 'decamelize-keys-deep';
import decamelizeString from 'decamelize';

// /**
//  * Умеет в строки и в объекты
//  * @param {object|string}
//  */
const decamelize = function (...args) {
    if (typeof args[0] === 'string') {
        return decamelizeString(args[0]);
    }

    if (!args[1]) {
        args[1] = '_'; // separator
    }

    return decamelizeKeys(...args);
};

export {
    camelize,
    decamelize,
};
