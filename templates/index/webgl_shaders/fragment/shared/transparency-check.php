<?php //so that webgl dithers don't mess up transparent pixels  ?>
<script type="webgl/fragment-shader" id="webgl-transparency-check-fshader">
    vec4 pixel = texture2D(u_texture, v_texcoord);
    <?php // 1.0/256.0 = 0.0039 ?>
    if(pixel.a < 0.004){
        gl_FragColor = vec4(0.0);
        return;
    }
</script>