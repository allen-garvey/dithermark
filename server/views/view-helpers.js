import path from 'path';
import fs from 'fs/promises';

/**
 * @param {string} string
 * @param {Object.<string, string>} context
 */
export const render = (string, context) => {
    // remove comments, and then empty lines caused by removing comments
    const cleanedString = string
        .replace(/^\s*\/\/.*$/gm, '')
        .replace(/^\s*\r?\n$/gm, '');

    return Object.entries(context).reduce(
        (totalString, [key, value]) =>
            totalString.replace(new RegExp(`<\\?= ${key}; \\?>`, 'g'), value),
        cleanedString
    );
};

/**
 * @param {string} filename
 */
export const getTemplate = filename =>
    fs.readFile(
        path.join(import.meta.dirname, '..', 'templates', filename),
        'utf8'
    );
