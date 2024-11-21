# Building

This is a guide for installing and building the project directly on you computer.

## High-level overview of build system

This project using webpack to bundle and compile JavaScript and Sass files, PHP cli to combine various file partials (mostly WebGL shaders) into the `index.html` file as well as generating specialized JavaScript modules for both the JavaScript main application and web worker, and `make` to coordinate everything. The reason that PHP is needed to generate JavaScript files is that certain constants (most notably the maximum number of colors allowed by the color dither) needs to be coordinated between the JavaScript files and the WebGL shaders, since the shaders need the maximum number of colors to be a compile-time constant. In addition, using the JavaScript main application and web worker need to share certain information about the dither and color quantization algorithms, and defining them in PHP means they only have to be defined once in the PHP file, rather than twice across two separte js files. As for why the application and web worker can't share a single module defining the dither and color quantization algorithms, the reason is that the application module requires functions/modules that only are included in the application bundle and vice versa for the webworker. 

## Building on Windows

This project uses `make` for building and generally makes assumptions that file paths follow POSIX conventions, and as such will not likely build on Windows as is. Therefore it is recommended that Windows users use the Windows Subsystem for Linux when following this guide.

## Dependencies for building

* Node.js >= 22

## Getting Started

* Clone or download this repository
* Open a command line and `cd` into the project directory
* Type `make install`
* Type `make` to compile the project
* (If you run into any errors at this point, first check that you have all the needed dependencies for the project. Then type `make reset` and `make` again, and see if that fixes your problem).
* Type `npm start` to start a local development server, after which you should be able to view the site at [localhost:3000](http://localhost:3000)

## Creating release build

To create a release build (JavaScript is minified and logging and debugging features are disabled or removed)

* Type `make reset`
* Type `make release`
* To reset everything, so you can create a debug build again, type `make reset` and `make`
* A release build without PHP dependencies is also created in `release`
