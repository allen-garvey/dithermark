# Changelog

## HEAD

### Features

* Add color palette

## 5.1 2026-01-09 [Commit 709ae55](https://github.com/allen-garvey/dithermark/commit/709ae553025dc8944baa436c54b76e3fe2689952)

### Features

* Add sharpen (unsharp mask) image filter
* Add CIE XYZ color comparison for dithering and outline filters

### Bugs

* Update all WebGL shaders to require highp precison to fix bugs on mobile devices (such as simplex)

## 5.0 2025-11-01 [Commit d02446b](https://github.com/allen-garvey/dithermark/commit/d02446bfbe8985e0b1b6feec651f95681e806b3c)

### Features

* Add Oklab and CIE lab color comparisons for both dithering and outline filters, using both Euclidean and taxicab distance formulas

* Add blue noise ordered dither pattern

* Add performance option to only use one webworker to reduce memory usage

### Technical

* Update WebGL code to WebGL 2

* Add more accurate performance measurement for WebGL code in debug mode

* Increase webworker dithering performance by roughly 10% by reducing memory allocations and hard-coding array indexes

* Increase error propagation color dithering performance by 33%-100% by increasing memory locality and reducing memory allocations

## 4.1.1 2025-03-16 [Commit 83743ea](https://github.com/allen-garvey/dithermark/commit/83743ea996b875a1200404323ca9e242b386b1e8)

### Bugs

* Fix color picker not being scrolled into view when opened.

* Fix color picker attention animation not being triggered when color picker is opened, and inactive controls are clicked.

## 4.1 2025-02-13 [Commit 220d0b5](https://github.com/allen-garvey/dithermark/commit/220d0b573011f59edda41ff19c10070c0063fefb)

### Features

* Add simplex dither algorithm, and simplex variations to ordered dithers.

* Add smile, heart and stars ordered dither patterns.

* Allow brightness, contrast and saturation image filters to go to 300% instead of 200%.

* Add ability to batch convert images to video.

* Add ability to open video and either export current image or entire video.

* Add ability to preview opened batch images before exporting, instead of exporting immediately.

### UI / UX

* Add alert role to alerts to improve accessibility

* Increase link text color contrast in dark color themes.

* Change buttons and form inputs to use dark colors in dark color themes.

### Bugs

* Fix hue, hue & lightness and weighted hsl color comparison modes in color dither not working correctly.

* Fix zoom range control growing too wide at phone and tablet sizes.

* Fix exception when trying to open non-image file from device.

* Fix exporting on enter key pressed in export file name input when it shouldn't be allowed.

* Fix controls being visible during batch export.

* Fix reset colors button in BW Dither tab height being stretched.

### Technical

* Replace standalone Electron builds with local http server and compiled static assets. This avoids security warning on Mac, and requires less memory to run, removes the need for compilation for Mac, Linux and BSD, and allows cross-compilation for Windows and Windows ARM.

* Change to dart-sass from node-sass for scss compilation.

* Change from using PHP for templates and generating JavaScript to using JavaScript for everything. This removes the dependency on PHP and make for local development, and the dependency on sed and rsync for Electron development. This allows for easier local development on Windows, as well as faster development, as templates don't need to be recompiled. It also makes it simpler to add additonal dither and color quantization algorithms.

* Add script to convert an image to an ordered dither pattern.

* Improve webworker dither performance via simplifying some code.

* Move dithermark-vue-color directly into project, instead of loading via npm to simplify development.

* Refactor opening images to use ImageBitmap instead of ObjectURL. This means opening images uses less memory, however it also means the [lowest supported iOS version is 15.](https://caniuse.com/?search=createImageBitmap)

## 3.2 2024-03-03 [Commit cd1d5c3](https://github.com/allen-garvey/dithermark/commit/cd1d5c3f9b3189b06edbf9f1d473a36bc9224073)

### Bugs

* Fix outline filter color picker not working due to not being updated to Vue 3 syntax

### Technical

* Change Unsplash API endpoint to be a serverless function

## 3.0 2024-02-29 [Commit 6ae2c8c](https://github.com/allen-garvey/dithermark/commit/6ae2c8c9ec2dad5b59171faea289cada479e1189)

### Features

* Add adaptive threshold dither algorithm to black and white dither tab

* Add ability to batch convert images

* On iOS exported images now download directly instead of opening in a new tab (this means iOS 13 is the minimum required iOS version, since that is required for [download attributes](https://caniuse.com/?search=download)).

### UI / UX

* Persist preferred export file type in user settings

## 2.1 2023-05-23 [Commit 0129f6f](https://github.com/allen-garvey/dithermark/commit/0129f6f8f0926e0da173904627cbed1d5a01d0af)

### Features

* Add webp lossless as export file type option

* Add color palettes.

* Add stand-alone app using Electron

### UI / UX

* Change all button-like elements to html buttons to improve accessibility

* Add tooltips to performance settings in the settings tab

### Technical

* Update to vue 3

## 2018-09-05 [Commit e7bdb93](https://github.com/allen-garvey/dithermark/commit/e7bdb93b3c72e493b2ab4122333b52f2239aa5fc)

### Features

* Add lightness as comparison option for outline filters

### Bugs

* Fix export not working on Firefox

## 1.0 2018-09-04 [Commit dfefd3b](https://github.com/allen-garvey/dithermark/commit/dfefd3b782a78ecdd22f4f4f034925d908f012f7)

Initial release of Dithermark