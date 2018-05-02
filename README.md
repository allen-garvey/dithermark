# Dithermark



## Dependencies for building

* POSIX compatible operating system
* GNU Make
* PHP >= 7.0 (with `cli` extension)
* Node >= 6.11
* npm

## Optional dependencies required for release build

* git
* dmd >= v2.073.2

## Dependencies for running

* Recent version of either Google Chrome, Mozilla Firefox, Apple Safari or Microsoft Edge

## Getting Started

* Clone or download this repository
* Open a command line and `cd` into the project directory
* Type `make install` to setup the project for the first time
* Type `make` to compile the project
* (If you run into any errors at this point, first check that you have all the needed dependencies for the project. Then type `make clean`, `make install`, and `make` again, and see if that fixes your problem).
* Type `npm start` to start a local development server, after which you should be able to view the site at [localhost:3000](http://localhost:3000)

## Creating release build

To create a release build (JavaScript is minified and logging and debugging features are turned off or removed)

* Type `make release` (requires optional release dependencies)
* To reset everything, so you can create a debug build again, type `make reset` and `make`

## Know Issues

* If the image size is greater than browser WebGL context paramater `MAX_TEXTURE_SIZE`, only the lower left corner of the image will be dithered
* A `UInt16Array` is used to transmit image width and height information to webworkers, meaning that images with a width or height greater than 65535 pixels in either dimension will not be processed correctly

## License

Dithermark is released under the MIT License. See license.txt for more details.