# Fastcgi setup

Dithermark can be run using PHP over fastcgi. Fastcgi is required if you are using the Unsplash random images feature, as it requires a PHP api endpoint when downloading images.  Another bonus of doing this is that when editing files in the `templates` directory, you can simply save the file and reload the browser to see your changes, without having to run `make` (this is especially helpful if you are doing heavy editing of the WebGL shaders). In combination with using `npm run watch` to live reload Sass and JavaScript file changes, this means you only need to run `make` in the following situations: at initial project setup, when editing files in the `inc` or `js_generated` directories, and when creating a release build.

## Dependencies

* Server with PHP support built-in (such as Apache with mod_php or MAMP) or server as reverse proxy for php-fpm (nginx, openresty, etc.)

## Instructions

These instructions assume you are using nginx or openresty, but the same principles should apply to any server

* Make sure you have correctly installed dithermark, and have run `make` at least once
* Setup your server of choice to serve and interpret PHP files
* Create a server block with the `public_html` directory in your cloned dithermark project as the root
* Make sure `index.php` is favored over `index.html` as the default index file. For nginx/openresty, this is done with the `index index.php index.html;` directive
* For a full example `nginx.conf` file, see the `nginx.conf` file in this project's `docker` directory