# How to Add an Ordered Dither Pattern

An ordered matrix can be thought of as a pattern that is used for the ordered dithers. This guide will walk you through how to add your own custom pattern for dithering.

## Overview

* An ordered matrix can be thought of as a two dimensional array, though it is represented as a one dimensional `Uint8Array`

* An ordered matrix has `dimensions` which can be thought of as the length of the sides of a square. The total length of the ordered matrix must be the same as `dimensions * dimensions`

* The `dimensions` must be an integer in the range of 2..16 inclusive. While technically any integer in this range *should* work only powers of 2 (2, 4, 8, 16) have actually been tested (use other values at your own risk!).

* The values inside an ordered matrix should be integers in the range 0..(`length-1`) inclusive.

* A value of `length/2` can be thought of as roughly leaving a pixel unchanged, similar to applying the closest color on a pixel. Values greater than this can be thought of as roughly increasing the values of a pixel, while values lower than this decrease the values of a pixel.

* Thus, for an ordered matrix to produce the most *realistic* results possible, you want the average of all the values in your ordered matrix to be as close to `length/2` as possible. If you don't do this, everything will still work, but your results might be, shall we say *interesting*.

## Creating a pattern from an image

If you don't want to create an array of numbers by hand, you can convert an image into a matrix.

* Create an image of 2x2, 4x4, 8x8 or 16x16 pixels. Color the image how you like. Using grayscale values will give you the most accurate preview of the pattern, but you can use color values.

* Export your image as a png file into `scripts/images`.

* In the file `scripts/image-to-matrix.js` edit the `imageName` variable to be the name of your image.

* Run `npm run image-to-matrix`.

* The array saved from the script above can be used as your matrix values in the implementation steps below.

## Implementation

* In `js_src/shared/bayer-matrix.js` create a function with the type `(dimensions: int) => Uint8Array[dimensions*dimensions]`. It should take a single integer parameter that is the dimensions of the matrix, and return a Uint8Array of length `dimensions * dimensions`. All values in the array should be in the range 0..(`length-1`) inclusive, as discussed in the overview section.

* The dimensions parameter is there in case you are programmatically generating your matrix, or are reusing the same function to return multiple matrixes.

* At the bottom of the file, export your function.

* Now go to `js_src/shared/models/dither-algorithms.js` and find the function `getOrderedDitherPatterns()`. Add your pattern as an entry to the returned array. The `title` will be used in the UI, the `pattern` should be the name of your exported function in `bayer-matrix.js`, and the dimensions should be the dimensions of your pattern as discussed above.

* An that's it! If you follow the directions in `building.md` for developing locally, you should now see your matrix pattern as an available option!

* If you see an error in the console when trying to use you pattern when WebGL is enabled saying something similar to `RangeError: Source is too large`, that means your function is returning an array whose length is not the same as `dimensions*dimensions` (despite the error saying the source is too large, the array your are returning might actually be too small).

## Note about the Yliluoma 1 dither

* The Yliluoma 1 dither is particularly resource intensive, even with WebGL enabled, and so is not enabled for patterns with dimensions larger than 8. (To change this, you can increase the `YLILUOMA_1_ORDERED_MATRIX_MAX_DIMENSIONS` constant in `constants.js`, though this is not recommended).
