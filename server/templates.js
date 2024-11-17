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

export const renderHome = () => {
    const shaders = [
        {
            id: 'webgl-vertex-shader',
            path: 'vertex/vertex.hlsl',
            context: {},
        },
    ];

    const shaderPromises = Promise.all(
        shaders.map((shader) =>
            getTemplate(path.join('shaders', shader.path)).then(
                (shaderText) =>
                    `<script type="webgl/vertex-shader" id="${
                        shader.id
                    }">${render(shaderText, shader.context)}</script>`
            )
        )
    ).then((shaderTexts) => shaderTexts.join(''));

    return Promise.all([shaderPromises, getTemplate('index.html')]).then(
        ([shaderContent, indexTemplate]) =>
            render(indexTemplate, {
                APP_NAME,
                APP_SUPPORT_SITE_FAQ_PAGE_URL: 'https://www.dithermark.com/faq',
                GITHUB_SOURCE_URL: 'https://github.com/allen-garvey/dithermark',
                shaderContent: shaderContent,
            })
    );
};
