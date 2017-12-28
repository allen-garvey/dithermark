
App.BayerMatrix = (function(){
    //based on: https://github.com/tromero/BayerMatrix/blob/master/MakeBayer.py
    function createBayer(x, y, dimensions, currentSize, value, step, maxValue, bayerArray){
        
        let index = (y * dimensions) + x;
        if(currentSize === 1){
            bayerArray[index] = value / (dimensions * dimensions) * maxValue;
            return;
        }
        
        //should be floor of this, but since
        //size should be a power of 2 this shouldn't be necessary
        let half = currentSize / 2;
        
        createBayer(x,      y, dimensions, half, value+(step*0), step*4, maxValue, bayerArray);
        createBayer(x+half, y+half, dimensions, half, value+(step*1), step*4, maxValue, bayerArray);
        createBayer(x+half, y, dimensions,      half, value+(step*2), step*4, maxValue, bayerArray);
        createBayer(x,      y+half, dimensions, half, value+(step*3), step*4, maxValue, bayerArray);
        
    }
    
    
    function createBayerHelper(dimensions, maxValue = 256){
        var size = dimensions * dimensions;
        
        var bayerArray = new Uint8Array(size);
        
        createBayer(0, 0, dimensions, dimensions, 0, 1, maxValue, bayerArray);
        return bayerArray;
    }
    
    
    
    
    
    return {
        create: createBayerHelper,
    };
})();