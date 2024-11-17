# Dithermark

An interactive, in-browser playground for image dithering and color quantization algorithms. Demo at [https://app.dithermark.com](https://app.dithermark.com)

## Electron

Standalone desktop Electron builds can be found [on the releases page.](https://github.com/allen-garvey/dithermark/releases)

## Dependencies for running

* Dithermark requires advanced browser features such as: ES6 syntax, typed arrays, webworkers, fetch api, canvas api, CSS variables and WebGL 1 (optional) and so requires a browser version from roughly the second half of 2017 or later
* Tested to work on at least Google Chrome 63, Mozilla Firefox 59, Apple Safari 11.1 and Microsoft Edge 16 (may work on earlier versions as well, but has not been tested and is not officially supported)

## Documentation

* FAQ for *using* this project can be found at [dithermark.com/faq](https://dithermark.com/faq)
* Documentation for building can be found in `docs/building.md`
* Guides for other common tasks, such as: creating a release build, setting up random images with Unsplash, and increasing the color count for color dithers can be found in the `docs` folder

## Known Limitations

* If the image size is greater than browser WebGL context paramater `MAX_TEXTURE_SIZE`, only the lower left corner of the image will be dithered
* A `UInt16Array` is used to transmit image width and height information to webworkers, meaning that images with a width or height greater than 65535 pixels in either dimension will not be processed correctly

## License

Dithermark is released under the MIT License. See license.txt for more details.