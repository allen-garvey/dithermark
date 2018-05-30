<?php 
/**
     * Yliluoma's ordered dithering
     * from: https://bisqwit.iki.fi/story/howto/dither/jy/
     * based on: Yliluoma's ordered dithering algorithm 1
     */
?>
<script type="webgl/fragment-shader" id="webgl-yliluoma1-color-fshader">
    precision mediump float;
    
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;

    uniform sampler2D u_bayer_texture;
    uniform float u_bayer_texture_dimensions;
    
    uniform int u_colors_array_length;
    uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];
    
    #{{lightnessFunction}}
    
    #{{hslFunctions}}
    
    #{{distanceFunction}}

    float evaluate_mixing_error(vec3 pixel, vec3 color0, vec3 color1, vec3 color2, float ratioFraction){
        return quick_distance(pixel, color0) + quick_distance(color1, color2) * 0.1 * abs(ratioFraction-0.5) + 0.5;
    }

    int devise_mixing_plan(vec3 pixel, float bayerLength, float bayerValue){
        int bayerLengthInt = int(bayerLength);
        int color1Index = 0;
        int color2Index = 0;
        <?php // 0 = always color1Index, 1 = always color2Index, 0.5 = 50% of both ?>
        float colorRatio = 0.5;
        <?php //big number ?>
        float leastPenalty = 9999.99;
        <?php 
            // Loop through every unique combination of two colors from the palette,
            // and through each possible way to mix those two colors. They can be
            // mixed in exactly 64 ways, when the threshold matrix is 8x8.
        ?>
        for(int index1=0;index1<<?= COLOR_DITHER_MAX_COLORS; ?>;index1++){
            if(index1 >= u_colors_array_length){
                break;
            }
            for(int index2=0;index2<<?= COLOR_DITHER_MAX_COLORS; ?>;index2++){
                <?php //can't initialize index2 with value of index1 ?>
                if(index2<index1){
                    continue;
                }
                if(index2 >= u_colors_array_length){
                    break;
                }
                for(int ratio=0;ratio<<?= ORDERED_MATRIX_MAX_LENGTH; ?>;ratio++){
                    if(ratio >= bayerLengthInt){
                        break;
                    }
                    if(index1 == index2 && ratio != 0){
                        break;
                    }
                    float ratioFloat = float(ratio);
                    float ratioFraction = ratioFloat / bayerLength;
                    <?php // Determine the two component colors ?>
                    vec3 color1 = u_colors_array[index1];
                    vec3 color2 = u_colors_array[index2];
                    <?php // Determine what mixing them in this proportion will produce ?>
                    vec3 color0 = color1 + vec3(ratioFloat) * (color2 - color1) / vec3(bayerLength);
                    float penalty = evaluate_mixing_error(pixel, color0, color1, color2, ratioFraction);
                    if(penalty < leastPenalty){
                        <?php // Keep the result that has the smallest error ?>
                        leastPenalty = penalty;
                        color1Index = index1;
                        color2Index = index2;
                        colorRatio = ratioFraction;
                    }
                }
            }
        }
        if(bayerValue < colorRatio){
            return color2Index;
        }
        return color1Index;
    }
    
    void main(){
        #{{transparencyCheck}}
        vec3 outputPixel = pixel.rgb;
        vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
        vec4 bayerPixel = texture2D(u_bayer_texture, bayerPixelCoord);
        float bayerLength = u_bayer_texture_dimensions * u_bayer_texture_dimensions;
        <?php //bayerValue could be rounded, but only webgl2 has round function, and difference is trivial ?>
        float bayerValue = floor(bayerPixel.r * (bayerLength - 1.0));
        int colorIndex = devise_mixing_plan(outputPixel, bayerLength, bayerValue);
        
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i == colorIndex){
                outputPixel = u_colors_array[i];
                break;
            }
        }

        gl_FragColor = vec4(outputPixel, pixel.a);
    }
</script>