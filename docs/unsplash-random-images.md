# Setting up Unsplash random images

This is a guide for implementing the Unsplash random images feature, while following the [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines).

## Getting started

* Create an account at the [unsplash developers site](https://unsplash.com/developers) and create a new app.

* Add your app name to `UNSPLASH_APP_NAME` in `unsplash-secrets.js`.
* Add your app access key to `UNSPLASH_ACCESS_KEY` in `unsplash-secrets.js`.

## Generate random images JSON file for client

* Run `npm run seed:unsplash` to generate a json file with random images from Unsplash.

## DigitalOcean serverless function setup

In order to comply with the [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines), you will need to make an API call to Unsplash when a user downloads an Unsplash image. This guide shows you how to use [DigitalOcean functions](https://www.digitalocean.com/products/functions) to implement an API.

### Prerequisites

* Follow the instructions above to generate the Unsplash random images JSON file.

### Directions

* Run `npm run deploy` to generate a PHP serverless function.

* Create a new PHP function in the DigitalOcean control plane.

* Paste the contents of `serverless/unsplash-download.php` as the function source.

* Set `UNSPLASH_ACCESS_KEY` as an environment variable, using the value from `unsplash-secrets.js`

* Copy the serverless function url, and set `UNSPLASH_DOWNLOAD_URL` in `unsplash-secrets.js`.