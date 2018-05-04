<?php

class DitherAlgorithm {
    protected $id = null;
    protected $name;
    protected $workerFunc;
    protected $webglFunc;


    function __construct(string $name, string $workerFunc, string $webglFunc) {
        $this->name = $name;
        $this->workerFunc = $workerFunc;
        $this->webglFunc = $webglFunc;
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

    public function setId(int $id){
        if(!is_null($this->id)){
            $error = "id for ${$this->name} has already been assigned and cannot be changed";
            throw new Exception($error);
        }
        $this->id = $id;
    }
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
        new DitherAlgorithm('Adither XOR (High)', 'Threshold.aditherXor1', 'BwDither.aDitherXor1'),
        new DitherAlgorithm('Adither XOR (Medium)', 'Threshold.aditherXor3', 'BwDither.aDitherXor3'),
        new DitherAlgorithm('Adither XOR (Low)', 'Threshold.aditherXor2', 'BwDither.aDitherXor2'),
        new DitherAlgorithm('Adither ADD (High)', 'Threshold.aditherAdd1', 'BwDither.aDitherAdd1'),
        new DitherAlgorithm('Adither ADD (Medium)', 'Threshold.aditherAdd3', 'BwDither.aDitherAdd3'),
        new DitherAlgorithm('Adither ADD (Low)', 'Threshold.aditherAdd2', 'BwDither.aDitherAdd2'),
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
        'Ordered (Hatch)',
        new DitherAlgorithm('Hatch Right', 'OrderedDither.createHatchRightDither(4)', 'BwDither.createHatchRightDither(4)'),
        new DitherAlgorithm('Hatch Left', 'OrderedDither.createHatchLeftDither(4)', 'BwDither.createHatchLeftDither(4)'),
        new DitherAlgorithm('Hatch Vertical', 'OrderedDither.createHatchVerticalDither(4)', 'BwDither.createHatchVerticalDither(4)'),
        new DitherAlgorithm('Hatch Horizontal', 'OrderedDither.createHatchHorizontalDither(4)', 'BwDither.createHatchHorizontalDither(4)'),
        'Ordered (Pattern)',
        new DitherAlgorithm('Cluster', 'OrderedDither.createClusterDither(4)', 'BwDither.createClusterDither(4)'),
        new DitherAlgorithm('Fishnet', 'OrderedDither.createFishnetDither(8)', 'BwDither.createFishnetDither(8)'),
        new DitherAlgorithm('Dot 4×4', 'OrderedDither.createDotDither(4)', 'BwDither.createDotDither(4)'),
        new DitherAlgorithm('Dot 8×8', 'OrderedDither.createDotDither(8)', 'BwDither.createDotDither(8)'),
        'Ordered (Square)',
        new DitherAlgorithm('Square 2×2', 'OrderedDither.createSquareDither(2)', 'BwDither.createSquareDither(2)'),
        new DitherAlgorithm('Square 4×4', 'OrderedDither.createSquareDither(4)', 'BwDither.createSquareDither(4)'),
        new DitherAlgorithm('Square 8×8', 'OrderedDither.createSquareDither(8)', 'BwDither.createSquareDither(8)'),
        new DitherAlgorithm('Square 16×16', 'OrderedDither.createSquareDither(16)', 'BwDither.createSquareDither(16)'),
    ];
}

function colorAlgorithmModelBase(): array{
    return [
        'Threshold',
        new DitherAlgorithm('Closest Color', 'Threshold.closestColor', 'ColorDither.closestColor'),
        'Random',
        new DitherAlgorithm('Random', 'Threshold.randomClosestColor', 'ColorDither.randomClosestColor'),
        'Arithmetic',
        new DitherAlgorithm('Adither XOR (High)', 'Threshold.aditherXor1Color', 'ColorDither.aDitherXor1'),
        new DitherAlgorithm('Adither XOR (Medium)', 'Threshold.aditherXor3Color', 'ColorDither.aDitherXor3'),
        new DitherAlgorithm('Adither XOR (Low)', 'Threshold.aditherXor2Color', 'ColorDither.aDitherXor2'),
        new DitherAlgorithm('Adither ADD (High)', 'Threshold.aditherAdd1Color', 'ColorDither.aDitherAdd1'),
        new DitherAlgorithm('Adither ADD (Medium)', 'Threshold.aditherAdd3Color', 'ColorDither.aDitherAdd3'),
        new DitherAlgorithm('Adither ADD (Low)', 'Threshold.aditherAdd2Color', 'ColorDither.aDitherAdd2'),
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
        'Ordered (Hue-Lightness)',
        new DitherAlgorithm('Hue-Lightness 16×16', 'OrderedDither.createHueLightnessDither(16)', 'ColorDither.createHueLightnessOrderedDither(16)'),
        'Ordered (Hatch)',
        new DitherAlgorithm('Hatch Right', 'OrderedDither.createHatchRightColorDither(4)', 'ColorDither.createHatchRightColorDither(4)'),
        new DitherAlgorithm('Hatch Left', 'OrderedDither.createHatchLeftColorDither(4)', 'ColorDither.createHatchLeftColorDither(4)'),
        new DitherAlgorithm('Hatch Vertical', 'OrderedDither.createHatchVerticalColorDither(4)', 'ColorDither.createHatchVerticalColorDither(4)'),
        new DitherAlgorithm('Hatch Horizontal', 'OrderedDither.createHatchHorizontalColorDither(4)', 'ColorDither.createHatchHorizontalColorDither(4)'),
        'Ordered (Pattern)',
        new DitherAlgorithm('Cluster', 'OrderedDither.createClusterColorDither(4)', 'ColorDither.createClusterColorDither(4)'),
        new DitherAlgorithm('Fishnet', 'OrderedDither.createFishnetColorDither(8)', 'ColorDither.createFishnetColorDither(8)'),
        new DitherAlgorithm('Dot 4×4', 'OrderedDither.createDotColorDither(4)', 'ColorDither.createDotColorDither(4)'),
        new DitherAlgorithm('Dot 8×8', 'OrderedDither.createDotColorDither(8)', 'ColorDither.createDotColorDither(8)'),
        'Ordered (Square)',
        new DitherAlgorithm('Square 2×2', 'OrderedDither.createSquareColorDither(2)', 'ColorDither.createSquareColorDither(2)'),
        new DitherAlgorithm('Square 4×4', 'OrderedDither.createSquareColorDither(4)', 'ColorDither.createSquareColorDither(4)'),
        new DitherAlgorithm('Square 8×8', 'OrderedDither.createSquareColorDither(8)', 'ColorDither.createSquareColorDither(8)'),
        new DitherAlgorithm('Square 16×16', 'OrderedDither.createSquareColorDither(16)', 'ColorDither.createSquareColorDither(16)'),
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
			},
		<?php endforeach;
}