# Setting up Unsplash random images

## Additional Dependencies

* [Unsplash API Key](https://unsplash.com/developers)
* PHP >= 7.0 running on your server

## Directions

* Copy `inc/unsplash-api-secret-example.php` by running `cp inc/unsplash-api-secret-example.php inc/unsplash-api-secret.php` and replace `YOUR_ACCESS_KEY_HERE` with your Unsplash API access key
* Run `make unsplash_api` to generate a json file with random images from Unsplash