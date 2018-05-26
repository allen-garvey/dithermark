App.OptimizePalette = (function(Popularity, MedianCut, ArrayUtil, RgbQuant, Perceptual, Octree){
    return {
       perceptualMedianCut: Perceptual.medianCut,
       uniform: Perceptual.uniform,
       monochrome: Perceptual.monochrome,
       medianCut: MedianCut.medianCut,
       popularity: Popularity.popularity,
       lightnessPopularity: Popularity.lightnessPopularity,
       huePopularity: Popularity.huePopularity,
       rgbQuant: RgbQuant.rgbQuant,
       octree: Octree.octree,
    };
})(App.OptimizePalettePopularity, App.OptimizePaletteMedianCut, App.ArrayUtil, App.OptimizePaletteRgbQuant, App.OptimizePalettePerceptual, App.OptimizePaletteOctree);