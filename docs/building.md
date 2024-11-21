# Building

This is a guide for installing and building the project directly on you computer.

## Dependencies for building

* Node.js >= 22

## Initial setup

* Clone or download this repository
* Open a command line and `cd` into the project directory
* Run `cp unsplash-secrets.example.js unsplash-secrets.js` to copy `unsplash-secrets.example.js` to `unsplash-secrets.js` by running `cp unsplash`
* Run `npm install`

## Developing locally

* Run `npm start`
* In another terminal window or tab run `npm run watch`
* Open your browser to [localhost:3000](http://localhost:3000)

## Creating a static development build

* Run `npm run build`
* A static version of the site is in the `public_html` directory

## Creating a static production build

* Run `npm run deploy`
* A static version of the site is in the `public_html` directory
