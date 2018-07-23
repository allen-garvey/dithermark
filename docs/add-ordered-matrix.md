# Add (a new) Ordered Matrix

An ordered matrix can be thought of as a pattern that is used for the ordered dithers. In this project the term "Bayer Matrix" is used for historical reason, since the Bayer pattern was implemented first, and it was too much effort to change this (interestingly, the [ordered dithering Wikipedia article](https://en.wikipedia.org/wiki/Ordered_dithering) lists bayer matrix as a generic term for this anyway). This guide will walk you through how to do this.

## Overview

* An ordered matrix can be thought of as a two dimensional array, though it is represented as a one dimensional `Uint8Array`

* An ordered matrix has `dimensions` which can be thought of the length of the sides of a square. The total length of the ordered matrix must be the same as `dimensions * dimensions`

* The `dimensions` must be an integer in the range of 2..16 inclusive. While technically any integer in this range *should* work only powers of 2 (2, 4, 8, 16) have actually been tested (use other values at your own risk!).

* The values inside an ordered matrix should be integers in the range 0..(`length-1`) inclusive.

* A value of `length/2` can be thought of as roughly leaving a pixel unchanged, similar to applying the closest color on a pixel. Values greater than this can be thought of as roughly increasing the values of a pixel, while values lower than this decrease the values of a pixel.

* Thus, for an ordered matrix to produce the most *realistic* results possible, you want the average of all the values in your ordered matrix to be as close to `length/2` as possible. If you don't do this, everything will still work, but your results might be, shall we say *interesting*.

## Actually adding your matrix

* In `js_src/shared/bayer-matrix.js` create a function with the signature `function myBayerFunc(dimensions: int): Uint8Array[dimensions*dimensions]`. It should take a single integer parameter that is the dimensions of the matrix, and return a Uint8Array of length `dimensions * dimensions`. All values in the array should be in the range 0..(`length-1`) inclusive, as discussed in the overview section.

* The dimensions parameter doesn't need to be used, it is just there in case you are programattically generating your matrix, or you are reusing the same function to return multiple matrixes.

* At the bottom of the file, export your function. The function name should be in camel case format. Take care when naming your export, as it is used to automagically name your pattern in the UI. (For instance myCoolFunction would turn into "My Cool Function")

* Now go to `inc/models/algorithm-model.php` and find the function `getOrderedMatrixPatterns()`. You need to add your new function to the returned array. The ordered of the patterns in the returned array is the same order that is used for the UI. You need to add a new entry in this format: `'UNIQUE_KEY' => new OrderedMatrixPattern('nameOfYourExportedFunction', dimensions),` (Dimensions should be the dimensions your function is expecting).

* An that's it! If you run `make` (or simply reload the page if using PHP over fastcgi) you should now see your matrix pattern as an available option!

* If you see an error in the console when trying to use you pattern when WebGL is enabled saying something similar to `RangeError: Source is too large`, that means your function is returning an array whose length is not the same as `dimensions*dimensions` (despite the error saying the source is too large, the array your are returning might actually be too small).

## Note About the Yliluoma Dithers

* You may have noticed that the Yliluoma dithers did not use your new pattern by default. This is because the Yliluoma dithers are more resource intensive, and so you have to manually enable the pattern for them. Note that the Yliluoma 1 dither is particularly resource intensive, even with WebGL enabled, and so will not work with patterns with `dimensions > 8` by default. (To enable this, you have to change the `YLILUOMA_1_ORDERED_MATRIX_MAX_LENGTH` constant in `inc/config.php`, though this is not recommended).

* To enable your ordered matrix pattern with the Yliluoma dithers, edit the `$yliluoma1PatternKeys` and/or `$yliluoma2PatternKeys` associative arrays in the `colorOrderedDitherAlgorithmModel()` function (in `inc/models/algorithm-model.php`) by adding the `UNIQUE_KEY` you used in the array returned from the `getOrderedMatrixPatterns()` function.

* Save the file and run `make` (if not using PHP over fastcgi).