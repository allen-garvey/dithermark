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
        new DitherAlgorithm('Random Threshold', 'Threshold.randomDither', 'BwDither.randomThreshold'),
        'Arithmetic',
        new DitherAlgorithm('Arithmetic Dither Xor 1', 'Threshold.aditherXor1', 'BwDither.aDitherXor1'),
        new DitherAlgorithm('Arithmetic Dither Xor 2', 'Threshold.aditherXor2', 'BwDither.aDitherXor2'),
        new DitherAlgorithm('Arithmetic Dither Xor 3', 'Threshold.aditherXor3', 'BwDither.aDitherXor3'),
        new DitherAlgorithm('Arithmetic Dither Add 1', 'Threshold.aditherAdd1', 'BwDither.aDitherAdd1'),
        new DitherAlgorithm('Arithmetic Dither Add 2', 'Threshold.aditherAdd2', 'BwDither.aDitherAdd2'),
        new DitherAlgorithm('Arithmetic Dither Add 3', 'Threshold.aditherAdd3', 'BwDither.aDitherAdd3'),
        'Error Propagation',
        new DitherAlgorithm('Floyd-Steinberg', 'ErrorPropDither.floydSteinberg', ''),
        new DitherAlgorithm('Javis-Judice-Ninke', 'ErrorPropDither.javisJudiceNinke', ''),
        new DitherAlgorithm('Stucki', 'ErrorPropDither.stucki', ''),
        new DitherAlgorithm('Burkes', 'ErrorPropDither.burkes', ''),
        new DitherAlgorithm('Sierra3', 'ErrorPropDither.sierra3', ''),
        new DitherAlgorithm('Sierra2', 'ErrorPropDither.sierra2', ''),
        new DitherAlgorithm('Sierra1', 'ErrorPropDither.sierra1', ''),
        'Error Propagation Reduced Bleed',
        new DitherAlgorithm('Atkinson', 'ErrorPropDither.atkinson', ''),
        new DitherAlgorithm('Garvey', 'ErrorPropDither.garvey', ''),
        'Ordered (Bayer)',
        new DitherAlgorithm('Ordered Dither 2x2', 'OrderedDither.createOrderedDither(2)', 'BwDither.createOrderedDither(2)'),
        new DitherAlgorithm('Ordered Dither 4x4', 'OrderedDither.createOrderedDither(4)', 'BwDither.createOrderedDither(4)'),
        new DitherAlgorithm('Ordered Dither 8x8', 'OrderedDither.createOrderedDither(8)', 'BwDither.createOrderedDither(8)'),
        new DitherAlgorithm('Ordered Dither 16x16', 'OrderedDither.createOrderedDither(16)', 'BwDither.createOrderedDither(16)'),
        'Ordered (Cluster)',
        new DitherAlgorithm('Cluster Ordered Dither 2x2', 'OrderedDither.createClusterOrderedDither(2)', 'BwDither.createClusterOrderedDither(2)'),
        new DitherAlgorithm('Cluster Ordered Dither 4x4', 'OrderedDither.createClusterOrderedDither(4)', 'BwDither.createClusterOrderedDither(4)'),
        new DitherAlgorithm('Cluster Ordered Dither 8x8', 'OrderedDither.createClusterOrderedDither(8)', 'BwDither.createClusterOrderedDither(8)'),
        new DitherAlgorithm('Cluster Ordered Dither 16x16', 'OrderedDither.createClusterOrderedDither(16)', 'BwDither.createClusterOrderedDither(16)'),
        new DitherAlgorithm('Dot Cluster Ordered Dither 4x4', 'OrderedDither.createDotClusterOrderedDither(4)', 'BwDither.createDotClusterOrderedDither(4)'),
        new DitherAlgorithm('Crosshatch Ordered Dither 8x8', 'OrderedDither.createPatternOrderedDither(8)', 'BwDither.createPatternOrderedDither(8)'),
        new DitherAlgorithm('Halftone Dot 4x4', 'OrderedDither.createHalftoneDot(4)', 'BwDither.createHalftoneDot(4)'),
        new DitherAlgorithm('Halftone Dot 8x8', 'OrderedDither.createHalftoneDot(8)', 'BwDither.createHalftoneDot(8)'),
    ];
}

function colorAlgorithmModelBase(): array{
    return [
        'Closest',
        new DitherAlgorithm('Closest Color', 'Threshold.closestColor', 'ColorDither.closestColor'),
        new DitherAlgorithm('Random Closest Color', 'Threshold.randomClosestColor', 'ColorDither.randomClosestColor'),
        'Arithmetic',
        new DitherAlgorithm('Arithmetic Dither Xor 1', 'Threshold.aditherXor1Color', 'ColorDither.aDitherXor1'),
        new DitherAlgorithm('Arithmetic Dither Xor 2', 'Threshold.aditherXor2Color', 'ColorDither.aDitherXor2'),
        new DitherAlgorithm('Arithmetic Dither Xor 3', 'Threshold.aditherXor3Color', 'ColorDither.aDitherXor3'),
        new DitherAlgorithm('Arithmetic Dither Add 1', 'Threshold.aditherAdd1Color', 'ColorDither.aDitherAdd1'),
        new DitherAlgorithm('Arithmetic Dither Add 2', 'Threshold.aditherAdd2Color', 'ColorDither.aDitherAdd2'),
        new DitherAlgorithm('Arithmetic Dither Add 3', 'Threshold.aditherAdd3Color', 'ColorDither.aDitherAdd3'),
        'Ordered (Bayer)',
        new DitherAlgorithm('Ordered Dither 2x2', 'OrderedDither.createColorOrderedDither(2)', 'ColorDither.createOrderedDither(2)'),
        new DitherAlgorithm('Ordered Dither 4x4', 'OrderedDither.createColorOrderedDither(4)', 'ColorDither.createOrderedDither(4)'),
        new DitherAlgorithm('Ordered Dither 8x8', 'OrderedDither.createColorOrderedDither(8)', 'ColorDither.createOrderedDither(8)'),
        new DitherAlgorithm('Ordered Dither 16x16', 'OrderedDither.createColorOrderedDither(16)', 'ColorDither.createOrderedDither(16)'),
        'Ordered (Hue-Lightness)',
        new DitherAlgorithm('Hue-Lightness Ordered Dither 16x16', '', 'ColorDither.createHueLightnessOrderedDither(16)'),
        'Ordered (Pattern)',
        new DitherAlgorithm('Cluster Ordered Dither 2x2', 'OrderedDither.createColorClusterOrderedDither(2)', 'ColorDither.createClusterOrderedDither(2)'),
        new DitherAlgorithm('Cluster Ordered Dither 4x4', 'OrderedDither.createColorClusterOrderedDither(4)', 'ColorDither.createClusterOrderedDither(4)'),
        new DitherAlgorithm('Cluster Ordered Dither 8x8', 'OrderedDither.createColorClusterOrderedDither(8)', 'ColorDither.createClusterOrderedDither(8)'),
        new DitherAlgorithm('Cluster Ordered Dither 16x16', 'OrderedDither.createColorClusterOrderedDither(16)', 'ColorDither.createClusterOrderedDither(16)'),
        new DitherAlgorithm('Dot Cluster Ordered Dither 4x4', 'OrderedDither.createColorDotClusterOrderedDither(4)', 'ColorDither.createDotClusterOrderedDither(4)'),
        new DitherAlgorithm('Crosshatch Ordered Dither 8x8', 'OrderedDither.createColorPatternOrderedDither(8)', 'ColorDither.createPatternOrderedDither(8)'),
        new DitherAlgorithm('Halftone Dot 4x4', 'OrderedDither.createHalftoneDotColor(4)', 'ColorDither.createHalftoneDot(4)'),
        new DitherAlgorithm('Halftone Dot 8x8', 'OrderedDither.createHalftoneDotColor(8)', 'ColorDither.createHalftoneDot(8)'),
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