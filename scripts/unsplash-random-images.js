const request = require('request');
const unsplashKeys = require('../inc/unsplash-api-secret.json');

const unsplashApiUrlBase = 'https://api.unsplash.com';
const randomPhotoUrl = `${unsplashApiUrlBase}/photos/random?featured=true&count=30`;

const options = {
    url: randomPhotoUrl,
    headers: {
      'Accept-Version': 'v1',
      'Authorization': `Client-ID ${unsplashKeys.accessKey}`
    }
};

const modifierWordsSet = new Set(['a', 'an', 'at', 'black', 'and', 'white', 'black-and-white', 'photo', 'shot', 'drone', 'of', 'by', 'with', 'on', 'in', 'the', 'close', 'up', 'view', 'seen', 'from', 'top', 'bottom', 'over', 'under', 'background', 'foreground', 'overhead', 'form', 'very', 'small', 'large', 'big', 'little']);

function isModifierWord(word){
    if(word.endsWith('ly')){
        return true;
    }
    return modifierWordsSet.has(word);
}

function trimModifierWords(words, maxDescriptiveWords){
    const ret = [];
    for(let i=0,numDescriptiveWords=0;i<words.length;i++){
        const word = words[i];
        if(ret.length === 0 && isModifierWord(word)){
            continue;
        }
        ret.push(word);
        if(!isModifierWord(word)){
            numDescriptiveWords++;
            if(numDescriptiveWords === maxDescriptiveWords){
                return ret;
            }
        }
    }

    return ret;
}

function trimDescription(description){
    const maxDescriptiveWords = 4;
    let words = description.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/);

    if(words.length > maxDescriptiveWords){
        words = trimModifierWords(words, maxDescriptiveWords);
    }

    return words.join('-');
}

function formatRandomImageItem(imageItem){
    ret = {
        urls: {
            regular: imageItem.urls.regular,
            small: imageItem.urls.small,
        },
        download: imageItem.links.download_location,
        link: imageItem.links.html,
        author: {
            name: imageItem.user.name,
            link: imageItem.user.links.html,
        },
    };
    if(imageItem.description){
        ret.description = trimDescription(imageItem.description);
        // ret.description_full = imageItem.description;
    }

    return ret;
}


function randomImageCallback(error, response, body) {
    if(!error && response.statusCode === 200){
        // console.log(body);
        const json = JSON.parse(body);
        console.log(JSON.stringify(json.map(formatRandomImageItem)));
    }
    else{
        console.error(error);
    }
}

request(options, randomImageCallback);