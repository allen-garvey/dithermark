
App.BayerWebgl = (function(Bayer){
    
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
        var bayerArray = Bayer.create(dimensions);
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
        //have to reverse y-axis because webgl y-axis is reversed, so that webgl and webworker
        //ordered dither gives the same results
        reverseYAxis(ret, dimensions, dimensions);
        return ret;
    }
    
    
    return {
        create: createBayerWebgl,
    };
})(App.Bayer);