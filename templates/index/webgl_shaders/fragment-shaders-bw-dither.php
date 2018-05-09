<script type="webgl/fragment-shader" id="webgl-fragment-shader-template">
    precision mediump float;
    
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    uniform float u_threshold;
    uniform vec3 u_black_pixel;
    uniform vec3 u_white_pixel;
    uniform float u_dither_r_coefficient;
    
    #{{customDeclaration}}
    
    #{{lightnessFunction}}
    
    void main(){
       vec4 pixel = texture2D(u_texture, v_texcoord);
       <?php //have to do this, or transparent images will look weird, though exporting them will still be correct  ?>
        if(pixel.a < 0.00001){
            gl_FragColor = pixel;
            return;
        }
       float pixelLightness = lightness(pixel.rgb);
       
       #{{customBody}}
       
       vec4 outputPixel;
       
       if(shouldUseBlackPixel){
           outputPixel = vec4(u_black_pixel.rgb, pixel.a);
       }
       else{
           outputPixel = vec4(u_white_pixel.rgb, pixel.a);
       }
       gl_FragColor = outputPixel;
    }
</script>
<script type="webgl/fragment-shader" id="webgl-threshold-fshader-body">
    bool shouldUseBlackPixel = pixelLightness < u_threshold;
</script>

<script type="webgl/fragment-shader" id="webgl-random-threshold-fshader-declaration">
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

<script type="webgl/fragment-shader" id="webgl-random-threshold-fshader-body">
    bool shouldUseBlackPixel = pixelLightness + u_dither_r_coefficient * (rand(v_texcoord.xy*u_random_seed.xy) - 0.5) < u_threshold;
</script>

<script type="webgl/fragment-shader" id="webgl-arithmetic-dither-fshader-body">
    bool shouldUseBlackPixel = pixelLightness + u_dither_r_coefficient * (arithmeticDither(v_texcoord, pixel.rgb) - 0.5) < u_threshold;
</script>

<script type="webgl/fragment-shader" id="webgl-ordered-dither-fshader-declaration">
    uniform sampler2D u_bayer_texture;
    uniform float u_bayer_texture_dimensions;
</script>

<script type="webgl/fragment-shader" id="webgl-ordered-dither-fshader-body">
   vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
   vec4 bayerPixel = texture2D(u_bayer_texture, bayerPixelCoord);
   float bayerValue = bayerPixel.r;
   bool shouldUseBlackPixel = pixelLightness + u_dither_r_coefficient * (bayerValue - 0.5) < u_threshold;
</script>

<script type="webgl/fragment-shader" id="webgl-color-replace-fshader-body">
    <?php //we are comparing to 0.0, but can't use == because of floating point precision ?>
    bool shouldUseBlackPixel = pixel.r < 0.5;
</script>

<?php //the following are the shaders used to combine 3 textures into a single output ?>
<?php if(ENABLE_TEXTURE_COMBINE): ?>
    <script type="webgl/fragment-shader" id="webgl-combine-dither-fshader-declaration">
        uniform sampler2D u_texture_2;
        uniform sampler2D u_texture_3;
    </script>

    <script type="webgl/fragment-shader" id="webgl-combine-dither-fshader-body">
    vec4 pixel2 = texture2D(u_texture_2, v_texcoord);
    vec4 pixel3 = texture2D(u_texture_3, v_texcoord);
    
    vec3 majorityPixel;
    if(pixel == pixel2 || pixel == pixel3){
            majorityPixel = pixel.rgb;
        }
        else{
            majorityPixel = pixel2.rbg;
        }
    
        bool shouldUseBlackPixel = majorityPixel == u_black_pixel;
    </script>
<?php endif; ?>