# vue-color missing error

If you git checkout an earlier commit of the project after [vue-color](https://github.com/xiaokaike/vue-color) was replaced by [dithermark-vue-color](https://github.com/allen-garvey/dithermark-vue-color), but before dithermark-vue-color was distributed through npm, you will most likely get some error when running `make` that vue-color is missing. Here are the steps you will need to follow to manually install dithermark-vue-color.

## dithermark-vue-color manual installation steps

* Open a terminal and `cd` into the directory where you cloned are downloaded dithermark to
* Copy the following command into your terminal and run it: `mkdir -p lib && cd lib && git clone https://github.com/allen-garvey/dithermark-vue-color.git && cd dithermark-vue-color`
* Now is the hard part, as you will need to figure out the exact commit of dithermark-vue-color to checkout. The only advice I can give you is to cross check the date of the closest commit in dithermark-vue-color with the date of the commit of dithermark you have currently checked out.
* After that is all done, but before installation, you might want to check out the ESLint version, since some versions of dithermark-vue-color used it as part of the release script, and so could be vulnerable to the [ESLint malicious code packages](https://eslint.org/blog/2018/07/postmortem-for-malicious-package-publishes)
* Now run `npm install && npm run release` to create a release build
* Assuming the following series of commands complete successfully, `cd` back into the root of the dithermark project and run `make`