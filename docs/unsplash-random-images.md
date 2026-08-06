# Setting up Unsplash random images

This is a guide for implementing the Unsplash random images feature, while following the [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines).

## Getting started

* Create an account at the [unsplash developers site](https://unsplash.com/developers) and create a new app.

* Add your app name to `UNSPLASH_APP_NAME` in `unsplash-secrets.js`.
* Add your app access key to `UNSPLASH_ACCESS_KEY` in `unsplash-secrets.js`.

## Generate random images JSON file for client

* Run `npm run seed:unsplash` to generate a json file with random images from Unsplash.

## API server setup

In order to comply with the [Unsplash API Guidelines](https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines), you will need to make an API call to Unsplash when a user downloads an Unsplash image. This guide shows you how to create a stand-alone Go http server to meet this requirement.

### Prerequisites

* Follow the instructions above to generate the Unsplash random images JSON file.

## Dependencies

* go >= 1.22
* make
* POSIX compliant system

### Directions

* In the `unsplash-api` directory run `make` to create a stand-alone http server in `unsplash-api/deploy`.

* Deploy the contents of `unsplash-api/deploy` to a server. Make sure to set the required environment variable `UNSPLASH_ACCESS_KEY`. You can also set `UNSPLASH_ACCESS_LOG_DIR` to set the directory where log files are written. You can specify the port via a command line argument.