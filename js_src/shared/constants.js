App.Constants = {
    appName: '<?= APP_NAME; ?>',
    randomImageMaxWidth: <?= RANDOM_IMAGE_MAX_WIDTH; ?>,
    randomImageMaxHeight: <?= RANDOM_IMAGE_MAX_HEIGHT; ?>,
    maxWebworkers: <?= MAX_WEBWORKERS; ?>,
    colorDitherMaxColors: <?= COLOR_DITHER_MAX_COLORS; ?>,
    histogramHeight: <?= HISTOGRAM_HEIGHT; ?>,
    histogramBwWidth: <?= HISTOGRAM_BW_WIDTH; ?>,
    histogramColorWidth: <?= HISTOGRAM_COLOR_WIDTH; ?>,
    ditherWorkerUrl: '<?= JS_DITHER_WORKER_URL; ?>',
    //based on the value of r from https://en.wikipedia.org/wiki/Ordered_dithering
    //formula is hightestValue / cube_root(numColors)
    //for webgl highestValue is 1.0, while for webworker it should be 255
    ditherRCoefficient: (numColors, isWebgl) => {
        const highestValue = isWebgl ? 1.0 : 255;
        return highestValue / Math.cbrt(numColors);
    },
};