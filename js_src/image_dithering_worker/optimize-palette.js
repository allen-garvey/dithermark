App.OptimizePalette = (function(Popularity, MedianCut, ArrayUtil, RgbQuant, Perceptual){
    return {
       perceptualMedianCut: Perceptual.medianCut,
       uniform: Perceptual.uniform,
       medianCut: MedianCut.medianCut,
       popularity: Popularity.popularity,
       lightnessPopularity: Popularity.lightnessPopularity,
       huePopularity: Popularity.huePopularity,
       rgbQuant: RgbQuant.rgbQuant,
    };
})(App.OptimizePalettePopularity, App.OptimizePaletteMedianCut, App.ArrayUtil, App.OptimizePaletteRgbQuant, App.OptimizePalettePerceptual);