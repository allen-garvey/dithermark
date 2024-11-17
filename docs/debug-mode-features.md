# Debug Mode Features

When running the app in debug mode (this happens when you just run `make`), certain extra debugging features are enabled. They include:

* Timing for dither and color quantization algorithms (printed to console)
* Print palette button (located underneath color dither colors). It prints out the current hex values of the color palette to the console as an array (as well as copying to the clipboard in browsers that support it), which is useful when adding to or editing built-in color palettes