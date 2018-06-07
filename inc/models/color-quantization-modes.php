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
        new ColorQuantizationMode('MONOCHROME', 'Monochrome', 'Perceptual.monochrome'),
        new ColorQuantizationMode('DUOTONE', 'Duotone', 'Perceptual.monochrome', ['hueCount' => 2]),
        new ColorQuantizationMode('TRITONE', 'Tritone', 'Perceptual.monochrome', ['hueCount' => 3]),
        new ColorQuantizationMode('QUADTONE', 'Quadtone', 'Perceptual.monochrome', ['hueCount' => 4]),
        new ColorQuantizationMode('HEXTONE', 'Hextone', 'Perceptual.monochrome', ['hueCount' => 6]),
        'Perceptual Median Cut 2',
        new ColorQuantizationMode('PMC_2', 'Perceptual Median Cut 2', 'Perceptual.medianCut2', ['hueMix' => 1.8, 'isVibrant' => true]),
        'Perceptual Median Cut',
        new ColorQuantizationMode('PMC_BALANCED', 'Perceptual Median Cut (Balanced)', 'Perceptual.medianCut', ['hueMix' => 1.6]),
        new ColorQuantizationMode('PMC_MEDIAN', 'Perceptual Median Cut (Monotone)', 'Perceptual.medianCut', ['hueMix' => 2]),
        new ColorQuantizationMode('PMC_UNIFORM_VIBRANT', 'Perceptual Median Cut (Uniform Vibrant)', 'Perceptual.medianCut', ['hueMix' => 0.6, 'isVibrant' => true]),
        new ColorQuantizationMode('PMC_UNIFORM', 'Perceptual Median Cut (Uniform)', 'Perceptual.medianCut', ['hueMix' => 0.6]),
        'Perceptual Uniform',
        new ColorQuantizationMode('UNIFORM', 'Perceptual Uniform', 'Perceptual.uniform'),
        new ColorQuantizationMode('UNIFORM_VIBRANT', 'Perceptual Uniform (Vibrant)', 'Perceptual.uniform', ['isVibrant' => true]),
        'RGB Quant',
        new ColorQuantizationMode('RGB_QUANT', 'RGB Quant', 'RgbQuant.rgbQuant', ['method' => 2]),
        new ColorQuantizationMode('RGB_QUANT_MANHATTAN', 'RGB Quant (Manhattan)', 'RgbQuant.rgbQuant', ['colorDist' => 'manhattan','method' => 2]),
        new ColorQuantizationMode('RGB_QUANT_GLOBAL', 'RGB Quant (Global)', 'RgbQuant.rgbQuant', ['method' => 1]),
        new ColorQuantizationMode('RGB_QUANT_MANHATTAN_GLOBAL', 'RGB Quant (Global Manhattan)', 'RgbQuant.rgbQuant', ['colorDist' => 'manhattan','method' => 1]),
        'Spatial Popularity',
        new ColorQuantizationMode('SPATIAL_POPULARITY', 'Spatial Popularity (Horizontal)', 'Popularity.popularity'),
        new ColorQuantizationMode('PERCEPTUAL_SPATIAL_POPULARITY', 'Perceptual Spatial Popularity (Horizontal)', 'Popularity.popularity', ['isPerceptual' => true]),
        new ColorQuantizationMode('SPATIAL_POPULARITY_VERTICAL', 'Spatial Popularity (Vertical)', 'Popularity.popularity', ['isVertical' => true]),
        new ColorQuantizationMode('PERCEPTUAL_SPATIAL_POPULARITY_VERTICAL', 'Perceptual Spatial Popularity (Vertical)', 'Popularity.popularity', ['isPerceptual' => true, 'isVertical' => true]),
        new ColorQuantizationMode('SPATIAL_POPULARITY_BOXED', 'Spatial Popularity (Boxed)', 'Popularity.spatialPopularityBoxed'),
        new ColorQuantizationMode('PERCEPTUAL_SPATIAL_POPULARITY_BOXED', 'Perceptual Spatial Popularity (Boxed)', 'Popularity.spatialPopularityBoxed', ['isPerceptual' => true]),
        new ColorQuantizationMode('LIGHTNESS_POPULARITY', 'Lightness Popularity', 'Popularity.lightnessPopularity'),
        new ColorQuantizationMode('PERCEPTUAL_LIGHTNESS_POPULARITY', 'Perceptual Lightness Popularity', 'Popularity.lightnessPopularity', ['isPerceptual' => true]),
        new ColorQuantizationMode('HUE_POPULARITY', 'Hue Popularity', 'Popularity.huePopularity'),
        new ColorQuantizationMode('PERCEPTUAL_HUE_POPULARITY', 'Perceptual Hue Popularity', 'Popularity.huePopularity', ['isPerceptual' => true]),
        'Spatial Average',
        new ColorQuantizationMode('SPATIAL_AVERAGE_BOXED', 'Spatial Average (Boxed)', 'Popularity.spatialAverageBoxed'),
        new ColorQuantizationMode('LIGHTNESS_AVERAGE', 'Lightness Average', 'Popularity.lightnessAverage'),
        new ColorQuantizationMode('LIGHTNESS_AVERAGE', 'Perceptual Lightness Average', 'Popularity.lightnessAverage', ['isPerceptual' => true]),
        new ColorQuantizationMode('HUE_AVERAGE', 'Hue Average', 'Popularity.hueAverage'),
        new ColorQuantizationMode('HUE_AVERAGE', 'Perceptual Hue Average', 'Popularity.hueAverage', ['isPerceptual' => true]),
        'Octree',
        new ColorQuantizationMode('OCTREE_1', 'Octree (Minority 1)', 'Octree.octree', ['sort' => 0]),
        new ColorQuantizationMode('OCTREE_2', 'Octree (Minority 2)', 'Octree.octree', ['sort' => 1]),
        new ColorQuantizationMode('OCTREE_3', 'Octree (Majority 1)', 'Octree.octree', ['sort' => 2]),
        new ColorQuantizationMode('OCTREE_4', 'Octree (Majority 2)', 'Octree.octree', ['sort' => 3]),
        'Median Cut',
        new ColorQuantizationMode('MEDIAN_CUT_AVERAGE', 'Median Cut (Average)', 'MedianCut.medianCut'),
        new ColorQuantizationMode('MEDIAN_CUT_MEDIAN', 'Median Cut (Median)', 'MedianCut.medianCut', ['isMedian' => true]),
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

function encodeQuantizationValueForWorkerJs(string $key, $value){
    if($key === 'algo' || !is_string($value)){
        return $value;
    }
    return "'${value}'";
}