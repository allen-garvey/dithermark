# Debug Mode Features

When running the app in debug mode (this happens when you follow the directions for local development), certain extra debugging features are enabled. They include:

* Timing for dither and color quantization algorithms (printed to console)

* Print palette button (located underneath color dither colors). It prints out the current hex values of the color palette to the console as an array (as well as copying to the clipboard in browsers that support it), which is useful when adding to or editing built-in color palettes

* Texture combine button in bw dither. This allows you to save the output of 3 different dithers and combine the result.

* Video output is done server side using FFmpeg instead of in the browser. This is *much* faster and less error prone, however it requires you to have `ffmpeg` installed locally. To use the browser based FFmpeg instead, there is a use FFmpeg server checkbox in the setting tab which is enabled by default that you can uncheck.