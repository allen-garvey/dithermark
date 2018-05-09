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


function formatRandomImageItem(imageItem){
    return {
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
}


function randomImageCallback(error, response, body) {
    if(!error && response.statusCode === 200){
        const json = JSON.parse(body);
        console.log(JSON.stringify(json.map(formatRandomImageItem)));
    }
    else{
        console.error(error);
    }
}

request(options, randomImageCallback);