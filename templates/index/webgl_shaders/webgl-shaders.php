<script type="webgl/vertex-shader" id="webgl-threshold-vertex-shader">
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
     
    uniform mat4 u_matrix;
    varying vec2 v_texcoord;
     
    void main() {
       gl_Position = u_matrix * a_position;
       v_texcoord = a_texcoord;
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
    float adjustedThreshold = abs(u_threshold * rand(v_texcoord.xy*u_random_seed.xy));
    bool shouldUseBlackPixel = pixelLightness < adjustedThreshold;
</script>

<script type="webgl/fragment-shader-function" id="webgl-bitwise-function-template">
    <?php //adapted from: https://gist.github.com/EliCDavis/f35a9e4afb8e1c9ae94cce8f3c2c9b9a ?>
    int #{{functionName}}(int n1, int n2){
        float v1 = float(n1);
        float v2 = float(n2);
        
        int byteVal = 1;
        int result = 0;
        
        for(int i = 0; i < 32; i++){
            bool keepGoing = v1 > 0.0 || v2 > 0.0;
            if(keepGoing){
                bool addOn = #{{operation}};
                if(addOn){
                    result += byteVal;
                }
                v1 = floor(v1 / 2.0);
                v2 = floor(v2 / 2.0);
                byteVal *= 2;
            } 
            else{
                return result;
            }
        }
        return result;
    }
</script>

<script type="webgl/fragment-shader" id="webgl-arithmetic-dither-fshader-declaration">
    uniform float u_image_height;
    uniform float u_image_width;
    
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
        int x = int(pos.x * u_image_width);
        int y = int(pos.y * u_image_height);
        return #{{arithmeticDitherReturn}};
        <?php //(e.g.) aDitherMask3(x, y); ?>
    }
</script>

<script type="webgl/fragment-shader" id="webgl-arithmetic-dither-fshader-body">
    float adjustedThreshold = u_threshold * arithmeticDither(v_texcoord, pixel.rgb);
    bool shouldUseBlackPixel = pixelLightness < adjustedThreshold;
</script>

<script type="webgl/fragment-shader" id="webgl-ordered-dither-fshader-declaration">
    uniform sampler2D u_bayer_texture;
    uniform float u_bayer_texture_dimensions;
</script>

<script type="webgl/fragment-shader" id="webgl-ordered-dither-fshader-body">
   vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
   vec4 bayerPixel = texture2D(u_bayer_texture, bayerPixelCoord);
   float bayerValue = bayerPixel.r;
   float adjustedThreshold = bayerValue * u_threshold;
   bool shouldUseBlackPixel = pixelLightness < adjustedThreshold;
</script>

<script type="webgl/fragment-shader" id="webgl-color-replace-fshader-body">
    <?php //we are comparing to 0.0, but can't use == because of floating point precision ?>
    bool shouldUseBlackPixel = pixel.r < 0.5;
</script>

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

<script type="webgl/fragment-shader-function" id="webgl-fragment-shader-lightness-function">
    float lightness(vec3 pixel){
        float maxVal = max(max(pixel.r, pixel.g), pixel.b);
        float minVal = min(min(pixel.r, pixel.g), pixel.b);
        return (maxVal + minVal) / 2.0;
    }
</script>

<script type="webgl/fragment-shader" id="webgl-fragment-shader-template">
    precision mediump float;
    
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    uniform float u_threshold;
    uniform vec3 u_black_pixel;
    uniform vec3 u_white_pixel;
    
    #{{customDeclaration}}
    
    #{{lightnessFunction}}
    
    void main(){
       vec4 pixel = texture2D(u_texture, v_texcoord);
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
<script type="webgl/fragment-shader-function" id="webgl-rgb-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 distances = pixel1 - pixel2;
        return dot(vec3(1.0), distances * distances);
    }
</script>
<script type="webgl/fragment-shader-function" id="webgl-hue-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        float hue1 = hue(pixel1);
        float hue2 = hue(pixel2);
        return hue_distance(hue1, hue2);
    }
</script>
<script type="webgl/fragment-shader-function" id="webgl-hue-lightness-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 hsl1 = rgb2hsl(pixel1);
        vec3 hsl2 = rgb2hsl(pixel2);
        float hDist = hue_distance(hsl1.r, hsl2.r);
        float lDist = hsl1.b - hsl2.b;
        return hDist * hDist + lDist * lDist;
    }
</script>
<script type="webgl/fragment-shader-function" id="webgl-lightness-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        float lightness1 = lightness(pixel1);
        float lightness2 = lightness(pixel2);
        return abs(lightness1 - lightness2);
    }
</script>
<script type="webgl/fragment-shader-function" id="webgl-hue-saturation-lightness-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 hsl1 = rgb2hsl(pixel1);
        vec3 hsl2 = rgb2hsl(pixel2);
        float hDist = hue_distance(hsl1.r, hsl2.r);
        vec2 slDist = hsl1.gb - hsl2.gb;  
        vec3 hslDist = vec3(hDist, slDist);  

        return dot(vec3(8.0, 1.0, 32.0), hslDist * hslDist);
    }
</script>
<script type="webgl/fragment-shader-function" id="webgl-hsl-functions">
    <?php //from: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl ?>
    vec3 rgb2hsv(vec3 c){
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
    }

    vec3 hsv2rgb(vec3 c){
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    }

    <?php //from: https://codeitdown.com/hsl-hsb-hsv-color/ ?>
    vec3 hsv2hsl(vec3 pixel){
        float l = 0.5 * pixel.b * (2.0 - pixel.g);
        float s = pixel.g * pixel.b / (1.0 - abs(2.0 * l - 1.0));
        return vec3(pixel.r, s, l);
    }

    vec3 rgb2hsl(vec3 pixel){
        return hsv2hsl(rgb2hsv(pixel));
    }

    <?php //from: https://codeitdown.com/hsl-hsb-hsv-color/ ?>
    vec3 hsl2hsv(vec3 pixel){
        float b = (2.0 * pixel.b + pixel.g * (1.0 - abs(2.0 * pixel.b - 1.0))) / 2.0;
        float s = 2.0 * (b - pixel.b) / b;
        return vec3(pixel.r, s, b);
    }

    vec3 hsl2rgb(vec3 pixel){
        return hsv2rgb(hsl2hsv(pixel));
    }

    float saturation(vec3 pixel){
        vec3 pixelHsv = rgb2hsv(pixel);
        return pixel.g;
    }
    
    float hue_distance(float hue1, float hue2){
        float distance = abs(hue1 - hue2);
        <?php //since hue is circular, we need to compare it with the inversion ?>
        return min(distance, 1.0 - distance);
    }
    
    float hue(vec3 pixel){
        vec3 pixelHsv = rgb2hsv(pixel);
        return pixel.r;
    }
</script>
<script type="webgl/fragment-shader" id="webgl-closest-color-fshader">
    precision mediump float;
    
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;
    
    uniform int u_colors_array_length;
    uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];
    
    #{{lightnessFunction}}
    
    #{{hslFunctions}}
    
    #{{distanceFunction}}
    
    void main(){
        vec4 pixel = texture2D(u_texture, v_texcoord);
        
        float shortestDistance = 1000.0;
        vec3 outputPixel = pixel.rgb;
        
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i >= u_colors_array_length){
                break;
            }
            vec3 currentColor = u_colors_array[i];
            float currentDistance = quick_distance(pixel.rgb, currentColor);
            if(currentDistance < shortestDistance){
                shortestDistance = currentDistance;
                outputPixel = currentColor;
            }
        }
        
        gl_FragColor = vec4(outputPixel, pixel.a);
    }
</script>
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
    
    float lightnessStep(float l) {
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