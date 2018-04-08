<script type="webgl/fragment-shader" id="webgl-color-dither-base-fshader">
    precision mediump float;
    
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    
    uniform int u_colors_array_length;
    uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];
    
    #{{lightnessFunction}}
    
    #{{hslFunctions}}
    
    #{{distanceFunction}}
    
    #{{customDeclaration}}
    
    void main(){
        vec4 pixel = texture2D(u_texture, v_texcoord);
        
        float shortestDistance = 1000.0;
        float secondShortestDistance = 1000.0;
        vec3 closestPixel = pixel.rgb;
        vec3 secondClosestPixel = pixel.rgb;
        
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i >= u_colors_array_length){
                break;
            }
            vec3 currentColor = u_colors_array[i];
            float currentDistance = quick_distance(pixel.rgb, currentColor);
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

        #{{customBody}}
        
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
    
    if(secondShortestDistance * bayerValue < shortestDistance){
        outputPixel = secondClosestPixel;
    }
</script>
<script type="webgl/fragment-shader" id="webgl-hue-lightness-ordered-dither-color-declaration-fshader">
    uniform sampler2D u_bayer_texture;
    uniform float u_bayer_texture_dimensions;
    
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
<script type="webgl/fragment-shader" id="webgl-hue-lightness-ordered-dither-color-body-fshader">
    vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
    vec4 bayerPixel = texture2D(u_bayer_texture, bayerPixelCoord);
    float bayerValue = bayerPixel.r;
    
    if(secondShortestDistance * bayerValue < shortestDistance){
        outputPixel = secondClosestPixel;
    }
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
    float randomValue = rand(v_texcoord.xy*u_random_seed.xy);
    
    if(secondShortestDistance * randomValue < shortestDistance){
        outputPixel = secondClosestPixel;
    }
</script>
<script type="webgl/fragment-shader" id="webgl-arithmetic-dither-color-body">
    float aDitherValue = arithmeticDither(v_texcoord, pixel.rgb);
    if(secondShortestDistance * aDitherValue < shortestDistance){
        outputPixel = secondClosestPixel;
    }
</script>