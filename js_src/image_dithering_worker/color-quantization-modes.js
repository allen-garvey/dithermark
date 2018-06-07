App.ColorQuantizationModes = (function(Popularity, MedianCut, RgbQuant, Perceptual, Octree){
    return [
        <?php foreach(colorQuantizationModesWorker() as $quantizationMode): ?>
            {
                <?php foreach($quantizationMode as $key => $value): ?>
                    <?= $key; ?>: <?= encodeQuantizationValueForWorkerJs($key, $value); ?>,
                 <?php endforeach; ?>
            },
        <?php endforeach; ?>
    ];
})(App.OptimizePalettePopularity, App.OptimizePaletteMedianCut, App.OptimizePaletteRgbQuant, App.OptimizePalettePerceptual, App.OptimizePaletteOctree);