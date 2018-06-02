<script type="webgl/fragment-shader" id="webgl-color-dither-base-fshader">
    precision mediump float;
    
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    
    uniform int u_colors_array_length;
    uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];
    uniform float u_dither_r_coefficient;
    
    #{{lightnessFunction}}
    
    #{{hslFunctions}}
    
    #{{distanceFunction}}
    
    #{{customDeclaration}}
    
    void main(){
        #{{transparencyCheck}}
        vec3 adjustedPixel = pixel.rgb;

        #{{customBody}}
        
        float shortestDistance = 9999.9;
        vec3 closestPixel = adjustedPixel;
        
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i >= u_colors_array_length){
                break;
            }
            vec3 currentColor = u_colors_array[i];
            float currentDistance = quick_distance(adjustedPixel, currentColor);
            if(currentDistance < shortestDistance){
                shortestDistance = currentDistance;
                closestPixel = currentColor;
            }
        }
        
        vec3 outputPixel = closestPixel;

        #{{optionalPostscript}}
        
        gl_FragColor = vec4(outputPixel, pixel.a);
    }
</script>
<script type="webgl/fragment-shader" id="webgl-ordered-dither-color-declaration-fshader">
    uniform sampler2D u_bayer_texture;
    uniform float u_bayer_texture_dimensions;
</script>
<script type="webgl/fragment-shader" id="webgl-ordered-dither-color-body-fshader">
    vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
    vec4 bayerPixel = texture2D(u_bayer_texture, bayerPixelCoord);
    float bayerValue = bayerPixel.r - 0.5;
    #{{bayerValueAdjustment}}
    adjustedPixel = clamp(adjustedPixel + vec3(u_dither_r_coefficient * bayerValue), 0.0, 1.0);
</script>
<script type="webgl/fragment-shader" id="webgl-hue-lightness-ordered-dither-color-declaration-fshader">
    <?php //ordered dither declaration gets concatenated here ?>
    
    <?php //based on: http://alex-charlton.com/posts/Dithering_on_the_GPU/ ?>
    float lightnessStep(float l){
        float lightnessSteps = 4.0;
        <?php //Quantize the lightness to one of `lightnessSteps` values ?>
        return floor(0.5 + l * lightnessSteps) / lightnessSteps;
    }
    
    vec3 hue_lightness_dither(vec3 pixel, float bayerValue){
        vec3 hsl = rgb2hsl(pixel);
    
        float pixelLightness = hsl.b;
        float l1 = lightnessStep(max(pixelLightness - 0.125, 0.0));
        float l2 = lightnessStep(min(pixelLightness + 0.124, 1.0));
        float lightnessDiff = (pixelLightness - l1) / (l2 - l1);
        
        float adjustedLightness = lightnessDiff < bayerValue ? l1 : l2;
        
        return hsl2rgb(vec3(hsl.rg, adjustedLightness));
    }
</script>
<script type="webgl/fragment-shader" id="webgl-hue-lightness-ordered-dither-color-postscript-fshader">
    <?php //don't use bayerValue variable, since we need it before 0.5 is subtracted, and without the possible randomization ?>
    outputPixel = hue_lightness_dither(outputPixel, bayerPixel.r);
</script>
<script type="webgl/fragment-shader" id="webgl-random-dither-color-body-fshader">
    float randomValue = u_dither_r_coefficient * (rand(v_texcoord.xy*u_random_seed.xy) - 0.5);
    adjustedPixel = clamp(adjustedPixel + vec3(randomValue), 0.0, 1.0);
</script>
<script type="webgl/fragment-shader" id="webgl-arithmetic-dither-color-body">
    float aDitherValue = u_dither_r_coefficient * (arithmeticDither(gl_FragCoord.xy, pixel.rgb) - 0.5);
    adjustedPixel = clamp(adjustedPixel + vec3(aDitherValue), 0.0, 1.0);
</script>