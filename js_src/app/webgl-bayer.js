//bayer array should be Uint8Array
//based on: https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Tutorial/Using_textures_in_WebGL
function createAndLoadBayerTexture(gl, bayerArray, bayerDimensions){
    //prepare bayer array for texture
    let bayerBuffer = createBayerBuffer(bayerDimensions, bayerArray);
    //have to reverse y-axis because webgl y-axis is reversed, so that webgl and webworker
    //ordered dither gives the same results
    reverseYAxis(bayerBuffer, bayerDimensions, bayerDimensions);
    
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    const level = 0;
    const internalFormat = gl.RGBA;
    const width = bayerDimensions;
    const height = bayerDimensions;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, width, height, border, srcFormat, srcType, bayerBuffer);
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
    const halfHeight = Math.floor(height / 2);
    const bytesPerRow = width * bytesPerItem;
    
    // make a temp buffer to hold one row
    const temp = new Uint8Array(width * bytesPerItem);
    for(let y = 0; y < halfHeight; ++y){
        const topOffset = y * bytesPerRow;
        const bottomOffset = (height - y - 1) * bytesPerRow;
    
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
//this doesn't exactly normalize the buffer, but the problem
//is that webgl1 textures can't be floats
function createBayerBuffer(dimensions, bayerArray){
    const arrayLength = bayerArray.length;
    const fraction = 255 / (arrayLength - 1);
    const ret = new Uint8Array(4 * arrayLength);
    
    for(let i=0,index=0;i<arrayLength;i++,index+=4){
        ret[index] = bayerArray[i] * fraction;
    }
    
    return ret;
}

export default {
    createAndLoadTexture: createAndLoadBayerTexture,
};