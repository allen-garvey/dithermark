
App.BayerWebgl = (function(Bayer){
    
    //bayer array should be Uint8Array
    //based on: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
    function createAndLoadBayerTexture(gl, bayerArray, bayerArrayDimensions){
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        
        const level = 0;
        const internalFormat = gl.RGBA;
        const width = bayerArrayDimensions;
        const height = bayerArrayDimensions;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, bayerArray);
        // gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        
        return texture;
    }
    
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
    
    function createBayerBuffer(dimensions, bayerArray){
        const arrayLength = bayerArray.length;
        const MAX_VALUE = 256;
        const STEP = MAX_VALUE / arrayLength;
        const retLength = 4 * arrayLength;
        let ret = new Uint8Array(retLength);
        
        for(let i=0,index=0;i<arrayLength;i++,index+=4){
            let value = bayerArray[i] * STEP;
            ret[index] = value;
        }
        
        return ret;
    }
    
    var bayerMemoization = {};
    
    function createOrderedDither(keyPrefix, bayerMatrixFunc){
        return function(dimensions){
            const key = `${keyPrefix}-${dimensions}`;
            bayerMemoization[key] = bayerMemoization[key] || createBayerBuffer(dimensions, Bayer[bayerMatrixFunc](dimensions));
            let ret = bayerMemoization[key];
            //have to reverse y-axis because webgl y-axis is reversed, so that webgl and webworker
            //ordered dither gives the same results
            reverseYAxis(ret, dimensions, dimensions);
            return ret;
        };
    }
    
    
    return {
        create: createOrderedDither('bayer', 'create'),
        createCluster: createOrderedDither('cluster', 'createCluster'),
        createDotCluster: createOrderedDither('dot_cluster', 'createDotCluster'),
        createPattern: createOrderedDither('pattern', 'createPattern'),
        createAndLoadTexture: createAndLoadBayerTexture,
    };
})(App.BayerMatrix);