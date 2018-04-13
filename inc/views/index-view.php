<?php

class IndexView{
    /**
     * @param $arrayIndexKey: the name of the property in the vue storing the selected index in the array
     * @param $arrayName: the name of the array the $arrayIndexKey is referring to
     * @param $modelTitle: used for the title property of the button (e.g. next and previous $modelTitle) 
     * @param $firstIndexOffset (optional): if this is set to a number > 0, this number will be used as the starting index instead of 0
     */
    public static function cyclePropertyList(string $arrayIndexKey, string $arrayName, string $modelTitle, int $startingIndex=0){
        $cyclePropertyListJsArgsBase = ["'$arrayIndexKey'", -1, "${arrayName}.length"];
        if($startingIndex > 0){
            $cyclePropertyListJsArgsBase[] = $startingIndex;
        }
        $cyclePropertyListJsPreviousArgs = implode(',', $cyclePropertyListJsArgsBase);
        
        $cyclePropertyListJsArgsBase[1] = 1;
        $cyclePropertyListJsNextArgs = implode(',', $cyclePropertyListJsArgsBase);
        
        require(TEMPLATES_INDEX_PARTIALS_PATH.'cycle-property-list.php');
    }
}