<script type="webgl/fragment-shader" id="webgl-random-dither-declaration-fshader">
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

<?php //used to randomize ordered dither in bw and color dithers ?>
<script type="webgl/fragment-shader" id="webgl-random-ordered-dither-adjustment-fshader">
    bayerValue = bayerValue * rand(v_texcoord.xy*u_random_seed.xy);
</script>