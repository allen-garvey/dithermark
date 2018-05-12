<script type="webgl/fragment-shader-function" id="webgl-bitwise-function-template">
    <?php //adapted from: https://gist.github.com/EliCDavis/f35a9e4afb8e1c9ae94cce8f3c2c9b9a ?>
    int #{{functionName}}(int n1, int n2){
        <?php //have to convert to floats since WebGl 1 doesn't support integer modulus ?>
        float v1 = float(n1);
        float v2 = float(n2);
        
        int byteVal = 1;
        int result = 0;
        
        for(int i = 0; i < 32; i++){
            <?php //can't compare directly to 0.0 because of floating point inaccuracies, so using 0.5 instead ?>
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
</script>

<script type="webgl/fragment-shader" id="webgl-arithmetic-dither-fshader-declaration">
    <?php //high int precision required for bitwise functions to work on mobile devices ?>
    precision highp int;
    
    #{{bitwiseFunctions}}
    
    float aDitherMask1(int x, int y){
        return float(AND(XOR(x, y * 149) * 1234, 511)) / 511.0;
    }
    
    float aDitherMask2(int x, int y, int c){
        return float(AND(XOR(x + (c * 17), y * 149) * 1234, 511)) / 511.0;
    }
    
    float aDitherMask3(int x, int y){
        return float(AND((x + (y * 237)) * 119,  255)) / 255.0;
    }
    
    float aDitherMask4(int x, int y, int c){
        return float(AND(((c * 67 + x) + (y * 236)) * 119, 255)) / 255.0;
    }
    
    float arithmeticDither(vec2 pos, vec3 pixel){
        int x = int(pos.x);
        int y = int(pos.y);
        return #{{arithmeticDitherReturn}};
        <?php //(e.g.) aDitherMask3(x, y); ?>
    }
</script>