# Dithermark

An interactive, in-browser playground for image dithering and color quantization algorithms. Demo at [app.dithermark.com](https://app.dithermark.com).

## Running offline

Standalone desktop builds can be found [on the releases page.](https://github.com/allen-garvey/dithermark/releases).

## Documentation

* FAQ for *using* this project can be found at [dithermark.com/faq](https://dithermark.com/faq)
* Documentation for building and local development can be found in `docs/building.md`
* Guides for other common tasks, such as: creating a release build, setting up random images with Unsplash, and increasing the color count for color dithers can be found in the `docs` folder

## Known Limitations

* During WebGL dithering the image is stored in a single texture. This means that if the size of the image is greater than the browser WebGL context parameter `MAX_TEXTURE_SIZE`, only the lower left corner of the image will be dithered.

## License

Dithermark is released under the MIT License. See license.txt for more details.