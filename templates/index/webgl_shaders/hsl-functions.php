<script type="webgl/fragment-shader-function" id="webgl-fragment-shader-lightness-function">
    float lightness(vec3 pixel){
        float maxVal = max(max(pixel.r, pixel.g), pixel.b);
        float minVal = min(min(pixel.r, pixel.g), pixel.b);
        return (maxVal + minVal) / 2.0;
    }
</script>

<script type="webgl/fragment-shader-function" id="webgl-hsl-functions">
    <?php //from: https://stackoverflow.com/questions/15095909/from-rgb-to-hsv-in-opengl-glsl
        //and http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl
     ?>
    vec3 rgb2hsv(vec3 c){
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        <?php 
            //vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
            //vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
        ?>
        vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
        vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);

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
        return pixelHsv.g;
    }
    
    float hue_distance(float hue1, float hue2){
        float distance = abs(hue1 - hue2);
        <?php //since hue is circular, we need to compare it with the inversion ?>
        return min(distance, 1.0 - distance);
    }
    
    float hue(vec3 pixel){
        vec3 pixelHsv = rgb2hsv(pixel);
        return pixelHsv.r;
    }

    float pixel_luma(vec3 pixel){
        return dot(vec3(0.299, 0.587, 0.114), pixel);
    }
</script>