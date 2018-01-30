
App.BayerMatrix = (function(){
    /* iterative bayer matrix creation function based on recursive definition from
     * https://github.com/tromero/BayerMatrix/blob/master/MakeBayer.py
     * @param dimensions = power of 2 greater than or equal to 2 (length of 1 side of the matrix)
    */
    function createBayer(dimensions){
        const bayerBase = new Uint8Array([0, 2, 3, 1]);
        
        //guard against infinite loop
        if(dimensions <= 2){
            return bayerBase;
        }
    
        // let arrayTotalLength = dimensions * dimensions;
        let currentDimension = 2;
        let bayerArray = new Uint8Array(bayerBase);
        
        while(currentDimension < dimensions){
            //dimensions of 1 of the four blocks
            let sectionDimensions = currentDimension;
            currentDimension *= 2;
            let subarrayLength = currentDimension * currentDimension;
            let newBayerArray = new Uint8Array(subarrayLength);
            
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
    
    return {
        create: createBayer,
    };
})();