/* 
JavaScript translation of octree_color_quantizer
from: https://github.com/delimitry/octree_color_quantizer

The MIT License (MIT)

Copyright (c) 2016 Dmitry Alimov

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
App.OptimizePaletteOctree = (function(ArrayUtil, Util){
    const MAX_DEPTH = 8;
    const MAX_CHILDREN = 8;

    /**
     * Octree Node Class
     */
    function OctreeNode(level, parent){
        this.color = new Float32Array(3);
        this.pixelCount = 0;
        this.children = new Array(MAX_CHILDREN);
        if(level < MAX_DEPTH - 1){
            parent.addLevelNode(level, this);
        }
    }

    OctreeNode.prototype.isLeaf = function(){
        return this.pixelCount > 0;
    };

    OctreeNode.prototype.getLeafNodes = function(){
        let ret = [];
        this.children.forEach((node)=>{
            if(node.isLeaf()){
                ret.push(node);
            }
            else{
                ret = ret.concat(node.getLeafNodes());
            }
        });
        return ret;
    };

    OctreeNode.prototype.getNodesPixelCount = function(){
        return this.children.reduce((sum, node)=>{
            return sum + node.pixelCount;
        }, this.pixelCount);
    };

    OctreeNode.prototype.addColor = function(color, level, parent){
        if(level >= MAX_DEPTH){
            color.forEach((value, i)=>{
                this.color[i] = this.color[i] + value;
            });
            this.pixelCount++;
            return;
        }
        const index = this.getColorIndexForLevel(color, level);
        if(!this.children[index]){
            this.children[index] = new OctreeNode(level, parent);
        }
        this.children[index].addColor(color, level+1, parent);
    };

    OctreeNode.prototype.getColorIndexForLevel = function(color, level){
        let index = 0;
        const mask = 128 >> level;
        if(color[0] & mask){
            index = 4;
        }
        if(color[1] & mask){
            index |= 2;
        }
        if(color[2] & mask){
            index |= 1;
        }
        
        return index;
    };
    OctreeNode.prototype.removeLeaves = function(){
        let result = 0;

        this.children.forEach((node)=>{
            node.color.forEach((value, i)=>{
                this.color[i] += value;
            });
            this.pixelCount += node.pixelCount;
            result++;
        });

        return result - 1;
    };

    OctreeNode.prototype.getColor = function(){
        const ret = new Uint8ClampedArray(3);
        this.color.forEach((value, i)=>{
            ret[i] = value / this.pixelCount;
        });
        return ret;
    };


    /**
     * Octree Quantizer Class
     */
    function OctreeQuantizer(){
        this.levels = ArrayUtil.create(MAX_DEPTH, ()=>{ return [];});
        this.root = new OctreeNode(0, this);
    }
    OctreeQuantizer.prototype.getLeaves = function(){
        //TODO check that this is correct
        return this.root.getLeafNodes();
    };

    OctreeQuantizer.prototype.addLevelNode = function(level, node){
        this.levels[level].push(node);
    };

    OctreeQuantizer.prototype.addColor = function(color){
        this.root.addColor(color, 0, this);
    };

    //Make color palette with `colorCount` colors maximum
    OctreeQuantizer.prototype.makePalette = function(colorCount, prioritizeMinority=false){
        let leafCount = this.getLeaves().length;
        const sortFunc = prioritizeMinority ? sortPrioritizeMinority : sortPrioritizeMajority;

        // reduce nodes
        // up to 8 leaves can be reduced here and the palette will have
        // only 248 colors (in worst case) instead of expected 256 colors
        for(let levelIndex=MAX_DEPTH-1;levelIndex>=0;levelIndex--){
            if(leafCount <= colorCount){
                break;
            }
            const level = this.levels[levelIndex];
            if(!level){
                continue;
            }
            const nodesOrder = level.map((node, i)=>{
                let pixelCount = 0;
                let childCount = 0;

                node.children.forEach((child)=>{
                    childCount++;
                    pixelCount += child.pixelCount;
                });

                return {
                    index: i,
                    pixels: pixelCount,
                    children: childCount,
                };
            }).sort(sortFunc);
            for(let i=0;i<nodesOrder.length;i++){
                const node = level[nodesOrder[i].index];
                leafCount -= node.removeLeaves();
                if(leafCount <= colorCount){
                    break;
                }
            }
            this.levels[levelIndex] = [];
        }
        //build palette
        const palette = [];
        const leaves = this.getLeaves();
        for(let i=0;i<leaves.length;i++){
            const node = leaves[i];
            if(node.isLeaf()){
                palette.push(node.getColor());
            }
            if(palette.length >= colorCount){
                break;
            }
        }
        return palette;
    };

    //prioritize colors that are frequent - many shades of frequent colors
    //non frequent colors will be culled
    function sortPrioritizeMajority(a, b){
        if(a.children != b.children){
            return a.children - b.children;
        }
        return a.pixels - b.pixels;
    }

    //prioritize colors that are infrequent - fewer shades of frequent colors
    //non frequent colors will still exist
    function sortPrioritizeMinority(a, b){
        if(a.children != b.children){
            return b.children - a.children;
        }
        return b.pixels - a.pixels;
    }

    function octree(pixels, numColors, colorQuantization, imageWidth, imageHeight, progressCallback){
        const octreeQuantizer = new OctreeQuantizer();
        const start = performance.now();
        const half = Math.floor(pixels.length / 8) * 4;
        //split for loop in half for the sake of progress callback
        for(let i=0;i<2;i++){
            const length = i === 0 ? half : pixels.length;
            for(let j=i*half;j<length;j+=4){
                const pixel = pixels.subarray(j, j+4);
                //ignore transparent pixels
                if(pixel[3] === 0){
                    continue;
                }
                octreeQuantizer.addColor(pixel);
            }
            progressCallback((i+1)*40);
        }
        const palette = octreeQuantizer.makePalette(numColors, colorQuantization.minority);
        return Util.pixelArrayToBuffer(palette, numColors);
    }


    return {
        octree
    };
})(App.ArrayUtil, App.OptimizePaletteUtil);