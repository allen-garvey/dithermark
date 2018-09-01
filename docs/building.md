# Building

This is a guide for installing and building the project directly on you computer. For using with Docker, see `docker.md` in the `docs` directory.

## Building on Windows

This project uses `make` for building and generally makes assumptions that file paths follow POSIX conventions, and as such will not likely build on Windows as is. Therefore it is recommended that Windows users use either the Windows Subsystem for Linux when following this guide, or use Docker and follow the Docker directions. That being said, both webpack and PHP are cross-platform and the `make` commands only consist of: creating directories, running PHP cli and saving the output to a file, running webpack, and deleting files, so it should be technically possible to translate the `makefile` to an equivalent Windows version if you are so inclined.

## Dependencies for building

* POSIX compatible operating system (Linux, Unix, macOs)
* make
* PHP >= 7.0 (with `cli`, `json` and `ctype` extensions)
* Node >= 6.11
* npm

## Getting Started

* Clone or download this repository
* Open a command line and `cd` into the project directory
* Type `make install`
* Type `make` to compile the project
* (If you run into any errors at this point, first check that you have all the needed dependencies for the project. Then type `make reset` and `make` again, and see if that fixes your problem).
* Type `npm start` to start a local development server, after which you should be able to view the site at [localhost:3000](http://localhost:3000)

## Errors with building older versions

* If for some reason you are trying to build a very old version of this project (before `dithermark-vue-color` was added as an `npm` dependency) you might get a `make` error about `vue-color` missing. See `vue-color-missing-error.md` in the `docs` directory on how to fix this.