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
function bayerTitle(string $titlePrefix, int $dimensions, string $postfix=''): string{
    return "${titlePrefix} ${dimensions}×${dimensions}${postfix}";
}
function orderedMatrixTitle(string $titlePrefix, string $orderedMatrixName, int $dimensions, bool $isRandom=false): string{
    $randomIndicatorPostfix = $isRandom ? ' (R)' : '';
    if($orderedMatrixName === 'bayer'){
        return bayerTitle($titlePrefix, $dimensions, $randomIndicatorPostfix);
    }
    $matrixTitle = titleizeCamelCase($orderedMatrixName);
    return "${titlePrefix} (${matrixTitle})${randomIndicatorPostfix}";
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
        new DitherAlgorithm('Adither XOR (High)', 'Threshold.aditherXor1', 'BwDither.aDitherXor1', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither XOR (Medium)', 'Threshold.aditherXor3', 'BwDither.aDitherXor3', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither XOR (Low)', 'Threshold.aditherXor2', 'BwDither.aDitherXor2', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither ADD (High)', 'Threshold.aditherAdd1', 'BwDither.aDitherAdd1', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither ADD (Medium)', 'Threshold.aditherAdd3', 'BwDither.aDitherAdd3', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither ADD (Low)', 'Threshold.aditherAdd2', 'BwDither.aDitherAdd2', ['requiresHighPrecisionInt' => 'true']),
        'Diffusion',
        new DitherAlgorithm('Floyd-Steinberg', 'ErrorPropDither.floydSteinberg', ''),
        new DitherAlgorithm('Javis-Judice-Ninke', 'ErrorPropDither.javisJudiceNinke', ''),
        new DitherAlgorithm('Stucki', 'ErrorPropDither.stucki', ''),
        new DitherAlgorithm('Burkes', 'ErrorPropDither.burkes', ''),
        new DitherAlgorithm('Sierra3', 'ErrorPropDither.sierra3', ''),
        new DitherAlgorithm('Sierra2', 'ErrorPropDither.sierra2', ''),
        new DitherAlgorithm('Sierra1', 'ErrorPropDither.sierra1', ''),
        'Diffusion (Reduced Bleed)',
        new DitherAlgorithm('Atkinson', 'ErrorPropDither.atkinson', ''),
        new DitherAlgorithm('Garvey', 'ErrorPropDither.garvey', ''),
        'Ordered (Bayer)',
        new DitherAlgorithm('Ordered 2×2', 'OrderedDither.createBayerDither(2)', 'BwDither.createBayerDither(2)'),
        new DitherAlgorithm('Ordered 4×4', 'OrderedDither.createBayerDither(4)', 'BwDither.createBayerDither(4)'),
        new DitherAlgorithm('Ordered 8×8', 'OrderedDither.createBayerDither(8)', 'BwDither.createBayerDither(8)'),
        new DitherAlgorithm('Ordered 16×16', 'OrderedDither.createBayerDither(16)', 'BwDither.createBayerDither(16)'),
        'Ordered (Bayer/Random)',
        new DitherAlgorithm('Ordered 2×2 (R)', 'OrderedDither.createBayerDither(2, true)', 'BwDither.createBayerDither(2, true)'),
        new DitherAlgorithm('Ordered 4×4 (R)', 'OrderedDither.createBayerDither(4, true)', 'BwDither.createBayerDither(4, true)'),
        new DitherAlgorithm('Ordered 8×8 (R)', 'OrderedDither.createBayerDither(8, true)', 'BwDither.createBayerDither(8, true)'),
        new DitherAlgorithm('Ordered 16×16 (R)', 'OrderedDither.createBayerDither(16, true)', 'BwDither.createBayerDither(16, true)'),
        'Ordered (Hatch)',
        new DitherAlgorithm('Hatch Vertical', 'OrderedDither.createHatchVerticalDither(4)', 'BwDither.createHatchVerticalDither(4)'),
        new DitherAlgorithm('Hatch Horizontal', 'OrderedDither.createHatchHorizontalDither(4)', 'BwDither.createHatchHorizontalDither(4)'),
        new DitherAlgorithm('Hatch Right', 'OrderedDither.createHatchRightDither(4)', 'BwDither.createHatchRightDither(4)'),
        new DitherAlgorithm('Hatch Left', 'OrderedDither.createHatchLeftDither(4)', 'BwDither.createHatchLeftDither(4)'),
        'Ordered (Hatch/Random)',
        new DitherAlgorithm('Hatch Vertical (R)', 'OrderedDither.createHatchVerticalDither(4, true)', 'BwDither.createHatchVerticalDither(4, true)'),
        new DitherAlgorithm('Hatch Horizontal (R)', 'OrderedDither.createHatchHorizontalDither(4, true)', 'BwDither.createHatchHorizontalDither(4, true)'),
        new DitherAlgorithm('Hatch Right (R)', 'OrderedDither.createHatchRightDither(4, true)', 'BwDither.createHatchRightDither(4, true)'),
        new DitherAlgorithm('Hatch Left (R)', 'OrderedDither.createHatchLeftDither(4, true)', 'BwDither.createHatchLeftDither(4, true)'),
        'Ordered (Crosshatch)',
        new DitherAlgorithm('Crosshatch Vertical', 'OrderedDither.createCrossHatchVerticalDither(4)', 'BwDither.createCrossHatchVerticalDither(4)'),
        new DitherAlgorithm('Crosshatch Horizontal', 'OrderedDither.createCrossHatchHorizontalDither(4)', 'BwDither.createCrossHatchHorizontalDither(4)'),
        new DitherAlgorithm('Crosshatch Right', 'OrderedDither.createCrossHatchRightDither(4)', 'BwDither.createCrossHatchRightDither(4)'),
        new DitherAlgorithm('Crosshatch Left', 'OrderedDither.createCrossHatchLeftDither(4)', 'BwDither.createCrossHatchLeftDither(4)'),
        'Ordered (Crosshatch/Random)',
        new DitherAlgorithm('Crosshatch Vertical (R)', 'OrderedDither.createCrossHatchVerticalDither(4, true)', 'BwDither.createCrossHatchVerticalDither(4, true)'),
        new DitherAlgorithm('Crosshatch Horizontal (R)', 'OrderedDither.createCrossHatchHorizontalDither(4, true)', 'BwDither.createCrossHatchHorizontalDither(4, true)'),
        new DitherAlgorithm('Crosshatch Right (R)', 'OrderedDither.createCrossHatchRightDither(4, true)', 'BwDither.createCrossHatchRightDither(4, true)'),
        new DitherAlgorithm('Crosshatch Left (R)', 'OrderedDither.createCrossHatchLeftDither(4, true)', 'BwDither.createCrossHatchLeftDither(4, true)'),
        'Ordered (Zigzag)',
        new DitherAlgorithm('Zigzag 4×4 Horizontal', 'OrderedDither.createZigZagDither(4)', 'BwDither.createZigZagDither(4)'),
        new DitherAlgorithm('Zigzag 4×4 Vertical', 'OrderedDither.createZigZagVerticalDither(4)', 'BwDither.createZigZagVerticalDither(4)'),
        new DitherAlgorithm('Zigzag 8×8 Horizontal', 'OrderedDither.createZigZagDither(8)', 'BwDither.createZigZagDither(8)'),
        new DitherAlgorithm('Zigzag 8×8 Vertical', 'OrderedDither.createZigZagVerticalDither(8)', 'BwDither.createZigZagVerticalDither(8)'),
        new DitherAlgorithm('Zigzag 16×16 Horizontal', 'OrderedDither.createZigZagDither(16)', 'BwDither.createZigZagDither(16)'),
        new DitherAlgorithm('Zigzag 16×16 Vertical', 'OrderedDither.createZigZagVerticalDither(16)', 'BwDither.createZigZagVerticalDither(16)'),
        'Ordered (Zigzag/Random)',
        new DitherAlgorithm('Zigzag 4×4 Horizontal (R)', 'OrderedDither.createZigZagDither(4, true)', 'BwDither.createZigZagDither(4, true)'),
        new DitherAlgorithm('Zigzag 4×4 Vertical (R)', 'OrderedDither.createZigZagVerticalDither(4, true)', 'BwDither.createZigZagVerticalDither(4, true)'),
        new DitherAlgorithm('Zigzag 8×8 Horizontal (R)', 'OrderedDither.createZigZagDither(8, true)', 'BwDither.createZigZagDither(8, true)'),
        new DitherAlgorithm('Zigzag 8×8 Vertical (R)', 'OrderedDither.createZigZagVerticalDither(8, true)', 'BwDither.createZigZagVerticalDither(8, true)'),
        new DitherAlgorithm('Zigzag 16×16 Horizontal (R)', 'OrderedDither.createZigZagDither(16, true)', 'BwDither.createZigZagDither(16, true)'),
        new DitherAlgorithm('Zigzag 16×16 Vertical (R)', 'OrderedDither.createZigZagVerticalDither(16, true)', 'BwDither.createZigZagVerticalDither(16, true)'),
        'Ordered (Pattern)',
        new DitherAlgorithm('Cluster', 'OrderedDither.createClusterDither(4)', 'BwDither.createClusterDither(4)'),
        new DitherAlgorithm('Fishnet', 'OrderedDither.createFishnetDither(8)', 'BwDither.createFishnetDither(8)'),
        new DitherAlgorithm('Dot 4×4', 'OrderedDither.createDotDither(4)', 'BwDither.createDotDither(4)'),
        new DitherAlgorithm('Dot 8×8', 'OrderedDither.createDotDither(8)', 'BwDither.createDotDither(8)'),
        new DitherAlgorithm('Halftone', 'OrderedDither.createHalftoneDither(8)', 'BwDither.createHalftoneDither(8)'),
        'Ordered (Pattern/Random)',
        new DitherAlgorithm('Cluster (R)', 'OrderedDither.createClusterDither(4, true)', 'BwDither.createClusterDither(4, true)'),
        new DitherAlgorithm('Fishnet (R)', 'OrderedDither.createFishnetDither(8, true)', 'BwDither.createFishnetDither(8, true)'),
        new DitherAlgorithm('Dot 4×4 (R)', 'OrderedDither.createDotDither(4, true)', 'BwDither.createDotDither(4, true)'),
        new DitherAlgorithm('Dot 8×8 (R)', 'OrderedDither.createDotDither(8, true)', 'BwDither.createDotDither(8, true)'),
        new DitherAlgorithm('Halftone (R)', 'OrderedDither.createHalftoneDither(8, true)', 'BwDither.createHalftoneDither(8, true)'),
        'Ordered (Square/Random)',
        new DitherAlgorithm('Square 2×2 (R)', 'OrderedDither.createSquareDither(2, true)', 'BwDither.createSquareDither(2, true)'),
        new DitherAlgorithm('Square 4×4 (R)', 'OrderedDither.createSquareDither(4, true)', 'BwDither.createSquareDither(4, true)'),
        new DitherAlgorithm('Square 8×8 (R)', 'OrderedDither.createSquareDither(8, true)', 'BwDither.createSquareDither(8, true)'),
        new DitherAlgorithm('Square 16×16 (R)', 'OrderedDither.createSquareDither(16, true)', 'BwDither.createSquareDither(16, true)'),
    ];
}

function colorAlgorithmModelBase(): array{
    return [
        'Threshold',
        new DitherAlgorithm('Closest Color', 'Threshold.closestColor', 'ColorDither.closestColor'),
        'Random',
        new DitherAlgorithm('Random', 'Threshold.randomClosestColor', 'ColorDither.randomClosestColor'),
        'Arithmetic',
        new DitherAlgorithm('Adither XOR (High)', 'Threshold.aditherXor1Color', 'ColorDither.aDitherXor1', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither XOR (Medium)', 'Threshold.aditherXor3Color', 'ColorDither.aDitherXor3', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither XOR (Low)', 'Threshold.aditherXor2Color', 'ColorDither.aDitherXor2', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither ADD (High)', 'Threshold.aditherAdd1Color', 'ColorDither.aDitherAdd1', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither ADD (Medium)', 'Threshold.aditherAdd3Color', 'ColorDither.aDitherAdd3', ['requiresHighPrecisionInt' => 'true']),
        new DitherAlgorithm('Adither ADD (Low)', 'Threshold.aditherAdd2Color', 'ColorDither.aDitherAdd2', ['requiresHighPrecisionInt' => 'true']),
        'Diffusion',
        new DitherAlgorithm('Floyd-Steinberg', 'ErrorPropColorDither.floydSteinberg', ''),
        new DitherAlgorithm('Javis-Judice-Ninke', 'ErrorPropColorDither.javisJudiceNinke', ''),
        new DitherAlgorithm('Stucki', 'ErrorPropColorDither.stucki', ''),
        new DitherAlgorithm('Burkes', 'ErrorPropColorDither.burkes', ''),
        new DitherAlgorithm('Sierra3', 'ErrorPropColorDither.sierra3', ''),
        new DitherAlgorithm('Sierra2', 'ErrorPropColorDither.sierra2', ''),
        new DitherAlgorithm('Sierra1', 'ErrorPropColorDither.sierra1', ''),
        'Diffusion (Reduced Bleed)',
        new DitherAlgorithm('Atkinson', 'ErrorPropColorDither.atkinson', ''),
        new DitherAlgorithm('Garvey', 'ErrorPropColorDither.garvey', ''),
        'Ordered (Bayer)',
        new DitherAlgorithm('Ordered 2×2', 'OrderedDither.createBayerColorDither(2)', 'ColorDither.createBayerColorDither(2)'),
        new DitherAlgorithm('Ordered 4×4', 'OrderedDither.createBayerColorDither(4)', 'ColorDither.createBayerColorDither(4)'),
        new DitherAlgorithm('Ordered 8×8', 'OrderedDither.createBayerColorDither(8)', 'ColorDither.createBayerColorDither(8)'),
        new DitherAlgorithm('Ordered 16×16', 'OrderedDither.createBayerColorDither(16)', 'ColorDither.createBayerColorDither(16)'),
        'Ordered (Bayer/Random)',
        new DitherAlgorithm('Ordered 2×2 (R)', 'OrderedDither.createBayerColorDither(2, true)', 'ColorDither.createBayerColorDither(2, true)'),
        new DitherAlgorithm('Ordered 4×4 (R)', 'OrderedDither.createBayerColorDither(4, true)', 'ColorDither.createBayerColorDither(4, true)'),
        new DitherAlgorithm('Ordered 8×8 (R)', 'OrderedDither.createBayerColorDither(8, true)', 'ColorDither.createBayerColorDither(8, true)'),
        new DitherAlgorithm('Ordered 16×16 (R)', 'OrderedDither.createBayerColorDither(16, true)', 'ColorDither.createBayerColorDither(16, true)'),
        'Ordered (Hue-Lightness)',
        new DitherAlgorithm('Hue-Lightness 16×16', 'OrderedDither.createHueLightnessDither(16)', 'ColorDither.createHueLightnessOrderedDither(16)'),
        'Ordered (Hue-Lightness/Random)',
        new DitherAlgorithm('Hue-Lightness 16×16 (R)', 'OrderedDither.createHueLightnessDither(16, true)', 'ColorDither.createHueLightnessOrderedDither(16, true)'),
        'Ordered Arbitrary-palette Positional',
        yliluoma1Builder('bayer', 2),
        yliluoma1Builder('bayer', 8),
        yliluoma1Builder('crossHatchRight', 4),
        yliluoma2Builder('bayer', 2),
        yliluoma2Builder('bayer', 8),
        yliluoma2Builder('bayer', 16),
        yliluoma2Builder('crossHatchRight', 4),
        'Ordered (Hatch)',
        new DitherAlgorithm('Hatch Vertical', 'OrderedDither.createHatchVerticalColorDither(4)', 'ColorDither.createHatchVerticalColorDither(4)'),
        new DitherAlgorithm('Hatch Horizontal', 'OrderedDither.createHatchHorizontalColorDither(4)', 'ColorDither.createHatchHorizontalColorDither(4)'),
        new DitherAlgorithm('Hatch Right', 'OrderedDither.createHatchRightColorDither(4)', 'ColorDither.createHatchRightColorDither(4)'),
        new DitherAlgorithm('Hatch Left', 'OrderedDither.createHatchLeftColorDither(4)', 'ColorDither.createHatchLeftColorDither(4)'),
        'Ordered (Hatch/Random)',
        new DitherAlgorithm('Hatch Vertical (R)', 'OrderedDither.createHatchVerticalColorDither(4, true)', 'ColorDither.createHatchVerticalColorDither(4, true)'),
        new DitherAlgorithm('Hatch Horizontal (R)', 'OrderedDither.createHatchHorizontalColorDither(4, true)', 'ColorDither.createHatchHorizontalColorDither(4, true)'),
        new DitherAlgorithm('Hatch Right (R)', 'OrderedDither.createHatchRightColorDither(4, true)', 'ColorDither.createHatchRightColorDither(4, true)'),
        new DitherAlgorithm('Hatch Left (R)', 'OrderedDither.createHatchLeftColorDither(4, true)', 'ColorDither.createHatchLeftColorDither(4, true)'),
        'Ordered (Crosshatch)',
        new DitherAlgorithm('Crosshatch Vertical', 'OrderedDither.createCrossHatchVerticalColorDither(4)', 'ColorDither.createCrossHatchVerticalColorDither(4)'),
        new DitherAlgorithm('Crosshatch Horizontal', 'OrderedDither.createCrossHatchHorizontalColorDither(4)', 'ColorDither.createCrossHatchHorizontalColorDither(4)'),
        new DitherAlgorithm('Crosshatch Right', 'OrderedDither.createCrossHatchRightColorDither(4)', 'ColorDither.createCrossHatchRightColorDither(4)'),
        new DitherAlgorithm('Crosshatch Left', 'OrderedDither.createCrossHatchLeftColorDither(4)', 'ColorDither.createCrossHatchLeftColorDither(4)'),
        'Ordered (Crosshatch/Random)',
        new DitherAlgorithm('Crosshatch Vertical (R)', 'OrderedDither.createCrossHatchVerticalColorDither(4, true)', 'ColorDither.createCrossHatchVerticalColorDither(4, true)'),
        new DitherAlgorithm('Crosshatch Horizontal (R)', 'OrderedDither.createCrossHatchHorizontalColorDither(4, true)', 'ColorDither.createCrossHatchHorizontalColorDither(4, true)'),
        new DitherAlgorithm('Crosshatch Right (R)', 'OrderedDither.createCrossHatchRightColorDither(4, true)', 'ColorDither.createCrossHatchRightColorDither(4, true)'),
        new DitherAlgorithm('Crosshatch Left (R)', 'OrderedDither.createCrossHatchLeftColorDither(4, true)', 'ColorDither.createCrossHatchLeftColorDither(4, true)'),
        'Ordered (Zigzag)',
        new DitherAlgorithm('Zigzag 4×4 Horizontal', 'OrderedDither.createZigZagColorDither(4)', 'ColorDither.createZigZagColorDither(4)'),
        new DitherAlgorithm('Zigzag 4×4 Vertical', 'OrderedDither.createZigZagVerticalColorDither(4)', 'ColorDither.createZigZagVerticalColorDither(4)'),
        new DitherAlgorithm('Zigzag 8×8 Horizontal', 'OrderedDither.createZigZagColorDither(8)', 'ColorDither.createZigZagColorDither(8)'),
        new DitherAlgorithm('Zigzag 8×8 Vertical', 'OrderedDither.createZigZagVerticalColorDither(8)', 'ColorDither.createZigZagVerticalColorDither(8)'),
        new DitherAlgorithm('Zigzag 16×16 Horizontal', 'OrderedDither.createZigZagColorDither(16)', 'ColorDither.createZigZagColorDither(16)'),
        new DitherAlgorithm('Zigzag 16×16 Vertical', 'OrderedDither.createZigZagVerticalColorDither(16)', 'ColorDither.createZigZagVerticalColorDither(16)'),
        'Ordered (Zigzag/Random)',
        new DitherAlgorithm('Zigzag 4×4 Horizontal (R)', 'OrderedDither.createZigZagColorDither(4, true)', 'ColorDither.createZigZagColorDither(4, true)'),
        new DitherAlgorithm('Zigzag 4×4 Vertical (R)', 'OrderedDither.createZigZagVerticalColorDither(4, true)', 'ColorDither.createZigZagVerticalColorDither(4, true)'),
        new DitherAlgorithm('Zigzag 8×8 Horizontal (R)', 'OrderedDither.createZigZagColorDither(8, true)', 'ColorDither.createZigZagColorDither(8, true)'),
        new DitherAlgorithm('Zigzag 8×8 Vertical (R)', 'OrderedDither.createZigZagVerticalColorDither(8, true)', 'ColorDither.createZigZagVerticalColorDither(8, true)'),
        new DitherAlgorithm('Zigzag 16×16 Horizontal (R)', 'OrderedDither.createZigZagColorDither(16, true)', 'ColorDither.createZigZagColorDither(16, true)'),
        new DitherAlgorithm('Zigzag 16×16 Vertical (R)', 'OrderedDither.createZigZagVerticalColorDither(16, true)', 'ColorDither.createZigZagVerticalColorDither(16, true)'),
        'Ordered (Pattern)',
        new DitherAlgorithm('Cluster', 'OrderedDither.createClusterColorDither(4)', 'ColorDither.createClusterColorDither(4)'),
        new DitherAlgorithm('Fishnet', 'OrderedDither.createFishnetColorDither(8)', 'ColorDither.createFishnetColorDither(8)'),
        new DitherAlgorithm('Dot 4×4', 'OrderedDither.createDotColorDither(4)', 'ColorDither.createDotColorDither(4)'),
        new DitherAlgorithm('Dot 8×8', 'OrderedDither.createDotColorDither(8)', 'ColorDither.createDotColorDither(8)'),
        new DitherAlgorithm('Halftone', 'OrderedDither.createHalftoneColorDither(8)', 'ColorDither.createHalftoneColorDither(8)'),
        'Ordered (Pattern/Random)',
        new DitherAlgorithm('Cluster (R)', 'OrderedDither.createClusterColorDither(4, true)', 'ColorDither.createClusterColorDither(4, true)'),
        new DitherAlgorithm('Fishnet (R)', 'OrderedDither.createFishnetColorDither(8, true)', 'ColorDither.createFishnetColorDither(8, true)'),
        new DitherAlgorithm('Dot 4×4 (R)', 'OrderedDither.createDotColorDither(4, true)', 'ColorDither.createDotColorDither(4, true)'),
        new DitherAlgorithm('Dot 8×8 (R)', 'OrderedDither.createDotColorDither(8, true)', 'ColorDither.createDotColorDither(8, true)'),
        new DitherAlgorithm('Halftone (R)', 'OrderedDither.createHalftoneColorDither(8, true)', 'ColorDither.createHalftoneColorDither(8, true)'),
        'Ordered (Square)',
        new DitherAlgorithm('Square 2×2', 'OrderedDither.createSquareColorDither(2)', 'ColorDither.createSquareColorDither(2)'),
        new DitherAlgorithm('Square 4×4', 'OrderedDither.createSquareColorDither(4)', 'ColorDither.createSquareColorDither(4)'),
        new DitherAlgorithm('Square 8×8', 'OrderedDither.createSquareColorDither(8)', 'ColorDither.createSquareColorDither(8)'),
        new DitherAlgorithm('Square 16×16', 'OrderedDither.createSquareColorDither(16)', 'ColorDither.createSquareColorDither(16)'),
        'Ordered (Square/Random)',
        new DitherAlgorithm('Square 2×2 (R)', 'OrderedDither.createSquareColorDither(2, true)', 'ColorDither.createSquareColorDither(2, true)'),
        new DitherAlgorithm('Square 4×4 (R)', 'OrderedDither.createSquareColorDither(4, true)', 'ColorDither.createSquareColorDither(4, true)'),
        new DitherAlgorithm('Square 8×8 (R)', 'OrderedDither.createSquareColorDither(8, true)', 'ColorDither.createSquareColorDither(8, true)'),
        new DitherAlgorithm('Square 16×16 (R)', 'OrderedDither.createSquareColorDither(16, true)', 'ColorDither.createSquareColorDither(16, true)'),
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