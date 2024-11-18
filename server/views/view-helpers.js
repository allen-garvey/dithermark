import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
export const getTemplate = (filename) =>
    fs.readFile(path.join(__dirname, '..', 'templates', filename), 'utf8');
