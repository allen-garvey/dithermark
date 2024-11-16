import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

import { APP_NAME } from '../constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * @param {string} string
 * @param {Object.<string, string>} context
 */
const render = (string, context) => {
    // remove comments
    const cleanedString = string.replace(/^\s*\/\/.*$/gm, '');

    return Object.entries(context).reduce(
        (totalString, [key, value]) =>
            totalString.replace(new RegExp(`<\\?= ${key}; \\?>`, 'g'), value),
        cleanedString
    );
};

/**
 * @param {string} filename
 */
const getTemplate = (filename) =>
    fs.readFile(path.join(__dirname, 'templates', filename), 'utf8');

export const renderHome = () =>
    getTemplate('index.html').then((template) =>
        render(template, {
            APP_NAME,
            APP_SUPPORT_SITE_FAQ_PAGE_URL: 'https://www.dithermark.com/faq',
            GITHUB_SOURCE_URL: 'https://github.com/allen-garvey/dithermark',
        })
    );
