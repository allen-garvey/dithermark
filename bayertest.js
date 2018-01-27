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


function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function displayArray(a){
    let dimensions = Math.sqrt(a.length);
    
    let s = '';
    for(let i=1;i<=a.length;i++){
        s = s + ' ' + padDigits(a[i-1], 3);
        
        if(i % dimensions === 0){
            console.log(s);
            s = '';
        }
    }
}

function testBayer(dimensions){
    displayArray(createBayer(dimensions));
}