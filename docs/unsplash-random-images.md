# Setting up Unsplash random images

## Additional Dependencies

* [Unsplash API Key](https://unsplash.com/developers)
* PHP >= 7.0 running on your server

## Generate random images Json file for client

* Copy `inc/unsplash-api-secret-example.php` by running `cp inc/unsplash-api-secret-example.php inc/unsplash-api-secret.php` and replace `YOUR_ACCESS_KEY_HERE` with your Unsplash API access key
* Run `make unsplash_api` to generate a json file with random images from Unsplash

## DigitalOcean serverless function setup

* Run `make serverless` to generate a PHP serverless function

* Create a php serverless function in the DigitalOcean control plane

* Paste contents of `inc/serverless/build/unsplash-download.php` as the function body

* Set `UNSPLASH_ACCESS_KEY` as an environment variable

* Copy the serverless function url, and set `UNSPLASH_DOWNLOAD_URL` in `inc/unsplash-api-secret.php`