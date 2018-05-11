<script type="webgl/vertex-shader" id="webgl-vertex-shader">
    precision mediump float;
    <?php //from: https://webglfundamentals.org/webgl/lessons/webgl-2d-drawimage.html ?>
    attribute vec4 a_position;
    attribute vec2 a_texcoord;
     
    uniform mat4 u_matrix;
    varying vec2 v_texcoord;
     
    void main() {
       gl_Position = u_matrix * a_position;
       v_texcoord = a_texcoord;
    }
</script>