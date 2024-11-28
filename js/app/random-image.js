/**
 * Module for getting random images using unsplash api
 */

import Fs from './fs.js';

let randomImageQueue = [];
let currentQueueIndex = 0;

//from: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        const randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        const temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

function loadRandomImageData() {
    return fetch('/api/unsplash.json')
        .then((res) => {
            return res.json();
        })
        .then((imageArray) => {
            randomImageQueue = shuffle(
                imageArray.map((image, i) => {
                    image.id = i;
                    return image;
                })
            );
        });
}

function getNextRandomImage() {
    const imageData = randomImageQueue[currentQueueIndex];
    currentQueueIndex++;
    if (currentQueueIndex >= randomImageQueue.length) {
        currentQueueIndex = 0;
    }
    return imageData;
}

function randomImageName(randomImage) {
    if (randomImage.description) {
        return randomImage.description;
    }
    if (randomImage.author.name) {
        return `${randomImage.author.name
            .toLowerCase()
            .split(/\s+/)
            .join('-')}-unsplash`;
    }
    return 'unsplash-random-image';
}

function openRandomImage(randomImageData, imageWidthHint, imageHeightHint) {
    //small image url width is generally <= 400px
    //regular image url width is generally > 900px
    const imageUrl =
        imageWidthHint > 800
            ? randomImageData.urls.regular
            : randomImageData.urls.small;
    return Fs.openImageUrl(imageUrl).then(({ image, file }) => {
        file.name = randomImageName(randomImageData);
        file.unsplash = randomImageData;
        return {
            image,
            file,
        };
    });
}

/**
 * 
 * @param {number} imageWidthHint 
 * @param {number} imageHeightHint 
 * @returns {Promise}
 */
export const getRandomImage = (imageWidthHint, imageHeightHint) => {
    if (randomImageQueue.length < 1) {
        return loadRandomImageData().then(() => {
            return openRandomImage(
                getNextRandomImage(),
                imageWidthHint,
                imageHeightHint
            );
        });
    } else {
        return openRandomImage(
            getNextRandomImage(),
            imageWidthHint,
            imageHeightHint
        );
    }
}

