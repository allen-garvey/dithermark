//this works like a header file to reduce number of imports required in main.js
App.OptimizePalette = (function(Popularity, MedianCut, ArrayUtil, RgbQuant, Perceptual, Octree){
    return {
       perceptualMedianCut: Perceptual.medianCut,
       uniform: Perceptual.uniform,
       monochrome: Perceptual.monochrome,
       medianCut: MedianCut.medianCut,
       popularity: Popularity.popularity,
       lightnessPopularity: Popularity.lightnessPopularity,
       huePopularity: Popularity.huePopularity,
       spatialAverage: Popularity.spatialAverage,
       spatialAverageBoxed: Popularity.spatialAverageBoxed,
       hueAverage: Popularity.hueAverage,
       lightnessAverage: Popularity.lightnessAverage,
       rgbQuant: RgbQuant.rgbQuant,
       octree: Octree.octree,
    };
})(App.OptimizePalettePopularity, App.OptimizePaletteMedianCut, App.ArrayUtil, App.OptimizePaletteRgbQuant, App.OptimizePalettePerceptual, App.OptimizePaletteOctree);