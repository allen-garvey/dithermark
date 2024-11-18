//adapted from: https://gist.github.com/EliCDavis/f35a9e4afb8e1c9ae94cce8f3c2c9b9a

int #{{functionName}}(int n1, int n2){
    //have to convert to floats since WebGl 1 doesn't support integer modulus
    float v1 = float(n1);
    float v2 = float(n2);
    
    int byteVal = 1;
    int result = 0;
    
    for(int i = 0; i < 32; i++){
        //can't compare directly to 0.0 because of floating point inaccuracies, so using 0.5 instead
        if(v1 < 0.5 || v2 < 0.5){
            return result;
        }
        bool bit1IsOdd = mod(v1, 2.0) > 0.5;
        bool bit2IsOdd = mod(v2, 2.0) > 0.5;
        if(#{{operation}}){
            result += byteVal;
        }
        v1 = floor(v1 / 2.0);
        v2 = floor(v2 / 2.0);
        byteVal *= 2;
    }
    return result;
}