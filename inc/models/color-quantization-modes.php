<?php

class ColorQuantizationMode {
    protected $key; //for debugging purposes only
    protected $title; //display title for user, and for timer
    protected $algorithmName; //name of optimize-palette function
    protected $options; //additional key-values to be stored on model and passed to function

    function __construct(string $key, string $title, string $algorithmName, array $options=[]) {
        $this->key = $key;
        $this->title = $title;
        $this->algorithmName = $algorithmName;
        $this->options = $options;
    }

    public function getTitle(): string{
        return $this->title;
    }

    public function toArrayForWorker(): array{
        $ret = [
            'key' => $this->key,
            'title' => $this->title,
            'algo' => $this->algorithmName,
        ];

        foreach($this->options as $key => $value){
            $ret[$key] = $value;
        }
        return $ret;
    }
}

function colorQuantizationModesBase(): array{
    return [
        'Monochrome',
        new ColorQuantizationMode('MONOCHROME', 'Monochrome', 'monochrome'),
        new ColorQuantizationMode('DUOTONE', 'Duotone', 'monochrome', ['hueCount' => 2]),
        new ColorQuantizationMode('TRITONE', 'Tritone', 'monochrome', ['hueCount' => 3]),
        new ColorQuantizationMode('QUADTONE', 'Quadtone', 'monochrome', ['hueCount' => 4]),
        new ColorQuantizationMode('HEXTONE', 'Hextone', 'monochrome', ['hueCount' => 6]),
        'Perceptual Median Cut',
        new ColorQuantizationMode('PMC_BALANCED', 'Perceptual Median Cut (Balanced)', 'perceptualMedianCut', ['hueMix' => 1.6]),
        new ColorQuantizationMode('PMC_MEDIAN', 'Perceptual Median Cut (Monotone)', 'perceptualMedianCut', ['hueMix' => 2]),
        new ColorQuantizationMode('PMC_UNIFORM_VIBRANT', 'Perceptual Median Cut (Uniform Vibrant)', 'perceptualMedianCut', ['hueMix' => 0.6, 'isVibrant' => true]),
        new ColorQuantizationMode('PMC_UNIFORM', 'Perceptual Median Cut (Uniform)', 'perceptualMedianCut', ['hueMix' => 0.6]),
        'Perceptual Uniform',
        new ColorQuantizationMode('UNIFORM', 'Perceptual Uniform', 'uniform'),
        new ColorQuantizationMode('UNIFORM_VIBRANT', 'Perceptual Uniform (Vibrant)', 'uniform', ['isVibrant' => true]),
        'RGB Quant',
        new ColorQuantizationMode('RGB_QUANT', 'RGB Quant', 'rgbQuant', ['method' => 2]),
        new ColorQuantizationMode('RGB_QUANT_MANHATTAN', 'RGB Quant (Manhattan)', 'rgbQuant', ['colorDist' => 'manhattan','method' => 2]),
        new ColorQuantizationMode('RGB_QUANT_GLOBAL', 'RGB Quant (Global)', 'rgbQuant', ['method' => 1]),
        new ColorQuantizationMode('RGB_QUANT_MANHATTAN_GLOBAL', 'RGB Quant (Global Manhattan)', 'rgbQuant', ['colorDist' => 'manhattan','method' => 1]),
        'Spatial Popularity',
        new ColorQuantizationMode('SPATIAL_POPULARITY', 'Spatial Popularity (Horizontal)', 'popularity'),
        new ColorQuantizationMode('PERCEPTUAL_SPATIAL_POPULARITY', 'Perceptual Spatial Popularity (Horizontal)', 'popularity', ['isPerceptual' => true]),
        new ColorQuantizationMode('SPATIAL_POPULARITY_VERTICAL', 'Spatial Popularity (Vertical)', 'popularity', ['isVertical' => true]),
        new ColorQuantizationMode('PERCEPTUAL_SPATIAL_POPULARITY_VERTICAL', 'Perceptual Spatial Popularity (Vertical)', 'popularity', ['isPerceptual' => true, 'isVertical' => true]),
        new ColorQuantizationMode('LIGHTNESS_POPULARITY', 'Lightness Popularity', 'lightnessPopularity'),
        new ColorQuantizationMode('PERCEPTUAL_LIGHTNESS_POPULARITY', 'Perceptual Lightness Popularity', 'lightnessPopularity', ['isPerceptual' => true]),
        new ColorQuantizationMode('HUE_POPULARITY', 'Hue Popularity', 'huePopularity'),
        new ColorQuantizationMode('PERCEPTUAL_HUE_POPULARITY', 'Perceptual Hue Popularity', 'huePopularity', ['isPerceptual' => true]),
        'Spatial Average',
        new ColorQuantizationMode('SPATIAL_AVERAGE', 'Spatial Average (Horizontal)', 'spatialAverage'),
        new ColorQuantizationMode('SPATIAL_AVERAGE_VERTICAL', 'Spatial Average (Vertical)', 'spatialAverage', ['isVertical' => true]),
        new ColorQuantizationMode('SPATIAL_AVERAGE_BOXED', 'Spatial Average (Boxed)', 'spatialAverageBoxed'),
        new ColorQuantizationMode('LIGHTNESS_AVERAGE', 'Lightness Average', 'lightnessAverage'),
        new ColorQuantizationMode('LIGHTNESS_AVERAGE', 'Perceptual Lightness Average', 'lightnessAverage', ['isPerceptual' => true]),
        new ColorQuantizationMode('HUE_AVERAGE', 'Hue Average', 'hueAverage'),
        new ColorQuantizationMode('HUE_AVERAGE', 'Perceptual Hue Average', 'hueAverage', ['isPerceptual' => true]),
        'Octree',
        new ColorQuantizationMode('OCTREE_1', 'Octree (Minority 1)', 'octree', ['sort' => 0]),
        new ColorQuantizationMode('OCTREE_2', 'Octree (Minority 2)', 'octree', ['sort' => 1]),
        new ColorQuantizationMode('OCTREE_3', 'Octree (Majority 1)', 'octree', ['sort' => 2]),
        new ColorQuantizationMode('OCTREE_4', 'Octree (Majority 2)', 'octree', ['sort' => 3]),
        'Median Cut',
        new ColorQuantizationMode('MEDIAN_CUT_AVERAGE', 'Median Cut (Average)', 'medianCut'),
        new ColorQuantizationMode('MEDIAN_CUT_MEDIAN', 'Median Cut (Median)', 'medianCut', ['isMedian' => true]),
    ];
}

function isColorQuantizationMode($item): bool{
    return gettype($item) === 'object';
}

function colorQuantizationModes(): array{
    //have to use array_values to reindex keys to make sequential array for json_encode to encode this properly as an array
    return array_values(array_filter(colorQuantizationModesBase(), 'isColorQuantizationMode'));
}

function colorQuantizationGroups(): array{
    $colorQuantizationModesBase = colorQuantizationModesBase();
    $groups = [];
    foreach($colorQuantizationModesBase as $index => $item){
        if(isColorQuantizationMode($item)){
            continue;
        }

        $groups[] = [
            'title' => $item,
            'start' => $index,
        ];
    }

    //need to normalize start indexes first
    $groups = array_map(function($group, $index){
        $group['start'] = $group['start'] - $index;
        return $group;
    }, $groups, array_keys($groups));


    $lastIndex = count($groups) - 1;
    $colorQuantizationModesBaseLength = count($colorQuantizationModesBase);

    return array_map(function($group, $index) use ($groups, $lastIndex, $colorQuantizationModesBaseLength){
        if($index === $lastIndex){
            $length = $colorQuantizationModesBaseLength - $group['start'] - 1;
        }
        else{
            $length = $groups[$index + 1]['start'] - $group['start'];
        }
        $group['length'] = $length;
        return $group;

    }, $groups, array_keys($groups));
}

function colorQuantizationModesApp(): array{
    return array_map(function($mode){
        return $mode->getTitle();
    }, colorQuantizationModes());
}

function colorQuantizationModesWorker(): array{
    return array_map(function($mode){
        return $mode->toArrayForWorker();
    }, colorQuantizationModes());
}