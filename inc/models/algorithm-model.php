<?php

class DitherAlgorithm {
    protected $id = null;
    protected $name;
    protected $workerFunc;
    protected $webglFunc;
    protected $appOptions;


    //appOptions is addition key-values to add to App algorithm model
    //currently only works with boolean and number values
    function __construct(string $name, string $workerFunc, string $webglFunc, array $appOptions=[]){
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
 * Ordered Matrix Patters
 */

class OrderedMatrixPattern {
    protected $jsFuncName;
    protected $dimensions;
    protected $addDimensionsToTitle;

    function __construct(string $jsFuncName, int $dimensions, bool $addDimensionsToTitle=false){
        $this->jsFuncName = $jsFuncName;
        $this->dimensions = $dimensions;
        $this->addDimensionsToTitle = $addDimensionsToTitle;
    }

    public function jsFuncName(): string{
        return $this->jsFuncName;
    }

    public function dimensions(): int{
        return $this->dimensions;
    }

    public function addDimensionsToTitle(): bool{
        return $this->addDimensionsToTitle;
    }
}

function getOrderedMatrixPatterns(): array{
    return [
        'BAYER_2'                   => new OrderedMatrixPattern('bayer', 2, true),
        'BAYER_4'                   => new OrderedMatrixPattern('bayer', 4, true),
        'BAYER_8'                   => new OrderedMatrixPattern('bayer', 8, true),
        'BAYER_16'                  => new OrderedMatrixPattern('bayer', 16, true),
        'HATCH_HORIZONTAL'          => new OrderedMatrixPattern('hatchHorizontal', 4),
        'HATCH_VERTICAL'            => new OrderedMatrixPattern('hatchVertical', 4),
        'HATCH_RIGHT'               => new OrderedMatrixPattern('hatchRight', 4),
        'HATCH_LEFT'                => new OrderedMatrixPattern('hatchLeft', 4),
        'CROSS_HATCH_HORIZONTAL'    => new OrderedMatrixPattern('crossHatchHorizontal', 4),
        'CROSS_HATCH_VERTICAL'      => new OrderedMatrixPattern('crossHatchVertical', 4),
        'CROSS_HATCH_RIGHT'         => new OrderedMatrixPattern('crossHatchRight', 4),
        'CROSS_HATCH_LEFT'          => new OrderedMatrixPattern('crossHatchLeft', 4),
        'ZIGZAG_HORIZONTAL_4'       => new OrderedMatrixPattern('zigzagHorizontal',  4, true),
        'ZIGZAG_VERTICAL_4'         => new OrderedMatrixPattern('zigzagVertical',    4, true),
        'ZIGZAG_HORIZONTAL_8'       => new OrderedMatrixPattern('zigzagHorizontal',  8, true),
        'ZIGZAG_VERTICAL_8'         => new OrderedMatrixPattern('zigzagVertical',    8, true),
        'ZIGZAG_HORIZONTAL_16'      => new OrderedMatrixPattern('zigzagHorizontal', 16, true),
        'ZIGZAG_VERTICAL_16'        => new OrderedMatrixPattern('zigzagVertical',   16, true),
        'CHECKERBOARD'              => new OrderedMatrixPattern('checkerboard', 2),
        'CLUSTER'                   => new OrderedMatrixPattern('cluster', 4),
        'FISHNET'                   => new OrderedMatrixPattern('fishnet', 8),
        'DOT_4'                     => new OrderedMatrixPattern('dot', 4, true),
        'DOT_8'                     => new OrderedMatrixPattern('dot', 8, true),
        'HALFTONE'                  => new OrderedMatrixPattern('halftone', 8),
        'SQUARE_2'                  => new OrderedMatrixPattern('square', 2, true),
        'SQUARE_4'                  => new OrderedMatrixPattern('square', 4, true),
        'SQUARE_8'                  => new OrderedMatrixPattern('square', 8, true),
        'SQUARE_16'                 => new OrderedMatrixPattern('square', 16, true),
    ];
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
function yliluoma1BuilderBase(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = 'Yliluoma 1';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, false, $addDimensionsToTitle);
    $webworkerFunc = "OrderedDither.createYliluoma1ColorDither(${dimensions}, '${orderedMatrixName}')";
    $webglFunc = "ColorDither.createYliluoma1OrderedDither(${dimensions}, '${orderedMatrixName}')";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function yliluoma1Builder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return yliluoma1BuilderBase($pattern->jsFuncName(), $pattern->dimensions(), $pattern->addDimensionsToTitle());
}
function yliluoma2BuilderBase(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = 'Yliluoma 2';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, false, $addDimensionsToTitle);
    $webworkerFunc = "OrderedDither.createYliluoma2ColorDither(${dimensions}, '${orderedMatrixName}')";
    $webglFunc = "ColorDither.createYliluoma2OrderedDither(${dimensions}, '${orderedMatrixName}')";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function yliluoma2Builder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return yliluoma2BuilderBase($pattern->jsFuncName(), $pattern->dimensions(), $pattern->addDimensionsToTitle());
}

/**
 * Stark Ordered Dither 
 */
function starkOrderedDitherBuilderBase(string $orderedMatrixName, int $dimensions, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = 'Stark Ordered Dither';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, false, $addDimensionsToTitle);
    // $webworkerFunc = "OrderedDither.createYliluoma1ColorDither(${dimensions}, '${orderedMatrixName}')";
    $webworkerFunc = '';
    $webglFunc = "ColorDither.createStarkOrderedDither(${dimensions}, '${orderedMatrixName}')";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function starkOrderedDitherBuilder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return starkOrderedDitherBuilderBase($pattern->jsFuncName(), $pattern->dimensions(), $pattern->addDimensionsToTitle());
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
function hueLightnessBuilder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return hueLightnessBuilderBase($pattern->jsFuncName(), $pattern->dimensions(), false, $pattern->addDimensionsToTitle());
}
function hueLightnessRandomBuilder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return hueLightnessBuilderBase($pattern->jsFuncName(), $pattern->dimensions(), true, $pattern->addDimensionsToTitle());
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
function orderedDitherBwBuilder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return orderedDitherBwBuilderBase($pattern->jsFuncName(), $pattern->dimensions(), false, $pattern->addDimensionsToTitle());
}
function orderedDitherBwRandomBuilder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return orderedDitherBwBuilderBase($pattern->jsFuncName(), $pattern->dimensions(), true, $pattern->addDimensionsToTitle());
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
function orderedDitherColorBuilder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return orderedDitherColorBuilderBase($pattern->jsFuncName(), $pattern->dimensions(), false, $pattern->addDimensionsToTitle());
}
function orderedDitherColorRandomBuilder(OrderedMatrixPattern $pattern): DitherAlgorithm{
    return orderedDitherColorBuilderBase($pattern->jsFuncName(), $pattern->dimensions(), true, $pattern->addDimensionsToTitle());
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
    $patterns = getOrderedMatrixPatterns();

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
        orderedDitherBwBuilder($patterns['BAYER_2']),
        orderedDitherBwBuilder($patterns['BAYER_4']),
        orderedDitherBwBuilder($patterns['BAYER_8']),
        orderedDitherBwBuilder($patterns['BAYER_16']),
        'Ordered (Bayer/Random)',
        orderedDitherBwRandomBuilder($patterns['BAYER_2']),
        orderedDitherBwRandomBuilder($patterns['BAYER_4']),
        orderedDitherBwRandomBuilder($patterns['BAYER_8']),
        orderedDitherBwRandomBuilder($patterns['BAYER_16']),
        'Ordered (Hatch)',
        orderedDitherBwBuilder($patterns['HATCH_HORIZONTAL']),
        orderedDitherBwBuilder($patterns['HATCH_VERTICAL']),
        orderedDitherBwBuilder($patterns['HATCH_RIGHT']),
        orderedDitherBwBuilder($patterns['HATCH_LEFT']),
        'Ordered (Hatch/Random)',
        orderedDitherBwRandomBuilder($patterns['HATCH_HORIZONTAL']),
        orderedDitherBwRandomBuilder($patterns['HATCH_VERTICAL']),
        orderedDitherBwRandomBuilder($patterns['HATCH_RIGHT']),
        orderedDitherBwRandomBuilder($patterns['HATCH_LEFT']),
        'Ordered (Crosshatch)',
        orderedDitherBwBuilder($patterns['CROSS_HATCH_HORIZONTAL']),
        orderedDitherBwBuilder($patterns['CROSS_HATCH_VERTICAL']),
        orderedDitherBwBuilder($patterns['CROSS_HATCH_RIGHT']),
        orderedDitherBwBuilder($patterns['CROSS_HATCH_LEFT']),
        'Ordered (Crosshatch/Random)',
        orderedDitherBwRandomBuilder($patterns['CROSS_HATCH_HORIZONTAL']),
        orderedDitherBwRandomBuilder($patterns['CROSS_HATCH_VERTICAL']),
        orderedDitherBwRandomBuilder($patterns['CROSS_HATCH_RIGHT']),
        orderedDitherBwRandomBuilder($patterns['CROSS_HATCH_LEFT']),
        'Ordered (Zigzag)',
        orderedDitherBwBuilder($patterns['ZIGZAG_HORIZONTAL_4']),
        orderedDitherBwBuilder($patterns['ZIGZAG_VERTICAL_4']),
        orderedDitherBwBuilder($patterns['ZIGZAG_HORIZONTAL_8']),
        orderedDitherBwBuilder($patterns['ZIGZAG_VERTICAL_8']),
        orderedDitherBwBuilder($patterns['ZIGZAG_HORIZONTAL_16']),
        orderedDitherBwBuilder($patterns['ZIGZAG_VERTICAL_16']),
        'Ordered (Zigzag/Random)',
        orderedDitherBwRandomBuilder($patterns['ZIGZAG_HORIZONTAL_4']),
        orderedDitherBwRandomBuilder($patterns['ZIGZAG_VERTICAL_4']),
        orderedDitherBwRandomBuilder($patterns['ZIGZAG_HORIZONTAL_8']),
        orderedDitherBwRandomBuilder($patterns['ZIGZAG_VERTICAL_8']),
        orderedDitherBwRandomBuilder($patterns['ZIGZAG_HORIZONTAL_16']),
        orderedDitherBwRandomBuilder($patterns['ZIGZAG_VERTICAL_16']),
        'Ordered (Pattern)',
        orderedDitherBwBuilder($patterns['CHECKERBOARD']),
        orderedDitherBwBuilder($patterns['CLUSTER']),
        orderedDitherBwBuilder($patterns['FISHNET']),
        orderedDitherBwBuilder($patterns['DOT_4']),
        orderedDitherBwBuilder($patterns['DOT_8']),
        orderedDitherBwBuilder($patterns['HALFTONE']),
        'Ordered (Pattern/Random)',
        orderedDitherBwRandomBuilder($patterns['CHECKERBOARD']),
        orderedDitherBwRandomBuilder($patterns['CLUSTER']),
        orderedDitherBwRandomBuilder($patterns['FISHNET']),
        orderedDitherBwRandomBuilder($patterns['DOT_4']),
        orderedDitherBwRandomBuilder($patterns['DOT_8']),
        orderedDitherBwRandomBuilder($patterns['HALFTONE']),
        'Ordered (Square)',
        orderedDitherBwBuilder($patterns['SQUARE_2']),
        orderedDitherBwBuilder($patterns['SQUARE_4']),
        orderedDitherBwBuilder($patterns['SQUARE_8']),
        orderedDitherBwBuilder($patterns['SQUARE_16']),
        'Ordered (Square/Random)',
        orderedDitherBwRandomBuilder($patterns['SQUARE_2']),
        orderedDitherBwRandomBuilder($patterns['SQUARE_4']),
        orderedDitherBwRandomBuilder($patterns['SQUARE_8']),
        orderedDitherBwRandomBuilder($patterns['SQUARE_16']),
    ];
}

function colorAlgorithmModelBase(): array{
    $patterns = getOrderedMatrixPatterns();

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
        orderedDitherColorBuilder($patterns['BAYER_2']),
        orderedDitherColorBuilder($patterns['BAYER_4']),
        orderedDitherColorBuilder($patterns['BAYER_8']),
        orderedDitherColorBuilder($patterns['BAYER_16']),
        'Ordered (Bayer/Random)',
        orderedDitherColorRandomBuilder($patterns['BAYER_2']),
        orderedDitherColorRandomBuilder($patterns['BAYER_4']),
        orderedDitherColorRandomBuilder($patterns['BAYER_8']),
        orderedDitherColorRandomBuilder($patterns['BAYER_16']),
        'Ordered (Hue-Lightness)',
        hueLightnessBuilder($patterns['BAYER_2']),
        hueLightnessBuilder($patterns['BAYER_4']),
        hueLightnessBuilder($patterns['BAYER_16']),
        hueLightnessBuilder($patterns['HATCH_HORIZONTAL']),
        hueLightnessBuilder($patterns['HATCH_VERTICAL']),
        hueLightnessBuilder($patterns['HATCH_RIGHT']),
        hueLightnessBuilder($patterns['HATCH_LEFT']),
        hueLightnessBuilder($patterns['CROSS_HATCH_HORIZONTAL']),
        hueLightnessBuilder($patterns['CROSS_HATCH_VERTICAL']),
        hueLightnessBuilder($patterns['CROSS_HATCH_RIGHT']),
        hueLightnessBuilder($patterns['CROSS_HATCH_LEFT']),
        hueLightnessBuilder($patterns['ZIGZAG_HORIZONTAL_4']),
        hueLightnessBuilder($patterns['ZIGZAG_VERTICAL_4']),
        hueLightnessBuilder($patterns['ZIGZAG_HORIZONTAL_8']),
        hueLightnessBuilder($patterns['ZIGZAG_VERTICAL_8']),
        hueLightnessBuilder($patterns['ZIGZAG_HORIZONTAL_16']),
        hueLightnessBuilder($patterns['ZIGZAG_VERTICAL_16']),
        hueLightnessBuilder($patterns['CHECKERBOARD']),
        hueLightnessBuilder($patterns['CLUSTER']),
        hueLightnessBuilder($patterns['FISHNET']),
        hueLightnessBuilder($patterns['DOT_4']),
        hueLightnessBuilder($patterns['DOT_8']),
        hueLightnessBuilder($patterns['HALFTONE']),
        hueLightnessBuilder($patterns['SQUARE_2']),
        hueLightnessBuilder($patterns['SQUARE_4']),
        hueLightnessBuilder($patterns['SQUARE_8']),
        hueLightnessBuilder($patterns['SQUARE_16']),
        'Ordered (Hue-Lightness/Random)',
        hueLightnessRandomBuilder($patterns['BAYER_2']),
        hueLightnessRandomBuilder($patterns['BAYER_4']),
        hueLightnessRandomBuilder($patterns['BAYER_16']),
        hueLightnessRandomBuilder($patterns['HATCH_HORIZONTAL']),
        hueLightnessRandomBuilder($patterns['HATCH_VERTICAL']),
        hueLightnessRandomBuilder($patterns['HATCH_RIGHT']),
        hueLightnessRandomBuilder($patterns['HATCH_LEFT']),
        hueLightnessRandomBuilder($patterns['CROSS_HATCH_HORIZONTAL']),
        hueLightnessRandomBuilder($patterns['CROSS_HATCH_VERTICAL']),
        hueLightnessRandomBuilder($patterns['CROSS_HATCH_RIGHT']),
        hueLightnessRandomBuilder($patterns['CROSS_HATCH_LEFT']),
        hueLightnessRandomBuilder($patterns['ZIGZAG_HORIZONTAL_4']),
        hueLightnessRandomBuilder($patterns['ZIGZAG_VERTICAL_4']),
        hueLightnessRandomBuilder($patterns['ZIGZAG_HORIZONTAL_8']),
        hueLightnessRandomBuilder($patterns['ZIGZAG_VERTICAL_8']),
        hueLightnessRandomBuilder($patterns['ZIGZAG_HORIZONTAL_16']),
        hueLightnessRandomBuilder($patterns['ZIGZAG_VERTICAL_16']),
        hueLightnessRandomBuilder($patterns['CHECKERBOARD']),
        hueLightnessRandomBuilder($patterns['CLUSTER']),
        hueLightnessRandomBuilder($patterns['FISHNET']),
        hueLightnessRandomBuilder($patterns['DOT_4']),
        hueLightnessRandomBuilder($patterns['DOT_8']),
        hueLightnessRandomBuilder($patterns['HALFTONE']),
        hueLightnessRandomBuilder($patterns['SQUARE_2']),
        hueLightnessRandomBuilder($patterns['SQUARE_4']),
        hueLightnessRandomBuilder($patterns['SQUARE_8']),
        hueLightnessRandomBuilder($patterns['SQUARE_16']),
        'Stark Ordered Dither',
        starkOrderedDitherBuilder($patterns['BAYER_2']),
        starkOrderedDitherBuilder($patterns['BAYER_4']),
        starkOrderedDitherBuilder($patterns['BAYER_16']),
        starkOrderedDitherBuilder($patterns['HATCH_HORIZONTAL']),
        starkOrderedDitherBuilder($patterns['HATCH_VERTICAL']),
        starkOrderedDitherBuilder($patterns['HATCH_RIGHT']),
        starkOrderedDitherBuilder($patterns['HATCH_LEFT']),
        starkOrderedDitherBuilder($patterns['CROSS_HATCH_HORIZONTAL']),
        starkOrderedDitherBuilder($patterns['CROSS_HATCH_VERTICAL']),
        starkOrderedDitherBuilder($patterns['CROSS_HATCH_RIGHT']),
        starkOrderedDitherBuilder($patterns['CROSS_HATCH_LEFT']),
        starkOrderedDitherBuilder($patterns['ZIGZAG_HORIZONTAL_4']),
        starkOrderedDitherBuilder($patterns['ZIGZAG_VERTICAL_4']),
        starkOrderedDitherBuilder($patterns['ZIGZAG_HORIZONTAL_8']),
        starkOrderedDitherBuilder($patterns['ZIGZAG_VERTICAL_8']),
        starkOrderedDitherBuilder($patterns['ZIGZAG_HORIZONTAL_16']),
        starkOrderedDitherBuilder($patterns['ZIGZAG_VERTICAL_16']),
        starkOrderedDitherBuilder($patterns['CHECKERBOARD']),
        starkOrderedDitherBuilder($patterns['CLUSTER']),
        starkOrderedDitherBuilder($patterns['FISHNET']),
        starkOrderedDitherBuilder($patterns['DOT_4']),
        starkOrderedDitherBuilder($patterns['DOT_8']),
        starkOrderedDitherBuilder($patterns['HALFTONE']),
        starkOrderedDitherBuilder($patterns['SQUARE_2']),
        starkOrderedDitherBuilder($patterns['SQUARE_4']),
        starkOrderedDitherBuilder($patterns['SQUARE_8']),
        starkOrderedDitherBuilder($patterns['SQUARE_16']),
        'Yliluoma\'s Ordered Dithering 1',
        yliluoma1Builder($patterns['BAYER_2']),
        yliluoma1Builder($patterns['BAYER_8']),
        yliluoma1Builder($patterns['HATCH_HORIZONTAL']),
        yliluoma1Builder($patterns['HATCH_VERTICAL']),
        yliluoma1Builder($patterns['HATCH_RIGHT']),
        yliluoma1Builder($patterns['HATCH_LEFT']),
        yliluoma1Builder($patterns['CROSS_HATCH_RIGHT']),
        yliluoma1Builder($patterns['CROSS_HATCH_LEFT']),
        yliluoma1Builder($patterns['CHECKERBOARD']),
        yliluoma1Builder($patterns['CLUSTER']),
        yliluoma1Builder($patterns['FISHNET']),
        yliluoma1Builder($patterns['HALFTONE']),
        yliluoma1Builder($patterns['DOT_4']),
        yliluoma1Builder($patterns['DOT_8']),
        'Yliluoma\'s Ordered Dithering 2',
        yliluoma2Builder($patterns['BAYER_2']),
        yliluoma2Builder($patterns['BAYER_8']),
        yliluoma2Builder($patterns['BAYER_16']),
        yliluoma2Builder($patterns['HATCH_RIGHT']),
        yliluoma2Builder($patterns['HATCH_LEFT']),
        yliluoma2Builder($patterns['CROSS_HATCH_HORIZONTAL']),
        yliluoma2Builder($patterns['CROSS_HATCH_VERTICAL']),
        yliluoma2Builder($patterns['CROSS_HATCH_RIGHT']),
        yliluoma2Builder($patterns['CROSS_HATCH_LEFT']),
        yliluoma2Builder($patterns['ZIGZAG_HORIZONTAL_4']),
        yliluoma2Builder($patterns['ZIGZAG_VERTICAL_4']),
        yliluoma2Builder($patterns['ZIGZAG_HORIZONTAL_8']),
        yliluoma2Builder($patterns['ZIGZAG_VERTICAL_8']),
        yliluoma2Builder($patterns['ZIGZAG_HORIZONTAL_16']),
        yliluoma2Builder($patterns['ZIGZAG_VERTICAL_16']),
        yliluoma2Builder($patterns['CHECKERBOARD']),
        yliluoma2Builder($patterns['CLUSTER']),
        yliluoma2Builder($patterns['FISHNET']),
        yliluoma2Builder($patterns['HALFTONE']),
        yliluoma2Builder($patterns['DOT_4']),
        yliluoma2Builder($patterns['DOT_8']),
        'Ordered (Hatch)',
        orderedDitherColorBuilder($patterns['HATCH_HORIZONTAL']),
        orderedDitherColorBuilder($patterns['HATCH_VERTICAL']),
        orderedDitherColorBuilder($patterns['HATCH_RIGHT']),
        orderedDitherColorBuilder($patterns['HATCH_LEFT']),
        'Ordered (Hatch/Random)',
        orderedDitherColorRandomBuilder($patterns['HATCH_HORIZONTAL']),
        orderedDitherColorRandomBuilder($patterns['HATCH_VERTICAL']),
        orderedDitherColorRandomBuilder($patterns['HATCH_RIGHT']),
        orderedDitherColorRandomBuilder($patterns['HATCH_LEFT']),
        'Ordered (Crosshatch)',
        orderedDitherColorBuilder($patterns['CROSS_HATCH_HORIZONTAL']),
        orderedDitherColorBuilder($patterns['CROSS_HATCH_VERTICAL']),
        orderedDitherColorBuilder($patterns['CROSS_HATCH_RIGHT']),
        orderedDitherColorBuilder($patterns['CROSS_HATCH_LEFT']),
        'Ordered (Crosshatch/Random)',
        orderedDitherColorRandomBuilder($patterns['CROSS_HATCH_HORIZONTAL']),
        orderedDitherColorRandomBuilder($patterns['CROSS_HATCH_VERTICAL']),
        orderedDitherColorRandomBuilder($patterns['CROSS_HATCH_RIGHT']),
        orderedDitherColorRandomBuilder($patterns['CROSS_HATCH_LEFT']),
        'Ordered (Zigzag)',
        orderedDitherColorBuilder($patterns['ZIGZAG_HORIZONTAL_4']),
        orderedDitherColorBuilder($patterns['ZIGZAG_VERTICAL_4']),
        orderedDitherColorBuilder($patterns['ZIGZAG_HORIZONTAL_8']),
        orderedDitherColorBuilder($patterns['ZIGZAG_VERTICAL_8']),
        orderedDitherColorBuilder($patterns['ZIGZAG_HORIZONTAL_16']),
        orderedDitherColorBuilder($patterns['ZIGZAG_VERTICAL_16']),
        'Ordered (Zigzag/Random)',
        orderedDitherColorRandomBuilder($patterns['ZIGZAG_VERTICAL_4']),
        orderedDitherColorRandomBuilder($patterns['ZIGZAG_HORIZONTAL_4']),
        orderedDitherColorRandomBuilder($patterns['ZIGZAG_VERTICAL_8']),
        orderedDitherColorRandomBuilder($patterns['ZIGZAG_HORIZONTAL_8']),
        orderedDitherColorRandomBuilder($patterns['ZIGZAG_VERTICAL_16']),
        orderedDitherColorRandomBuilder($patterns['ZIGZAG_HORIZONTAL_16']),
        'Ordered (Pattern)',
        orderedDitherColorBuilder($patterns['CHECKERBOARD']),
        orderedDitherColorBuilder($patterns['CLUSTER']),
        orderedDitherColorBuilder($patterns['FISHNET']),
        orderedDitherColorBuilder($patterns['DOT_4']),
        orderedDitherColorBuilder($patterns['DOT_8']),
        orderedDitherColorBuilder($patterns['HALFTONE']),
        'Ordered (Pattern/Random)',
        orderedDitherColorRandomBuilder($patterns['CHECKERBOARD']),
        orderedDitherColorRandomBuilder($patterns['CLUSTER']),
        orderedDitherColorRandomBuilder($patterns['FISHNET']),
        orderedDitherColorRandomBuilder($patterns['DOT_4']),
        orderedDitherColorRandomBuilder($patterns['DOT_8']),
        orderedDitherColorRandomBuilder($patterns['HALFTONE']),
        'Ordered (Square)',
        orderedDitherColorBuilder($patterns['SQUARE_2']),
        orderedDitherColorBuilder($patterns['SQUARE_4']),
        orderedDitherColorBuilder($patterns['SQUARE_8']),
        orderedDitherColorBuilder($patterns['SQUARE_16']),
        'Ordered (Square/Random)',
        orderedDitherColorRandomBuilder($patterns['SQUARE_2']),
        orderedDitherColorRandomBuilder($patterns['SQUARE_4']),
        orderedDitherColorRandomBuilder($patterns['SQUARE_8']),
        orderedDitherColorRandomBuilder($patterns['SQUARE_16']),
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