# Fastcgi setup

Dithermark can be run using PHP over fastcgi.  This allows you to simply save php and js files and reload the browser to see changes. In combination with using `npm run gup:watch` to live reload sass file changes, this means you only need to run `make` one time when installing the project to setup vue and dithermark-vue color, and then you never need to use it again until you are ready to create a release build. Fastcgi is also required if you are using the Unsplash random images feature, as it requires a PHP api endpoint when downloading images.

## Dependencies

* Server with PHP support built-in (such as Apache with mod_php or MAMP) or server as reverse proxy for php-fpm (nginx, openresty etc)

## Instructions

These instructions assume you are using nginx or openresty, but the same principles should apply to any server

* Make sure you have correctly installed dithermark, and have run `make` at least once
* Setup your server of choice to serve and interpret PHP files
* Create a server block with the `public_html` directory in your cloned dithermark project as the root
* Make sure `index.php` is favored over `index.html` as the default index file. For nginx/openresty, this is done with the `index index.php index.html;` directive