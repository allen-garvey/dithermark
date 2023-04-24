# Building for Electron

* Follow directions to create a production build, and build with `make release`
* Run `make electron`
* In `electron` directory run `npm install` to install dependencies
* Run `npm run package`
* Run `npm run make` or `npm run make -- --arch=universal --platform=darwin` on Mac for universal (both Apple Silicon and x64) build
* Binaries will be in `electron/out` (note this will only create binaries for current operating system / platform)

## Building RPM (Red Hat) on Ubuntu

* Run `apt install rpm`
* `cd` to `electron` directory
* Run `npm install @electron-forge/maker-rpm --save-dev`
* In `electron/forge.config.js` uncomment entry related to `@electron-forge/maker-rpm`
* Follow steps above