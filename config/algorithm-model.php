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


function bwAlgorithmModel(): array{
    $ret = [
        new DitherAlgorithm('Threshold', 'Threshold.image', 'BwDither.threshold'),
        new DitherAlgorithm('Random Threshold', 'Threshold.randomDither', 'BwDither.randomThreshold'),
        new DitherAlgorithm('Arithmetic Dither Xor 1', 'Threshold.aditherXor1', 'BwDither.aDitherXor1'),
        new DitherAlgorithm('Arithmetic Dither Xor 2', 'Threshold.aditherXor2', 'BwDither.aDitherXor2'),
        new DitherAlgorithm('Arithmetic Dither Xor 3', 'Threshold.aditherXor3', 'BwDither.aDitherXor3'),
        new DitherAlgorithm('Arithmetic Dither Add 1', 'Threshold.aditherAdd1', 'BwDither.aDitherAdd1'),
        new DitherAlgorithm('Arithmetic Dither Add 2', 'Threshold.aditherAdd2', 'BwDither.aDitherAdd2'),
        new DitherAlgorithm('Arithmetic Dither Add 3', 'Threshold.aditherAdd3', 'BwDither.aDitherAdd3'),
        new DitherAlgorithm('Floyd-Steinberg', 'ErrorPropDither.floydSteinberg', ''),
        new DitherAlgorithm('Javis-Judice-Ninke', 'ErrorPropDither.javisJudiceNinke', ''),
        new DitherAlgorithm('Stucki', 'ErrorPropDither.stucki', ''),
        new DitherAlgorithm('Burkes', 'ErrorPropDither.burkes', ''),
        new DitherAlgorithm('Sierra3', 'ErrorPropDither.sierra3', ''),
        new DitherAlgorithm('Sierra2', 'ErrorPropDither.sierra2', ''),
        new DitherAlgorithm('Sierra1', 'ErrorPropDither.sierra1', ''),
        new DitherAlgorithm('Atkinson', 'ErrorPropDither.atkinson', ''),
        new DitherAlgorithm('Garvey', 'ErrorPropDither.garvey', ''),
        new DitherAlgorithm('Ordered Dither 2x2', 'OrderedDither.createOrderedDither(2)', 'BwDither.createOrderedDither(2)'),
        new DitherAlgorithm('Ordered Dither 4x4', 'OrderedDither.createOrderedDither(4)', 'BwDither.createOrderedDither(4)'),
        new DitherAlgorithm('Ordered Dither 8x8', 'OrderedDither.createOrderedDither(8)', 'BwDither.createOrderedDither(8)'),
        new DitherAlgorithm('Ordered Dither 16x16', 'OrderedDither.createOrderedDither(16)', 'BwDither.createOrderedDither(16)'),
        new DitherAlgorithm('Cluster Ordered Dither 2x2', '', 'BwDither.createClusterOrderedDither(2)'),
        new DitherAlgorithm('Cluster Ordered Dither 4x4', '', 'BwDither.createClusterOrderedDither(4)'),
        new DitherAlgorithm('Cluster Ordered Dither 8x8', '', 'BwDither.createClusterOrderedDither(8)'),
        new DitherAlgorithm('Cluster Ordered Dither 16x16', '', 'BwDither.createClusterOrderedDither(16)'),
        new DitherAlgorithm('Dot Cluster Ordered Dither 4x4', '', 'BwDither.dotClusterOrderedDither'),
    ];

    return array_map(function($algoModel, $i){
        $algoModel->setId($i + 1);
        return $algoModel;
    }, $ret, array_keys($ret));
}