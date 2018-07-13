/* 
JavaScript translation of scolorq
https://people.eecs.berkeley.edu/~dcoetzee/downloads/scolorq/

Copyright (c) 2006 Derrick Coetzee

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
App.OptimizePaletteScolorq = (function(){
    //simulates 1 dimensional array, where each value is an array of length innerLength
	function Array1d(width, innerLength=3){
        this.width = width;
        this.innerLength = innerLength;
        this.data = new Float32Array(width * innerLength);
    }
    Array1d.prototype.indexFor = function(column){
        return column * this.innerLength;
    };
    Array1d.prototype.get = function(column){
        const startIndex = this.indexFor(column);
        return this.data.subarray(startIndex, startIndex + this.innerLength);
    };
    Array1d.prototype.set = function(column, value){
        const startIndex = this.indexFor(column);
        value.forEach((v, i)=>{
            this.data[startIndex+i] = v;
        });
    };
    Array1d.prototype.fill = function(fillValue){
        if(typeof fillValue !== 'function'){
            this.data.fill(fillValue);
            return;
        }
        this.data = this.data.map((value, i)=>{
            return fillValue(i);
        });
    };
    //simulates 2 dimensional array, where each value is an array of length innerLength
	function Array2d(width, height, innerLength=3){
        this.width = width;
        this.height = height;
        this.innerLength = innerLength;
        this.data = new Float32Array(width * height * innerLength);
    }
    Array2d.prototype.indexFor = function(column, row){
        return (row * this.width + column) * this.innerLength;
    };
    Array2d.prototype.get = function(column, row){
        const startIndex = this.indexFor(column, row);
        return this.data.subarray(startIndex, startIndex + this.innerLength);
    };
    Array2d.prototype.set = function(column, row, value){
        const startIndex = this.indexFor(column, row);
        value.forEach((v, i)=>{
            this.data[startIndex+i] = v;
        });
    };
    Array2d.prototype.fill = function(fillValue){
        if(typeof fillValue !== 'function'){
            this.data.fill(fillValue);
            return;
        }
        this.data = this.data.map((value, i)=>{
            return fillValue(i);
        });
    };

    //convert raw pixel data (minus alpha) to doubles
    function fillImage(imageData, pixels){
        for(let i=0,imageDataIndex=0;i<pixels.length;i+=4){
            imageData[imageDataIndex++] = pixels[i];
            imageData[imageDataIndex++] = pixels[i+1];
            imageData[imageDataIndex++] = pixels[i+2];
        }
    }
    
    function scolorq(pixels, numColors, colorQuantization, imageWidth, imageHeight, progressCallback){
        const filter1_weights = new Array2d(1, 1);
        filter1_weights.fill(1);
        const filter3_weights = new Array2d(3, 3);
        const filter5_weights = new Array2d(5, 5);
        const palette = new Array1d(numColors);
        palette.fill(Math.random);
        const image = new Array2d(imageWidth, imageHeight);
        fillImage(image.data, pixels);
    }


    return {
        scolorq
    };
})();