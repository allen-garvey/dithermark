
App.BayerMatrix = (function(){
    /* iterative version of recursive definition from
     * https://github.com/tromero/BayerMatrix/blob/master/MakeBayer.py
     * @param dimensions = power of 2 greater than or equal to 2 (length of 1 side of the matrix)
    */
    function createBayer(dimensions){
        const bayerBase = [0, 2, 3, 1];
        
        //guard against infinite loop
        if(dimensions <= 2){
            return bayerBase;
        }
    
        // let arrayTotalLength = dimensions * dimensions;
        let currentDimension = 2;
        let bayerArray = bayerBase.slice();
        
        while(currentDimension < dimensions){
            let sectionDimensions = currentDimension;
            currentDimension *= 2;
            let subarrayLength = currentDimension * currentDimension;
            let newBayerArray = new Array(subarrayLength);
            // let sectionLength = sectionDimensions * sectionDimensions;
            
            //cycle through source in 4 equal blocks going clockwise starting from top left
            for(let i=0;i<4;i++){
                
                let destOffset = 0;
                //last 2 blocks are in bottom half of matrix
                if(i > 1){
                    destOffset += (subarrayLength / 2);
                }
                //2nd and 4th blocks are in right half of matrix
                if(i % 2 != 0){
                    destOffset += sectionDimensions;
                }
                
                let j = 0;
                for(let y=0;y<sectionDimensions;y++){
                    for(let x=0;x<sectionDimensions;x++){
                        let destIndex = x + destOffset;
                        newBayerArray[destIndex] = (bayerArray[j] * 4) + bayerBase[i];
                        j++;
                    }
                    destOffset += currentDimension;
                }
            }
            bayerArray = newBayerArray;
        }
        return bayerArray;
    }
    
    
    //Utility stuff
    
    //based on: https://stackoverflow.com/questions/41969562/how-can-i-flip-the-result-of-webglrenderingcontext-readpixels
    //pixels is a Uint8Array
    function reverseYAxis(pixels, width, height, bytesPerItem=4){
        var halfHeight = Math.floor(height / 2);
        var bytesPerRow = width * bytesPerItem;
        
        // make a temp buffer to hold one row
        var temp = new Uint8Array(width * bytesPerItem);
        for (var y = 0; y < halfHeight; ++y) {
          var topOffset = y * bytesPerRow;
          var bottomOffset = (height - y - 1) * bytesPerRow;
        
          // make copy of a row on the top half
          temp.set(pixels.subarray(topOffset, topOffset + bytesPerRow));
        
          // copy a row from the bottom half to the top
          pixels.copyWithin(topOffset, bottomOffset, bottomOffset + bytesPerRow);
        
          // copy the copy of the top half row to the bottom half 
          pixels.set(temp, bottomOffset);
        }
    }
    
    /*
    * Webgl Ordered dither matrix stuff
    */
    
    function createBayerBuffer(dimensions){
        var bayerArray = createBayer(dimensions);
        var arrayLength = bayerArray.length;
        const MAX_VALUE = 256;
        const STEP = MAX_VALUE / arrayLength;
        var retLength = 4 * arrayLength;
        var ret = new Uint8Array(retLength);
        
        let index = 0;
        for(let i=0;i<arrayLength;i++){
            let value = bayerArray[i] * STEP;
            ret[index] = value;
            index += 4;
        }
        
        return ret;
    }
    
    var bayerMemoization = {};
    
    function createBayerWebgl(dimensions){
        bayerMemoization[dimensions] = bayerMemoization[dimensions] || createBayerBuffer(dimensions);
        let ret = bayerMemoization[dimensions];
        reverseYAxis(ret, dimensions, dimensions);
        return ret;
    }
    
    
    return {
        reverseYAxis: reverseYAxis,
        create: createBayerWebgl,
    };
})();