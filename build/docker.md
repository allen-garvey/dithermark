# Running using docker

## Dependencies

* Docker

## Getting started

* Open a terminal and `cd` into this project's `docker` folder
* Run `docker build -t dithermark .`
* Run `docker run -d -t -p 3000:80 dithermark`
* Open your browser to [localhost:3000](http://localhost:3000)
* Note that the random image feature will not work because the `unsplash-api-secret.php` file will be missing