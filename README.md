# Dithermark

An interactive, in-browser playground for image dithering and color quantization algorithms. Demo at [app.dithermark.com](https://app.dithermark.com).

## Electron

Standalone desktop Electron builds can be found [on the releases page.](https://github.com/allen-garvey/dithermark/releases). Directions for creating an Electron build can be found in `docs/electron.md`

## Documentation

* FAQ for *using* this project can be found at [dithermark.com/faq](https://dithermark.com/faq)
* Documentation for building and local development can be found in `docs/building.md`
* Guides for other common tasks, such as: creating a release build, setting up random images with Unsplash, and increasing the color count for color dithers can be found in the `docs` folder

## Known Limitations

* If the image size is greater than browser WebGL context parameter `MAX_TEXTURE_SIZE`, only the lower left corner of the image will be dithered
* A `UInt16Array` is used to transmit image width and height information to webworkers, meaning that images with a width or height greater than 65535 pixels in either dimension will not be processed correctly

## License

Dithermark is released under the MIT License. See license.txt for more details.