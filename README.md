# Dithermark

An interactive, in-browser demonstration of image dithering and color quantization algorithms. Demo at [https://app.dithermark.com](https://app.dithermark.com)

## Dependencies for running

* Dithermark requires advanced browser features such as: ES6 syntax, typed arrays, webworkers, fetch api, canvas api, CSS variables and WebGL 1 (optional) and so requires a browser version from roughly the second half of 2017 or later
* Tested to work on at least Google Chrome 63, Mozilla Firefox 59, Apple Safari 11.1 and Microsoft Edge 16 (may work on earlier versions as well, but has not been tested and is not officially supported)

## Dependencies for building

* POSIX compatible operating system
* make
* PHP >= 7.0 (with `cli` extension)
* Node >= 6.11
* npm

## Getting Started

* Clone or download this repository
* Open a command line and `cd` into the project directory
* Type `make install`
* Type `make` to compile the project
* (If you run into any errors at this point, first check that you have all the needed dependencies for the project. Then type `make reset` and `make` again, and see if that fixes your problem).
* Type `npm start` to start a local development server, after which you should be able to view the site at [localhost:3000](http://localhost:3000)

## Known Issues

* If the image size is greater than browser WebGL context paramater `MAX_TEXTURE_SIZE`, only the lower left corner of the image will be dithered
* A `UInt16Array` is used to transmit image width and height information to webworkers, meaning that images with a width or height greater than 65535 pixels in either dimension will not be processed correctly

## Other resources

* Guides for other common tasks, such as: creating a release build, random images with Unsplash, and increasing the color count for color dithers can be found in the `docs` folder

## License

Dithermark is released under the MIT License. See license.txt for more details.