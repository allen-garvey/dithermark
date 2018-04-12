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
        vec4 pixel = texture2D(u_texture, v_texcoord);
        vec3 adjustedPixel = pixel.rgb;

        #{{customBody}}
        
        float shortestDistance = 1000.0;
        float secondShortestDistance = 1000.0;
        vec3 closestPixel = adjustedPixel;
        vec3 secondClosestPixel = adjustedPixel;
        
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i >= u_colors_array_length){
                break;
            }
            vec3 currentColor = u_colors_array[i];
            float currentDistance = quick_distance(adjustedPixel, currentColor);
            if(currentDistance < shortestDistance){
                secondShortestDistance = shortestDistance;
                secondClosestPixel = closestPixel;

                shortestDistance = currentDistance;
                closestPixel = currentColor;
            }
            else if(currentDistance < secondShortestDistance){
                secondShortestDistance = currentDistance;
                secondClosestPixel = currentColor;
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
    float bayerValue = bayerPixel.r;
    <?php //need to subtract 0.5 here, and not when bayerValue is declared, since it is also used for hue-lightness dither?>
    adjustedPixel = clamp(adjustedPixel + vec3(u_dither_r_coefficient * (bayerValue - 0.5)), 0.0, 1.0);
</script>
<script type="webgl/fragment-shader" id="webgl-hue-lightness-ordered-dither-color-declaration-fshader">
    <?php //ordered dither declaration gets concatenated here ?>
    
    <?php //based on: http://alex-charlton.com/posts/Dithering_on_the_GPU/ ?>
    float lightnessStep(float l){
        float lightnessSteps = 4.0;
        <?php //Quantize the lightness to one of `lightnessSteps` values ?>
        return floor((0.5 + l * lightnessSteps)) / lightnessSteps;
    }
    
    vec3 hue_lightness_dither(vec3 pixel, float bayerValue){
        vec3 hsl = rgb2hsl(pixel);
    
        float pixelLightness = hsl.b;
        float l1 = lightnessStep(max((pixelLightness - 0.125), 0.0));
        float l2 = lightnessStep(min((pixelLightness + 0.124), 1.0));
        float lightnessDiff = (pixelLightness - l1) / (l2 - l1);
        
        float adjustedLightness = (lightnessDiff < bayerValue) ? l1 : l2;
        
        return hsl2rgb(vec3(hsl.rg, adjustedLightness));
    }
</script>
<script type="webgl/fragment-shader" id="webgl-hue-lightness-ordered-dither-color-postscript-fshader">
    outputPixel = hue_lightness_dither(outputPixel, bayerValue);
</script>
<script type="webgl/fragment-shader" id="webgl-random-dither-color-declaration-fshader">
    uniform vec2 u_random_seed;
    
    <?php //based on: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/ ?>
    highp float rand(vec2 co){
        highp float a = 12.9898;
        highp float b = 78.233;
        highp float c = 43758.5453;
        highp float dt = dot(co.xy, vec2(a,b));
        highp float sn = mod(dt, 3.14);
        return fract(sin(sn) * c);
    }
</script>
<script type="webgl/fragment-shader" id="webgl-random-dither-color-body-fshader">
    float randomValue = u_dither_r_coefficient * (rand(v_texcoord.xy*u_random_seed.xy) - 0.5);
    adjustedPixel = clamp(adjustedPixel + vec3(randomValue), 0.0, 1.0);
</script>
<script type="webgl/fragment-shader" id="webgl-arithmetic-dither-color-body">
    float aDitherValue = u_dither_r_coefficient * (arithmeticDither(v_texcoord, pixel.rgb) - 0.5);
    adjustedPixel = clamp(adjustedPixel + vec3(aDitherValue), 0.0, 1.0);
</script>