# Running using Docker

This guide will show you how to run the project locally using Docker

## Dependencies

* Docker

## Getting started

* Open a terminal and `cd` into this project's `docker` folder
* Run `docker build -t dithermark .` to build the docker image
* Run `docker run -d -t -p 3000:80 dithermark` to run the docker image you just created in the background
* Open your browser to [localhost:3000](http://localhost:3000)
* Note that the random image feature will not work because the `unsplash-api-secret.php` file will be missing