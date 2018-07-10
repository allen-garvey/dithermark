<script type="webgl/fragment-shader-function" id="webgl-rgb-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 distances = pixel1 - pixel2;
        return dot(vec3(1.0), distances * distances);
    }
</script>
<script type="webgl/fragment-shader-function" id="webgl-luma-distance">
    <?php //rgb with correction for luma based on: http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/ ?>
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 distances = pixel1 - pixel2;
        return pixel_luma(distances * distances);
    }
</script>
<?php // fraction values of 0.1 and 0.3 seem to work best, but 0.1 is used to differentiate it from hue-lightness distance ?>
<script type="webgl/fragment-shader-function" id="webgl-hue-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 hsl1 = rgb2hsl(pixel1);
        vec3 hsl2 = rgb2hsl(pixel2);

        float hueDist = hue_distance(hsl1.x, hsl2.x);

        if(hsl1.y < 0.1){
            float fraction = hsl1.y / 0.1;
            float lightnessDiff = hsl1.z - hsl2.z;
            return 2.0 * fraction * hueDist * hueDist + (1.0 - fraction) * lightnessDiff * lightnessDiff;
        }
        return hueDist * hueDist;
    }
</script>
<script type="webgl/fragment-shader-function" id="webgl-hue-lightness-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 hsl1 = rgb2hsl(pixel1);
        vec3 hsl2 = rgb2hsl(pixel2);

        float hueDist = hue_distance(hsl1.x, hsl2.x);
        float lightnessDiff = hsl1.z - hsl2.z;

        if(hsl1.y < 0.3){
            float fraction = hsl1.y / 0.3;
            return 2.0 * fraction * hueDist * hueDist + (1.0 - fraction) * lightnessDiff * lightnessDiff;
        }
        return 32.0 * hueDist * hueDist + lightnessDiff * lightnessDiff;
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
<?php //distance for outline filter palette color mode
    //prioritize hue, then lightness, then less saturation,
    //since darker colors should be less saturated
?>
<script type="webgl/fragment-shader-function" id="webgl-hsl2-distance">
    float rgb_distance(vec3 pixel1, vec3 pixel2){
        vec3 distances = pixel1 - pixel2;
        return dot(vec3(1.0), distances * distances);
    }
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 hsl1 = rgb2hsl(pixel1);
        if(hsl1.y < 0.3){
            return rgb_distance(pixel1, pixel2);
        }
        vec3 hsl2 = rgb2hsl(pixel2);
        float hDist = hue_distance(hsl1.r, hsl2.r);
        vec2 slDist = hsl1.gb - hsl2.gb;  
        vec3 hslDist = vec3(hDist, slDist);

        return dot(vec3(8.0, 1.0, 4.0), hslDist * hslDist);
    }
    }
</script>