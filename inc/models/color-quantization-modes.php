<?php

class ColorQuantizationMode {
    protected $title; //display title for user, and for timer
    protected $algorithmName; //name of optimize-palette function
    protected $options; //additional key-values to be stored on model and passed to function
    protected $shouldResultsBeCached; //false if algorithm is non-deterministic (random) so results won't be cached

    function __construct(string $title, string $algorithmName, array $options=[], bool $shouldResultsBeCached=true){
        $this->title = $title;
        $this->algorithmName = $algorithmName;
        $this->options = $options;
        $this->shouldResultsBeCached = $shouldResultsBeCached;
    }

    public function getTitle(): string{
        return $this->title;
    }

    public function getShouldResultsBeCached(): bool{
        return $this->shouldResultsBeCached;
    }

    public function toArrayForWorker(): array{
        $ret = [
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
        'Random',
        new ColorQuantizationMode('Random palette', 'Random.random', [], false),
        'Uniform',
        new ColorQuantizationMode('Uniform', 'Uniform.uniform', ['isRotated' => true]),
        new ColorQuantizationMode('Uniform (alt)', 'Uniform.uniform'),
        'Color Wheel',
        new ColorQuantizationMode('Hue wheel 1', 'Perceptual.monochrome'),
        new ColorQuantizationMode('Hue wheel 2', 'Perceptual.monochrome', ['hueCount' => 2]),
        new ColorQuantizationMode('Hue wheel 3', 'Perceptual.monochrome', ['hueCount' => 3]),
        new ColorQuantizationMode('Hue wheel 4', 'Perceptual.monochrome', ['hueCount' => 4]),
        new ColorQuantizationMode('Hue wheel 5', 'Perceptual.monochrome', ['hueCount' => 5]),
        new ColorQuantizationMode('Hue wheel 6', 'Perceptual.monochrome', ['hueCount' => 6]),
        new ColorQuantizationMode('Hue wheel 7', 'Perceptual.monochrome', ['hueCount' => 7]),
        new ColorQuantizationMode('Hue wheel 8', 'Perceptual.monochrome', ['hueCount' => 8]),
        new ColorQuantizationMode('Hue wheel k', 'Perceptual.monochrome', ['hueCount' => -1]),
        'ChannelsQ',
        new ColorQuantizationMode('ChannelsQ (Balanced)', 'ColorChannel.colorChannel', ['greyMix' => 4, 'penaltyFuncId'=> 2]),
        new ColorQuantizationMode('ChannelsQ (Narrow)', 'ColorChannel.colorChannel', ['greyMix' => 16, 'penaltyFuncId'=> 0]),
        new ColorQuantizationMode('ChannelsQ (Vibrant)', 'ColorChannel.colorChannel', ['greyMix' => 32, 'penaltyFuncId'=> 1]),
        new ColorQuantizationMode('ChannelsQ (Wide)', 'ColorChannel.colorChannel', ['greyMix' => 1, 'penaltyFuncId'=> 2]),
        'Artiquant 3',
        new ColorQuantizationMode('Artiquant 3 (Balanced)', 'Perceptual.medianCut5', ['hueMix' => 2, 'hueClamp' => true]),
        new ColorQuantizationMode('Artiquant 3 (Narrow)', 'Perceptual.medianCut5', ['hueMix' => 2, 'hueFilterLog' => 8]),
        new ColorQuantizationMode('Artiquant 3 (Vibrant)', 'Perceptual.medianCut4', ['hueMix' => 2, 'hueClamp' => true]),
        new ColorQuantizationMode('Artiquant 3 (Wide)', 'Perceptual.medianCut3', ['hueMix' => 2, 'isVibrant' => false]),
        'Artiquant 2',
        new ColorQuantizationMode('Artiquant 2 (Balanced)', 'Perceptual.medianCut', ['hueMix' => 1.6]),
        new ColorQuantizationMode('Artiquant 2 (Narrow)', 'Perceptual.medianCut', ['hueMix' => 2]),
        new ColorQuantizationMode('Artiquant 2 (Vibrant)', 'Perceptual.medianCut', ['hueMix' => 0.6, 'isVibrant' => true]),
        new ColorQuantizationMode('Artiquant 2 (Wide)', 'Perceptual.medianCut', ['hueMix' => 0.6]),
        'Artiquant 1',
        new ColorQuantizationMode('Artiquant 1 (Wide)', 'Perceptual.uniform'),
        new ColorQuantizationMode('Artiquant 1 (Vibrant)', 'Perceptual.uniform', ['isVibrant' => true]),
        'RGB Quant',
        new ColorQuantizationMode('RGB Quant (Wide, Luma)', 'RgbQuant.rgbQuant', ['colorDist' => 'manhattan','method' => 2]),
        new ColorQuantizationMode('RGB Quant (Wide, RGB)', 'RgbQuant.rgbQuant', ['method' => 2]),
        new ColorQuantizationMode('RGB Quant (Narrow, Luma)', 'RgbQuant.rgbQuant', ['colorDist' => 'manhattan','method' => 1]),
        new ColorQuantizationMode('RGB Quant (Narrow, RGB)', 'RgbQuant.rgbQuant', ['method' => 1]),
        'NeuQuant',
        new ColorQuantizationMode('NeuQuant (High)', 'NeuQuant.neuQuant', ['sample' => 1]),
        new ColorQuantizationMode('NeuQuant (High alt)', 'NeuQuant.neuQuant', ['sample' => 1, 'networkSize' => 128]),
        new ColorQuantizationMode('NeuQuant (Medium)', 'NeuQuant.neuQuant', ['sample' => 10]),
        new ColorQuantizationMode('NeuQuant (Medium alt)', 'NeuQuant.neuQuant', ['sample' => 10, 'networkSize' => 128]),
        new ColorQuantizationMode('NeuQuant (Low)', 'NeuQuant.neuQuant', ['sample' => 30]),
        new ColorQuantizationMode('NeuQuant (Low alt)', 'NeuQuant.neuQuant', ['sample' => 30, 'networkSize' => 128]),
        'K Means',
        new ColorQuantizationMode('K Means (RGB)', 'KMeans.kMeans'),
        new ColorQuantizationMode('K Means (Luma)', 'KMeans.kMeans', ['distanceLuma' => true]),
        'Octree',
        new ColorQuantizationMode('Octree (Wide)', 'Octree.octree', ['sort' => 0]),
        new ColorQuantizationMode('Octree (Wide alt)', 'Octree.octree', ['sort' => 1]),
        new ColorQuantizationMode('Octree (Narrow)', 'Octree.octree', ['sort' => 2]),
        new ColorQuantizationMode('Octree (Narrow alt)', 'Octree.octree', ['sort' => 3]),
        'Median Cut',
        new ColorQuantizationMode('Median Cut (Narrow)', 'MedianCut.medianCut'),
        new ColorQuantizationMode('Median Cut (Wide)', 'MedianCut.medianCut', ['isMedian' => true]),
        'Spatial Popularity',
        new ColorQuantizationMode('Spatial Popularity (Row)', 'Popularity.popularity'),
        new ColorQuantizationMode('Spatial Popularity (Row, Crushed)', 'Popularity.popularity', ['isPerceptual' => true]),
        new ColorQuantizationMode('Spatial Popularity (Column)', 'Popularity.popularity', ['isVertical' => true]),
        new ColorQuantizationMode('Spatial Popularity (Column, Crushed)', 'Popularity.popularity', ['isPerceptual' => true, 'isVertical' => true]),
        new ColorQuantizationMode('Spatial Popularity (Box)', 'Popularity.spatialPopularityBoxed'),
        new ColorQuantizationMode('Spatial Popularity (Box, Crushed)', 'Popularity.spatialPopularityBoxed', ['isPerceptual' => true]),
        'Sorted Popularity',
        new ColorQuantizationMode('Sorted Popularity (Lightness)', 'Popularity.lightnessPopularity'),
        new ColorQuantizationMode('Sorted Popularity (Lightness, Crushed)', 'Popularity.lightnessPopularity', ['isPerceptual' => true]),
        new ColorQuantizationMode('Sorted Popularity (Luma)', 'Popularity.lumaPopularity'),
        new ColorQuantizationMode('Sorted Popularity (Luma, Crushed)', 'Popularity.lumaPopularity', ['isPerceptual' => true]),
        new ColorQuantizationMode('Sorted Popularity (Hue)', 'Popularity.huePopularity'),
        new ColorQuantizationMode('Sorted Popularity (Hue, Crushed)', 'Popularity.huePopularity', ['isPerceptual' => true]),
        'Spatial Average',
        new ColorQuantizationMode('Spatial Average (Box)', 'Popularity.spatialAverageBoxed'),
        'Sorted Average',
        new ColorQuantizationMode('Sorted Average (Lightness)', 'Popularity.lightnessAverage'),
        new ColorQuantizationMode('Sorted Average (Lightness, Crushed)', 'Popularity.lightnessAverage', ['isPerceptual' => true]),
        new ColorQuantizationMode('Sorted Average (Hue)', 'Popularity.hueAverage'),
        new ColorQuantizationMode('Sorted Average (Hue, Crushed)', 'Popularity.hueAverage', ['isPerceptual' => true]),
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
        $ret = [
            'title' => $mode->getTitle(),
        ];
        if(!$mode->getShouldResultsBeCached()){
            $ret['disableCache'] = true;
        }

        return $ret;
    }, colorQuantizationModes());
}

function colorQuantizationModesWorker(): array{
    return array_map(function($mode){
        return $mode->toArrayForWorker();
    }, colorQuantizationModes());
}

function encodeQuantizationValueForWorkerJs(string $key, $value){
    if(is_bool($value)){
        return $value ? 'true' : 'false';
    }
    else if($key === 'algo' || !is_string($value)){
        return $value;
    }
    return "'{$value}'";
}