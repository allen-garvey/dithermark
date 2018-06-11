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
function dimensionsPostfix(int $dimensions): string{
    return "${dimensions}×${dimensions}";
}
function bayerTitle(string $titlePrefix, int $dimensions, string $suffix=''): string{
    $dimensionsPostfix = dimensionsPostfix($dimensions);
    return "${titlePrefix} ${dimensionsPostfix}${suffix}";
}
function orderedMatrixTitle(string $titlePrefix, string $orderedMatrixName, int $dimensions, bool $isRandom=false, bool $addDimensionsToTitle=false): string{
    $randomIndicatorSuffix = $isRandom ? ' (R)' : '';
    if($orderedMatrixName === 'bayer'){
        return bayerTitle($titlePrefix, $dimensions, $randomIndicatorSuffix);
    }
    $matrixTitle = titleizeCamelCase($orderedMatrixName);
    if(!empty($titlePrefix)){
        return "${titlePrefix} (${matrixTitle})${randomIndicatorSuffix}";
    }
    $dimensionsPostfix = $addDimensionsToTitle ? dimensionsPostfix($dimensions).' ' : '';
    return "${matrixTitle} ${dimensionsPostfix}${randomIndicatorSuffix}";
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

function yliluoma1Builder(string $orderedMatrixName, int $dimensions): DitherAlgorithm{
    $titlePrefix = 'Yliluoma 1';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions);
    $webworkerFunc = "OrderedDither.createYliluoma1ColorDither(${dimensions}, '${orderedMatrixName}')";
    $webglFunc = "ColorDither.createYliluoma1OrderedDither(${dimensions}, '${orderedMatrixName}')";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function yliluoma2Builder(string $orderedMatrixName, int $dimensions): DitherAlgorithm{
    $titlePrefix = 'Yliluoma 2';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions);
    $webworkerFunc = "OrderedDither.createYliluoma2ColorDither(${dimensions}, '${orderedMatrixName}')";
    $webglFunc = "ColorDither.createYliluoma2OrderedDither(${dimensions}, '${orderedMatrixName}')";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function hueLightnessBuilder(string $orderedMatrixName, int $dimensions, bool $isRandom=false): DitherAlgorithm{
    $titlePrefix = 'Hue-Lightness';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, $isRandom);
    $randomArg = $isRandom ? ', true' : '';
    $webworkerFunc = "OrderedDither.createHueLightnessDither(${dimensions}${randomArg})";
    $webglFunc = "ColorDither.createHueLightnessOrderedDither(${dimensions}${randomArg})";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function orderedDitherBwBuilder(string $orderedMatrixName, int $dimensions, bool $isRandom=false, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = $orderedMatrixName === 'bayer' ? 'Ordered' : '';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, $isRandom, $addDimensionsToTitle);
    $pascalCase = ucfirst($orderedMatrixName);
    $randomArg = $isRandom ? ', true' : '';
    $webworkerFunc = "OrderedDither.create${pascalCase}Dither(${dimensions}${randomArg})";
    $webglFunc = "BwDither.create${pascalCase}Dither(${dimensions}${randomArg})";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}
function orderedDitherColorBuilder(string $orderedMatrixName, int $dimensions, bool $isRandom=false, bool $addDimensionsToTitle=false): DitherAlgorithm{
    $titlePrefix = $orderedMatrixName === 'bayer' ? 'Ordered' : '';
    $title = orderedMatrixTitle($titlePrefix, $orderedMatrixName, $dimensions, $isRandom, $addDimensionsToTitle);
    $pascalCase = ucfirst($orderedMatrixName);
    $randomArg = $isRandom ? ', true' : '';
    $webworkerFunc = "OrderedDither.create${pascalCase}ColorDither(${dimensions}${randomArg})";
    $webglFunc = "ColorDither.create${pascalCase}ColorDither(${dimensions}${randomArg})";
    return new DitherAlgorithm($title, $webworkerFunc, $webglFunc);
}

function errorPropBwDitherBuilder(string $funcName, string $title=''): DitherAlgorithm{
    $title = !empty($title) ? $title : ucfirst($funcName);
    return new DitherAlgorithm($title, "ErrorPropDither.${funcName}", '');
}
function errorPropColorDitherBuilder(string $funcName, string $title=''): DitherAlgorithm{
    $title = !empty($title) ? $title : ucfirst($funcName);
    return new DitherAlgorithm($title, "ErrorPropColorDither.${funcName}", '');
}
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
        orderedDitherBwBuilder('bayer', 2, true),
        orderedDitherBwBuilder('bayer', 4, true),
        orderedDitherBwBuilder('bayer', 8, true),
        orderedDitherBwBuilder('bayer', 16, true),
        'Ordered (Hatch)',
        orderedDitherBwBuilder('hatchHorizontal', 4),
        orderedDitherBwBuilder('hatchVertical', 4),
        orderedDitherBwBuilder('hatchRight', 4),
        orderedDitherBwBuilder('hatchLeft', 4),
        'Ordered (Hatch/Random)',
        orderedDitherBwBuilder('hatchHorizontal', 4, true),
        orderedDitherBwBuilder('hatchVertical', 4, true),
        orderedDitherBwBuilder('hatchRight', 4, true),
        orderedDitherBwBuilder('hatchLeft', 4, true),
        'Ordered (Crosshatch)',
        orderedDitherBwBuilder('crossHatchHorizontal', 4),
        orderedDitherBwBuilder('crossHatchVertical', 4),
        orderedDitherBwBuilder('crossHatchRight', 4),
        orderedDitherBwBuilder('crossHatchLeft', 4),
        'Ordered (Crosshatch/Random)',
        orderedDitherBwBuilder('crossHatchHorizontal', 4, true),
        orderedDitherBwBuilder('crossHatchVertical', 4, true),
        orderedDitherBwBuilder('crossHatchRight', 4, true),
        orderedDitherBwBuilder('crossHatchLeft', 4, true),
        'Ordered (Zigzag)',
        orderedDitherBwBuilder('zigzagHorizontal',  4, false, true),
        orderedDitherBwBuilder('zigzagVertical',    4, false, true),
        orderedDitherBwBuilder('zigzagHorizontal',  8, false, true),
        orderedDitherBwBuilder('zigzagVertical',    8, false, true),
        orderedDitherBwBuilder('zigzagHorizontal', 16, false, true),
        orderedDitherBwBuilder('zigzagVertical',   16, false, true),
        'Ordered (Zigzag/Random)',
        orderedDitherBwBuilder('zigzagHorizontal',  4, true, true),
        orderedDitherBwBuilder('zigzagVertical',    4, true, true),
        orderedDitherBwBuilder('zigzagHorizontal',  8, true, true),
        orderedDitherBwBuilder('zigzagVertical',    8, true, true),
        orderedDitherBwBuilder('zigzagHorizontal', 16, true, true),
        orderedDitherBwBuilder('zigzagVertical',   16, true, true),
        'Ordered (Pattern)',
        orderedDitherBwBuilder('cluster', 4),
        orderedDitherBwBuilder('fishnet', 8),
        orderedDitherBwBuilder('dot', 4, false, true),
        orderedDitherBwBuilder('dot', 8, false, true),
        orderedDitherBwBuilder('halftone', 8),
        'Ordered (Pattern/Random)',
        orderedDitherBwBuilder('cluster', 4, true),
        orderedDitherBwBuilder('fishnet', 8, true),
        orderedDitherBwBuilder('dot', 4, true, true),
        orderedDitherBwBuilder('dot', 8, true, true),
        orderedDitherBwBuilder('halftone', 8, true),
        'Ordered (Square)',
        orderedDitherBwBuilder('square', 2, false, true),
        orderedDitherBwBuilder('square', 4, false, true),
        orderedDitherBwBuilder('square', 8, false, true),
        orderedDitherBwBuilder('square', 16, false, true),
        'Ordered (Square/Random)',
        orderedDitherBwBuilder('square', 2, true, true),
        orderedDitherBwBuilder('square', 4, true, true),
        orderedDitherBwBuilder('square', 8, true, true),
        orderedDitherBwBuilder('square', 16, true, true),
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
        orderedDitherColorBuilder('bayer', 2, true),
        orderedDitherColorBuilder('bayer', 4, true),
        orderedDitherColorBuilder('bayer', 8, true),
        orderedDitherColorBuilder('bayer', 16, true),
        'Ordered (Hue-Lightness)',
        hueLightnessBuilder('bayer', 16),
        'Ordered (Hue-Lightness/Random)',
        hueLightnessBuilder('bayer', 16, true),
        'Ordered Arbitrary-palette Positional',
        yliluoma1Builder('bayer', 2),
        yliluoma1Builder('bayer', 8),
        yliluoma1Builder('crossHatchRight', 4),
        yliluoma1Builder('halftone', 8),
        yliluoma1Builder('dot', 4),
        yliluoma1Builder('dot', 8),
        yliluoma2Builder('bayer', 2),
        yliluoma2Builder('bayer', 8),
        yliluoma2Builder('bayer', 16),
        yliluoma2Builder('crossHatchRight', 4),
        yliluoma2Builder('halftone', 8),
        yliluoma2Builder('dot', 4),
        yliluoma2Builder('dot', 8),
        'Ordered (Hatch)',
        orderedDitherColorBuilder('hatchHorizontal', 4),
        orderedDitherColorBuilder('hatchVertical', 4),
        orderedDitherColorBuilder('hatchRight', 4),
        orderedDitherColorBuilder('hatchLeft', 4),
        'Ordered (Hatch/Random)',
        orderedDitherColorBuilder('hatchHorizontal', 4, true),
        orderedDitherColorBuilder('hatchVertical', 4, true),
        orderedDitherColorBuilder('hatchRight', 4, true),
        orderedDitherColorBuilder('hatchLeft', 4, true),
        'Ordered (Crosshatch)',
        orderedDitherColorBuilder('crossHatchHorizontal', 4),
        orderedDitherColorBuilder('crossHatchVertical', 4),
        orderedDitherColorBuilder('crossHatchRight', 4),
        orderedDitherColorBuilder('crossHatchLeft', 4),
        'Ordered (Crosshatch/Random)',
        orderedDitherColorBuilder('crossHatchHorizontal', 4, true),
        orderedDitherColorBuilder('crossHatchVertical', 4, true),
        orderedDitherColorBuilder('crossHatchRight', 4, true),
        orderedDitherColorBuilder('crossHatchLeft', 4, true),
        'Ordered (Zigzag)',
        orderedDitherColorBuilder('zigzagHorizontal',  4, false, true),
        orderedDitherColorBuilder('zigzagVertical',    4, false, true),
        orderedDitherColorBuilder('zigzagHorizontal',  8, false, true),
        orderedDitherColorBuilder('zigzagVertical',    8, false, true),
        orderedDitherColorBuilder('zigzagHorizontal', 16, false, true),
        orderedDitherColorBuilder('zigzagVertical',   16, false, true),
        'Ordered (Zigzag/Random)',
        orderedDitherColorBuilder('zigzagVertical',    4, true, true),
        orderedDitherColorBuilder('zigzagHorizontal',  4, true, true),
        orderedDitherColorBuilder('zigzagVertical',    8, true, true),
        orderedDitherColorBuilder('zigzagHorizontal',  8, true, true),
        orderedDitherColorBuilder('zigzagVertical',   16, true, true),
        orderedDitherColorBuilder('zigzagHorizontal', 16, true, true),
        'Ordered (Pattern)',
        orderedDitherColorBuilder('checkerboard', 2),
        orderedDitherColorBuilder('cluster', 4),
        orderedDitherColorBuilder('fishnet', 8),
        orderedDitherColorBuilder('dot', 4, false, true),
        orderedDitherColorBuilder('dot', 8, false, true),
        orderedDitherColorBuilder('halftone', 8),
        'Ordered (Pattern/Random)',
        orderedDitherColorBuilder('checkerboard', 2, true),
        orderedDitherColorBuilder('cluster', 4, true),
        orderedDitherColorBuilder('fishnet', 8, true),
        orderedDitherColorBuilder('dot', 4, true, true),
        orderedDitherColorBuilder('dot', 8, true, true),
        orderedDitherColorBuilder('halftone', 8, true),
        'Ordered (Square)',
        orderedDitherColorBuilder('square', 2, false, true),
        orderedDitherColorBuilder('square', 4, false, true),
        orderedDitherColorBuilder('square', 8, false, true),
        orderedDitherColorBuilder('square', 16, false, true),
        'Ordered (Square/Random)',
        orderedDitherColorBuilder('square', 2, true, true),
        orderedDitherColorBuilder('square', 4, true, true),
        orderedDitherColorBuilder('square', 8, true, true),
        orderedDitherColorBuilder('square', 16, true, true),
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