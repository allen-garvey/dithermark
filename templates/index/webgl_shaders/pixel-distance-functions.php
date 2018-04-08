<script type="webgl/fragment-shader-function" id="webgl-rgb-distance">
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 distances = pixel1 - pixel2;
        return dot(vec3(1.0), distances * distances);
    }
</script>
<script type="webgl/fragment-shader-function" id="webgl-rgb-weighted-distance">
    <?php //rgb with correction for luma based on: http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/ ?>
    float quick_distance(vec3 pixel1, vec3 pixel2){
        vec3 distances = pixel1 - pixel2;
        return dot(vec3(3.0, 6.0, 1.0), distances * distances);
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