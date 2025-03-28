import path from 'path';
import fs from 'fs/promises';

import { UNSPLASH_ACCESS_KEY } from '../unsplash-secrets.js';
import { PUBLIC_HTML_DIR } from '../build/webpack.config.js';

const modifierWordsSet = new Set([
    'a',
    'an',
    'at',
    'black',
    'and',
    'white',
    'black-and-white',
    'photo',
    'shot',
    'image',
    'drone',
    'of',
    'to',
    'by',
    'with',
    'on',
    'in',
    'is',
    'into',
    'the',
    'close',
    'up',
    'down',
    'view',
    'seen',
    'from',
    'top',
    'bottom',
    'over',
    'under',
    'background',
    'foreground',
    'overhead',
    'form',
    'very',
    'small',
    'large',
    'great',
    'big',
    'little',
    'while',
    'when',
]);

/**
 * @param {string} word
 */
const isModifierWord = word =>
    /(ly|ed)$/.test(word) || modifierWordsSet.has(word);

/**
 * @param {string[]} words
 * @param {number} maxDescriptiveWords
 */
const trimModifierWords = (words, maxDescriptiveWords) => {
    const ret = [];
    let numDescriptiveWords = 0;

    for (const word of words) {
        //trim modifier words from beginning of description
        const isModifier = isModifierWord(word);
        if (ret.length === 0 && isModifier) {
            continue;
        }
        ret.push(word);

        if (!isModifier) {
            numDescriptiveWords++;
            if (numDescriptiveWords === maxDescriptiveWords) {
                break;
            }
        }
    }

    return ret;
};

/**
 * Trim description and remove spaces, as this is used for the default file name when saving
 * @param {string} description
 */
const trimDescription = description => {
    const maxDescriptiveWords = 4;
    let words = description
        .toLocaleLowerCase()
        // remove emojis
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/\//g, ' ')
        .replace(/[^a-z0-9\s-]/g, '')
        .split(/\s+/);

    if (words.length > maxDescriptiveWords) {
        words = trimModifierWords(words, maxDescriptiveWords);
    }

    return words.join('-');
};

const getRandomPhotosJson = () =>
    fetch(
        `https://api.unsplash.com/photos/random?featured=true&count=30&client_id=${UNSPLASH_ACCESS_KEY}`
    )
        .then(res => res.json())
        .then(data =>
            data.map(imageData => {
                const ret = {
                    urls: {
                        regular: imageData.urls.regular,
                        small: imageData.urls.small,
                    },
                    download: imageData.links.download_location,
                    link: imageData.links.html,
                    author: {
                        name: imageData.user.name,
                        link: imageData.user.links.html,
                    },
                };
                if (imageData.description) {
                    ret.description = trimDescription(imageData.description);
                }

                return ret;
            })
        );

const outputDir = path.join(PUBLIC_HTML_DIR, 'api');

const mkdirPromise = fs.mkdir(outputDir, { recursive: true });

Promise.all([getRandomPhotosJson(), mkdirPromise]).then(([data]) =>
    fs.writeFile(path.join(outputDir, 'unsplash.json'), JSON.stringify(data))
);
