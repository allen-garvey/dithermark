App.ColorQuantizationModes = [
    {key: 'UNIFORM', title: 'Uniform', algo: 'uniform'},
    {key: 'UNIFORM_VIBRANT', title: 'Uniform (Vibrant Colors)', algo: 'uniform'},
    {key: 'PMC_BALANCED', title: 'Perceptual Median Cut (Default)', algo: 'perceptualMedianCut'},
    {key: 'PMC_MEDIAN', title: 'Perceptual Median Cut (Monotone)', algo: 'perceptualMedianCut'},
    {key: 'PMC_UNIFORM_VIBRANT', title: 'Perceptual Median Cut (Vibrant)', algo: 'perceptualMedianCut'},
    {key: 'PMC_UNIFORM', title: 'Perceptual Median Cut (Uniform)', algo: 'perceptualMedianCut'},
    {key: 'MEDIAN_CUT', title: 'Median Cut', algo: 'medianCut', mutatesPixels: true},
];