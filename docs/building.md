# Building

This is a guide for installing and building the project directly on you computer.

## Dependencies for building

* Node.js >= 22
* ffmpeg (if using ffmpeg server for video export)

## Initial setup

* Clone or download this repository
* Open a command line and `cd` into the project directory
* Run `cp unsplash-secrets.example.js unsplash-secrets.js` to copy `unsplash-secrets.example.js` to `unsplash-secrets.js`
* Run `npm install`

## Developing locally

* Run `npm start`
* Open your browser to [localhost:3000](http://localhost:3000)
* If the page looks broken, you might have loaded the page before webpack compilation has completed. Check your console output to see if the webpack compilation completed message is there, and try reloading the page.

## Creating a static development build

* Run `npm run build`
* A static version of the site is in the `deploy/public_html` directory

## Creating a static production build

* Run `npm run deploy`
* A static version of the site is in the `deploy/public_html` directory
