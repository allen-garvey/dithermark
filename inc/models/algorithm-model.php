<?php

class DitherAlgorithm {
    protected $id = null;
    protected $name;
    protected $workerFunc;
    protected $webglFunc;
    protected $appOptions;


    //appOptions is addition key-values to add to App algorithm model
    //currently only works with boolean and number values
    function __construct(string $name, string $workerFunc, string $webglFunc, array $appOptions=[]) {
        $this->name = $name;
        $this->workerFunc = $workerFunc;
        $this->webglFunc = $webglFunc;
        $this->appOptions = $appOptions;
    }

    public function name(): string{
        return $this->name;
    }

    public function workerFunc(): string{
        return $this->workerFunc;
    }

    public function webglFunc(): string{
        return $this->webglFunc;
    }

    public function id(): int{
        return $this->id;
    }

    public function appOptions(): array{
        return $this->appOptions;
    }

    public function setId(int $id){
        if(!is_null($this->id)){
            $error = "id for ${$this->name} has already been assigned and cannot be changed";
            throw new Exception($error);
        }
        $this->id = $id;
    }
}

/**
 * Helper functions to create dither algorithms
 */
function dimensionsSuffix(int $dimensions): string{
    return "${dimensions}×${dimensions}";
}
function bayerTitle(string $titlePrefix, int $dimensions, string $suffix=''): string{
    $dimensionsSuffix = dimensionsSuffix($dimensions);
    return "${titlePrefix} ${dimensionsSuffix}${suffix}";
}
function orderedMatrixTitle(string $titlePrefix, string $orderedMatrixName, int $dimensions, bool $isRandom=false, bool $addDimensionsToTitle=false): string{
    $randomIndicatorSuffix = $isRandom ? ' (R)' : '';
    if($orderedMatrixName === 'bayer'){
        return bayerTitle($titlePrefix, $dimensions, $randomIndicatorSuffix);
    }
    $matrixTitle = titleizeCamelCase($orderedMatrixName);
    if(!empty($titlePrefix)){
        $dimensionsSuffix = $addDimensionsToTitle ? ' '.dimensionsSuffix($dimensions) : '';    
        return "${titlePrefix} ${matrixTitle}${dimensionsSuffix}${randomIndicatorSuffix}";
    }
    $dimensionsSuffix = $addDimensionsToTitle ? dimensionsSuffix($dimensions).' ' : '';
    return "${matrixTitle} ${dimensionsSuffix}${randomIndicatorSuffix}";
}
function titleizeCamelCase(string $camelCase): string{
    $isFirstLetter = true;
    $ret = '';
    foreach(str_split($camelCase) as $char){
        if($isFirstLetter){
            $ret = strtoupper($char);
            $isFirstLetter = false;
        }
        else if(ctype_upper($char)){
            $ret = $ret.' '.$char;
        }
        else{
            $ret .= $char;
        }
    }

    return $ret;
}
/**
 * Yliluoma Dithers
 */
function yliluoma1Builder(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = 'Yliluoma 1';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, false, $addDimensionsToTitle);
    $webworkerFunc = "OrderedDither.createYliluoma1ColorDither(${dimensions}, '${orderedMatrixName}')";
    $webglFunc = "ColorDither.createYliluoma1OrderedDither(${dimensions}, '${orderedMatrixName}')";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function yliluoma2Builder(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = 'Yliluoma 2';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, false, $addDimensionsToTitle);
    $webworkerFunc = "OrderedDither.createYliluoma2ColorDither(${dimensions}, '${orderedMatrixName}')";
    $webglFunc = "ColorDither.createYliluoma2OrderedDither(${dimensions}, '${orderedMatrixName}')";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
/**
 * Hue Lightness
 */
function hueLightnessBuilderBase(string $orderedMatrixName, int $dimensions, bool $isRandom=false, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = 'Hue-Lightness';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, $isRandom, $addDimensionsToTitle);
    $randomArg = $isRandom ? ', true' : '';
    $webworkerFunc = "OrderedDither.createHueLightnessDither('${orderedMatrixName}',${dimensions}${randomArg})";
    $webglFunc = "ColorDither.createHueLightnessOrderedDither(${dimensions},'${orderedMatrixName}'${randomArg})";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function hueLightnessBuilder(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    return hueLightnessBuilderBase($orderedMatrixName, $dimensions, false, $addDimensionsToTitle);
}
function hueLightnessRandomBuilder(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    return hueLightnessBuilderBase($orderedMatrixName, $dimensions, true, $addDimensionsToTitle);
}
/**
 * Vanilla Bw ordered dither 
 */
function orderedDitherBwBuilderBase(string $orderedMatrixName, int $dimensions, bool $isRandom=false, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = $orderedMatrixName === 'bayer' ? 'Ordered' : '';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, $isRandom, $addDimensionsToTitle);
    $pascalCase = ucfirst($orderedMatrixName);
    $randomArg = $isRandom ? ', true' : '';
    $webworkerFunc = "OrderedDither.create${pascalCase}Dither(${dimensions}${randomArg})";
    $webglFunc = "BwDither.create${pascalCase}Dither(${dimensions}${randomArg})";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function orderedDitherBwBuilder(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    return orderedDitherBwBuilderBase($orderedMatrixName, $dimensions, false, $addDimensionsToTitle);
}
function orderedDitherBwRandomBuilder(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    return orderedDitherBwBuilderBase($orderedMatrixName, $dimensions, true, $addDimensionsToTitle);
}
/**
 * Vanilla Color ordered dither 
 */
function orderedDitherColorBuilderBase(string $orderedMatrixName, int $dimensions, bool $isRandom=false, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = $orderedMatrixName === 'bayer' ? 'Ordered' : '';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, $isRandom, $addDimensionsToTitle);
    $pascalCase = ucfirst($orderedMatrixName);
    $randomArg = $isRandom ? ', true' : '';
    $webworkerFunc = "OrderedDither.create${pascalCase}ColorDither(${dimensions}${randomArg})";
    $webglFunc = "ColorDither.create${pascalCase}ColorDither(${dimensions}${randomArg})";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function orderedDitherColorBuilder(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    return orderedDitherColorBuilderBase($orderedMatrixName, $dimensions, false, $addDimensionsToTitle);
}
function orderedDitherColorRandomBuilder(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    return orderedDitherColorBuilderBase($orderedMatrixName, $dimensions, true, $addDimensionsToTitle);
}
/**
 * Error prop dither
 */
function errorPropBwDitherBuilder(string $funcName, string $title=''): DitherAlgorithm{
    $title = !empty($title) ? $title : ucfirst($funcName);
    return new DitherAlgorithm($title, "ErrorPropDither.${funcName}", '');
}
function errorPropColorDitherBuilder(string $funcName, string $title=''): DitherAlgorithm{
    $title = !empty($title) ? $title : ucfirst($funcName);
    return new DitherAlgorithm($title, "ErrorPropColorDither.${funcName}", '');
}
/**
 * Arithmetic dither
 */
function arithmeticDitherBwBuilder(string $titleSuffix, string $funcNameSuffix): DitherAlgorithm{
    $title = "Adither ${titleSuffix}";
    $webworkerFunc = "Threshold.adither${funcNameSuffix}";
    $webglFunc = "BwDither.aDither${funcNameSuffix}";

    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc, ['requiresHighPrecisionInt' => 'true']);
}

function arithmeticDitherColorBuilder(string $titleSuffix, string $funcNameSuffix): DitherAlgorithm{
    $title = "Adither ${titleSuffix}";
    $webworkerFunc = "Threshold.adither${funcNameSuffix}Color";
    $webglFunc = "ColorDither.aDither${funcNameSuffix}";
    
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc, ['requiresHighPrecisionInt' => 'true']);
}

/**
* Functions for opt-groups
*/
function getAlgorithmGroups(array $model): array{
    $ret = [];

    $groupStartIndex = 0;
    foreach($model as $item){
        if(gettype($item) === 'string'){
            $ret[] = [
                'title' => $item,
                'start' => $groupStartIndex,
            ];
        }
        else{
            $groupStartIndex++;
        }
    }
    $groupListLength = count($ret);

    for($i=0;$i<$groupListLength-1;$i++){
        $item = &$ret[$i];
        $item['length'] = $ret[$i+1]['start'] - $item['start'];
    }
    $algoModelLength = count($model) - $groupListLength;
    $lastItem = &$ret[$groupListLength - 1];
    $lastItem['length'] =  $algoModelLength - $lastItem['start'];

    return $ret;
}

function bwAlgoGroups(): string{
    return json_encode(getAlgorithmGroups(bwAlgorithmModelBase()));
}

function colorAlgoGroups(): string{
    return json_encode(getAlgorithmGroups(colorAlgorithmModelBase()));
}

/**
* Base arrays for algorithms and opt-groups
*/
function bwAlgorithmModelBase(): array{
    return [
        'Threshold',
        new DitherAlgorithm('Threshold', 'Threshold.image', 'BwDither.threshold'),
        'Random',
        new DitherAlgorithm('Random', 'Threshold.randomDither', 'BwDither.randomThreshold'),
        'Arithmetic',
        arithmeticDitherBwBuilder('XOR (High)', 'Xor1'),
        arithmeticDitherBwBuilder('XOR (Medium)', 'Xor3'),
        arithmeticDitherBwBuilder('XOR (Low)', 'Xor2'),
        arithmeticDitherBwBuilder('ADD (High)', 'Add1'),
        arithmeticDitherBwBuilder('ADD (Medium)', 'Add3'),
        arithmeticDitherBwBuilder('ADD (Low)', 'Add2'),
        'Diffusion',
        errorPropBwDitherBuilder('floydSteinberg', 'Floyd-Steinberg'),
        errorPropBwDitherBuilder('javisJudiceNinke', 'Javis-Judice-Ninke'),
        errorPropBwDitherBuilder('stucki'),
        errorPropBwDitherBuilder('burkes'),
        errorPropBwDitherBuilder('sierra3'),
        errorPropBwDitherBuilder('sierra2'),
        errorPropBwDitherBuilder('sierra1'),
        'Diffusion (Reduced Bleed)',
        errorPropBwDitherBuilder('atkinson'),
        errorPropBwDitherBuilder('garvey'),
        'Ordered (Bayer)',
        orderedDitherBwBuilder('bayer', 2),
        orderedDitherBwBuilder('bayer', 4),
        orderedDitherBwBuilder('bayer', 8),
        orderedDitherBwBuilder('bayer', 16),
        'Ordered (Bayer/Random)',
        orderedDitherBwRandomBuilder('bayer', 2),
        orderedDitherBwRandomBuilder('bayer', 4),
        orderedDitherBwRandomBuilder('bayer', 8),
        orderedDitherBwRandomBuilder('bayer', 16),
        'Ordered (Hatch)',
        orderedDitherBwBuilder('hatchHorizontal', 4),
        orderedDitherBwBuilder('hatchVertical', 4),
        orderedDitherBwBuilder('hatchRight', 4),
        orderedDitherBwBuilder('hatchLeft', 4),
        'Ordered (Hatch/Random)',
        orderedDitherBwRandomBuilder('hatchHorizontal', 4),
        orderedDitherBwRandomBuilder('hatchVertical', 4),
        orderedDitherBwRandomBuilder('hatchRight', 4),
        orderedDitherBwRandomBuilder('hatchLeft', 4),
        'Ordered (Crosshatch)',
        orderedDitherBwBuilder('crossHatchHorizontal', 4),
        orderedDitherBwBuilder('crossHatchVertical', 4),
        orderedDitherBwBuilder('crossHatchRight', 4),
        orderedDitherBwBuilder('crossHatchLeft', 4),
        'Ordered (Crosshatch/Random)',
        orderedDitherBwRandomBuilder('crossHatchHorizontal', 4),
        orderedDitherBwRandomBuilder('crossHatchVertical', 4),
        orderedDitherBwRandomBuilder('crossHatchRight', 4),
        orderedDitherBwRandomBuilder('crossHatchLeft', 4),
        'Ordered (Zigzag)',
        orderedDitherBwBuilder('zigzagHorizontal',  4, true),
        orderedDitherBwBuilder('zigzagVertical',    4, true),
        orderedDitherBwBuilder('zigzagHorizontal',  8, true),
        orderedDitherBwBuilder('zigzagVertical',    8, true),
        orderedDitherBwBuilder('zigzagHorizontal', 16, true),
        orderedDitherBwBuilder('zigzagVertical',   16, true),
        'Ordered (Zigzag/Random)',
        orderedDitherBwRandomBuilder('zigzagHorizontal',  4, true),
        orderedDitherBwRandomBuilder('zigzagVertical',    4, true),
        orderedDitherBwRandomBuilder('zigzagHorizontal',  8, true),
        orderedDitherBwRandomBuilder('zigzagVertical',    8, true),
        orderedDitherBwRandomBuilder('zigzagHorizontal', 16, true),
        orderedDitherBwRandomBuilder('zigzagVertical',   16, true),
        'Ordered (Pattern)',
        orderedDitherBwBuilder('checkerboard', 2),
        orderedDitherBwBuilder('cluster', 4),
        orderedDitherBwBuilder('fishnet', 8),
        orderedDitherBwBuilder('dot', 4, true),
        orderedDitherBwBuilder('dot', 8, true),
        orderedDitherBwBuilder('halftone', 8),
        'Ordered (Pattern/Random)',
        orderedDitherBwRandomBuilder('checkerboard', 2),
        orderedDitherBwRandomBuilder('cluster', 4),
        orderedDitherBwRandomBuilder('fishnet', 8),
        orderedDitherBwRandomBuilder('dot', 4, true),
        orderedDitherBwRandomBuilder('dot', 8, true),
        orderedDitherBwRandomBuilder('halftone', 8),
        'Ordered (Square)',
        orderedDitherBwBuilder('square', 2, true),
        orderedDitherBwBuilder('square', 4, true),
        orderedDitherBwBuilder('square', 8, true),
        orderedDitherBwBuilder('square', 16, true),
        'Ordered (Square/Random)',
        orderedDitherBwRandomBuilder('square', 2, true),
        orderedDitherBwRandomBuilder('square', 4, true),
        orderedDitherBwRandomBuilder('square', 8, true),
        orderedDitherBwRandomBuilder('square', 16, true),
    ];
}

function colorAlgorithmModelBase(): array{
    return [
        'Threshold',
        new DitherAlgorithm('Closest Color', 'Threshold.closestColor', 'ColorDither.closestColor'),
        'Random',
        new DitherAlgorithm('Random', 'Threshold.randomClosestColor', 'ColorDither.randomClosestColor'),
        'Arithmetic',
        arithmeticDitherColorBuilder('XOR (High)', 'Xor1'),
        arithmeticDitherColorBuilder('XOR (Medium)', 'Xor3'),
        arithmeticDitherColorBuilder('XOR (Low)', 'Xor2'),
        arithmeticDitherColorBuilder('ADD (High)', 'Add1'),
        arithmeticDitherColorBuilder('ADD (Medium)', 'Add3'),
        arithmeticDitherColorBuilder('ADD (Low)', 'Add2'),
        'Diffusion',
        errorPropColorDitherBuilder('floydSteinberg', 'Floyd-Steinberg'),
        errorPropColorDitherBuilder('javisJudiceNinke', 'Javis-Judice-Ninke'),
        errorPropColorDitherBuilder('stucki'),
        errorPropColorDitherBuilder('burkes'),
        errorPropColorDitherBuilder('sierra3'),
        errorPropColorDitherBuilder('sierra2'),
        errorPropColorDitherBuilder('sierra1'),
        'Diffusion (Reduced Bleed)',
        errorPropColorDitherBuilder('atkinson'),
        errorPropColorDitherBuilder('garvey'),
        'Ordered (Bayer)',
        orderedDitherColorBuilder('bayer', 2),
        orderedDitherColorBuilder('bayer', 4),
        orderedDitherColorBuilder('bayer', 8),
        orderedDitherColorBuilder('bayer', 16),
        'Ordered (Bayer/Random)',
        orderedDitherColorRandomBuilder('bayer', 2),
        orderedDitherColorRandomBuilder('bayer', 4),
        orderedDitherColorRandomBuilder('bayer', 8),
        orderedDitherColorRandomBuilder('bayer', 16),
        'Ordered (Hue-Lightness)',
        hueLightnessBuilder('bayer', 2),
        hueLightnessBuilder('bayer', 4),
        hueLightnessBuilder('bayer', 16),
        hueLightnessBuilder('hatchHorizontal', 4),
        hueLightnessBuilder('hatchVertical', 4),
        hueLightnessBuilder('hatchRight', 4),
        hueLightnessBuilder('hatchLeft', 4),
        hueLightnessBuilder('crossHatchHorizontal', 4),
        hueLightnessBuilder('crossHatchVertical', 4),
        hueLightnessBuilder('crossHatchRight', 4),
        hueLightnessBuilder('crossHatchLeft', 4),
        hueLightnessBuilder('zigzagHorizontal',  4, true),
        hueLightnessBuilder('zigzagVertical',    4, true),
        hueLightnessBuilder('zigzagHorizontal',  8, true),
        hueLightnessBuilder('zigzagVertical',    8, true),
        hueLightnessBuilder('zigzagHorizontal', 16, true),
        hueLightnessBuilder('zigzagVertical',   16, true),
        hueLightnessBuilder('checkerboard', 2),
        hueLightnessBuilder('cluster', 4),
        hueLightnessBuilder('fishnet', 8),
        hueLightnessBuilder('dot', 4, true),
        hueLightnessBuilder('dot', 8, true),
        hueLightnessBuilder('halftone', 8),
        hueLightnessBuilder('square', 2, true),
        hueLightnessBuilder('square', 4, true),
        hueLightnessBuilder('square', 8, true),
        hueLightnessBuilder('square', 16, true),
        'Ordered (Hue-Lightness/Random)',
        hueLightnessRandomBuilder('bayer', 2),
        hueLightnessRandomBuilder('bayer', 4),
        hueLightnessRandomBuilder('bayer', 16),
        hueLightnessRandomBuilder('hatchHorizontal', 4),
        hueLightnessRandomBuilder('hatchVertical', 4),
        hueLightnessRandomBuilder('hatchRight', 4),
        hueLightnessRandomBuilder('hatchLeft', 4),
        hueLightnessRandomBuilder('crossHatchHorizontal', 4),
        hueLightnessRandomBuilder('crossHatchVertical', 4),
        hueLightnessRandomBuilder('crossHatchRight', 4),
        hueLightnessRandomBuilder('crossHatchLeft', 4),
        hueLightnessRandomBuilder('zigzagHorizontal',  4, true),
        hueLightnessRandomBuilder('zigzagVertical',    4, true),
        hueLightnessRandomBuilder('zigzagHorizontal',  8, true),
        hueLightnessRandomBuilder('zigzagVertical',    8, true),
        hueLightnessRandomBuilder('zigzagHorizontal', 16, true),
        hueLightnessRandomBuilder('zigzagVertical',   16, true),
        hueLightnessRandomBuilder('checkerboard', 2),
        hueLightnessRandomBuilder('cluster', 4),
        hueLightnessRandomBuilder('fishnet', 8),
        hueLightnessRandomBuilder('dot', 4, true),
        hueLightnessRandomBuilder('dot', 8, true),
        hueLightnessRandomBuilder('halftone', 8),
        hueLightnessRandomBuilder('square', 2, true),
        hueLightnessRandomBuilder('square', 4, true),
        hueLightnessRandomBuilder('square', 8, true),
        hueLightnessRandomBuilder('square', 16, true),
        'Yliluoma\'s Ordered Dithering 1',
        yliluoma1Builder('bayer', 2),
        yliluoma1Builder('bayer', 8),
        yliluoma1Builder('hatchHorizontal', 4),
        yliluoma1Builder('hatchVertical', 4),
        yliluoma1Builder('hatchRight', 4),
        yliluoma1Builder('hatchLeft', 4),
        yliluoma1Builder('crossHatchRight', 4),
        yliluoma1Builder('crossHatchLeft', 4),
        yliluoma1Builder('checkerboard', 2),
        yliluoma1Builder('cluster', 4),
        yliluoma1Builder('fishnet', 8),
        yliluoma1Builder('halftone', 8),
        yliluoma1Builder('dot', 4, true),
        yliluoma1Builder('dot', 8, true),
        'Yliluoma\'s Ordered Dithering 2',
        yliluoma2Builder('bayer', 2),
        yliluoma2Builder('bayer', 8),
        yliluoma2Builder('bayer', 16),
        yliluoma2Builder('hatchRight', 4),
        yliluoma2Builder('hatchLeft', 4),
        yliluoma2Builder('crossHatchHorizontal', 4),
        yliluoma2Builder('crossHatchVertical', 4),
        yliluoma2Builder('crossHatchRight', 4),
        yliluoma2Builder('crossHatchLeft', 4),
        yliluoma2Builder('zigzagHorizontal',  4, true),
        yliluoma2Builder('zigzagVertical',    4, true),
        yliluoma2Builder('zigzagHorizontal',  8, true),
        yliluoma2Builder('zigzagVertical',    8, true),
        yliluoma2Builder('zigzagHorizontal', 16, true),
        yliluoma2Builder('zigzagVertical',   16, true),
        yliluoma2Builder('checkerboard', 2),
        yliluoma2Builder('cluster', 4),
        yliluoma2Builder('fishnet', 8),
        yliluoma2Builder('halftone', 8),
        yliluoma2Builder('dot', 4, true),
        yliluoma2Builder('dot', 8, true),
        'Ordered (Hatch)',
        orderedDitherColorBuilder('hatchHorizontal', 4),
        orderedDitherColorBuilder('hatchVertical', 4),
        orderedDitherColorBuilder('hatchRight', 4),
        orderedDitherColorBuilder('hatchLeft', 4),
        'Ordered (Hatch/Random)',
        orderedDitherColorRandomBuilder('hatchHorizontal', 4),
        orderedDitherColorRandomBuilder('hatchVertical', 4),
        orderedDitherColorRandomBuilder('hatchRight', 4),
        orderedDitherColorRandomBuilder('hatchLeft', 4),
        'Ordered (Crosshatch)',
        orderedDitherColorBuilder('crossHatchHorizontal', 4),
        orderedDitherColorBuilder('crossHatchVertical', 4),
        orderedDitherColorBuilder('crossHatchRight', 4),
        orderedDitherColorBuilder('crossHatchLeft', 4),
        'Ordered (Crosshatch/Random)',
        orderedDitherColorRandomBuilder('crossHatchHorizontal', 4),
        orderedDitherColorRandomBuilder('crossHatchVertical', 4),
        orderedDitherColorRandomBuilder('crossHatchRight', 4),
        orderedDitherColorRandomBuilder('crossHatchLeft', 4),
        'Ordered (Zigzag)',
        orderedDitherColorBuilder('zigzagHorizontal',  4, true),
        orderedDitherColorBuilder('zigzagVertical',    4, true),
        orderedDitherColorBuilder('zigzagHorizontal',  8, true),
        orderedDitherColorBuilder('zigzagVertical',    8, true),
        orderedDitherColorBuilder('zigzagHorizontal', 16, true),
        orderedDitherColorBuilder('zigzagVertical',   16, true),
        'Ordered (Zigzag/Random)',
        orderedDitherColorRandomBuilder('zigzagVertical',    4, true),
        orderedDitherColorRandomBuilder('zigzagHorizontal',  4, true),
        orderedDitherColorRandomBuilder('zigzagVertical',    8, true),
        orderedDitherColorRandomBuilder('zigzagHorizontal',  8, true),
        orderedDitherColorRandomBuilder('zigzagVertical',   16, true),
        orderedDitherColorRandomBuilder('zigzagHorizontal', 16, true),
        'Ordered (Pattern)',
        orderedDitherColorBuilder('checkerboard', 2),
        orderedDitherColorBuilder('cluster', 4),
        orderedDitherColorBuilder('fishnet', 8),
        orderedDitherColorBuilder('dot', 4, true),
        orderedDitherColorBuilder('dot', 8, true),
        orderedDitherColorBuilder('halftone', 8),
        'Ordered (Pattern/Random)',
        orderedDitherColorRandomBuilder('checkerboard', 2),
        orderedDitherColorRandomBuilder('cluster', 4),
        orderedDitherColorRandomBuilder('fishnet', 8),
        orderedDitherColorRandomBuilder('dot', 4, true),
        orderedDitherColorRandomBuilder('dot', 8, true),
        orderedDitherColorRandomBuilder('halftone', 8),
        'Ordered (Square)',
        orderedDitherColorBuilder('square', 2, true),
        orderedDitherColorBuilder('square', 4, true),
        orderedDitherColorBuilder('square', 8, true),
        orderedDitherColorBuilder('square', 16, true),
        'Ordered (Square/Random)',
        orderedDitherColorRandomBuilder('square', 2, true),
        orderedDitherColorRandomBuilder('square', 4, true),
        orderedDitherColorRandomBuilder('square', 8, true),
        orderedDitherColorRandomBuilder('square', 16, true),
    ];
}

/**
* Algorithm model list functions
*/
function isDitherAlgorithm($item): bool{
    return gettype($item) === 'object';
}

function bwAlgorithmModel(): array{
    $model = array_filter(bwAlgorithmModelBase(), 'isDitherAlgorithm');

    return array_map(function($algoModel, $i){
        $algoModel->setId($i);
        return $algoModel;
        //have to use range instead of array_keys, since it will be indexes with optgroups
    }, $model, range(1, count($model)));
}

function colorAlgorithmModel(): array{
    $idOffset = count(bwAlgorithmModel());
    $model = array_filter(colorAlgorithmModelBase(), 'isDitherAlgorithm');

    return array_map(function($algoModel, $i){
        $algoModel->setId($i);
        return $algoModel;
    //have to use range instead of array_keys, since it will be indexes with optgroups
    }, $model, range($idOffset + 1, $idOffset + count($model)));
}


function printAppAlgoModel(array $algoModel){
    foreach($algoModel as $algorithm): ?>
			{
				title: '<?= $algorithm->name(); ?>',
				id: <?= $algorithm->id(); ?>,
				<?php if($algorithm->webGlFunc() !== ''): ?>
					webGlFunc: <?= $algorithm->webGlFunc(); ?>,
				<?php endif; ?>
                <?php if(!empty($algorithm->appOptions())): 
                    foreach($algorithm->appOptions() as $key => $value):
                        echo "${key}: $value";
                    endforeach; 
                endif; ?>
			},
		<?php endforeach;
}