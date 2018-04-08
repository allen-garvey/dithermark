App.VueMixins = (function(){
    
    //used when property is the index into an array-like data structure
    //and want to cycle through all available indexes
    function cyclePropertyList(propertyName, amount, listLength, startIndex=0){
        let newIndex = this[propertyName] + amount;
        if(newIndex < startIndex){
            newIndex = listLength - 1;
        }
        else if(newIndex >= listLength){
            newIndex = startIndex;
        }
        this[propertyName] = newIndex;
    };

    
    
    return {
        cyclePropertyList,
    };
    
})();