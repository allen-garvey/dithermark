<?php
//Kuwahara filter adapted from:
//https://stackoverflow.com/questions/5830139/how-can-i-do-these-image-processing-tasks-using-opengl-es-2-0-shaders?noredirect=1&lq=1
?>
<script type="webgl/fragment-shader" id="webgl-fragment-shader-smoothing">
<?php //precision highp float; ?>
precision mediump float;

varying vec2 v_texcoord;
uniform sampler2D u_texture;
uniform int u_radius;
<?php //since we need constant values for for loops ?>
const int maxRadius = 16;
uniform vec2 u_image_dimensions;

void main(){
    <?php //have to do this, or transparent pixels will be black  ?>
    vec4 pixel = texture2D(u_texture, v_texcoord);
    if(pixel.a < 0.00001){
        gl_FragColor = pixel;
        return;
    }
    vec2 uv = v_texcoord;
    int radiusDiff = maxRadius - u_radius;
    float n = float((u_radius + 1) * (u_radius + 1));

    vec3 m[4];
    vec3 s[4];
    for(int k = 0; k < 4; ++k){
        m[k] = vec3(0.0);
        s[k] = vec3(0.0);
    }

    for(int j = -maxRadius; j <= 0; ++j){
        if(j > -radiusDiff){
            break;
        }
        for(int i = -maxRadius; i <= 0; ++i){
            if(i > -radiusDiff){
                break;
            }
            vec3 c = texture2D(u_texture, uv + vec2(i+radiusDiff, j+radiusDiff) / u_image_dimensions).rgb;
            m[0] += c;
            s[0] += c * c;
        }
    }

    for(int j = -maxRadius; j <= 0; ++j){
        if(j > -radiusDiff){
            break;
        }
        for(int i = 0; i <= maxRadius; ++i){
            if(i > u_radius){
                break;
            }
            vec3 c = texture2D(u_texture, uv + vec2(i,j+radiusDiff) / u_image_dimensions).rgb;
            m[1] += c;
            s[1] += c * c;
        }
    }

    for(int j = 0; j <= maxRadius; ++j){
        if(j > u_radius){
            break;
        }
        for(int i = 0; i <= maxRadius; ++i){
            if(i > u_radius){
                break;
            }
            vec3 c = texture2D(u_texture, uv + vec2(i,j) / u_image_dimensions).rgb;
            m[2] += c;
            s[2] += c * c;
        }
    }

    for(int j = 0; j <= maxRadius; ++j){
        if(j > u_radius){
            break;
        }
        for(int i = -maxRadius; i <= 0; ++i){
            if(i > -radiusDiff){
                break;
            }
            vec3 c = texture2D(u_texture, uv + vec2(i+radiusDiff,j) / u_image_dimensions).rgb;
            m[3] += c;
            s[3] += c * c;
        }
    }


    float min_sigma2 = 1e+2;
    for(int k = 0; k < 4; ++k){
        m[k] /= n;
        s[k] = abs(s[k] / n - m[k] * m[k]);

        float sigma2 = s[k].r + s[k].g + s[k].b;
        if(sigma2 < min_sigma2){
            min_sigma2 = sigma2;
            gl_FragColor = vec4(m[k], 1.0);
        }
    }
}
</script>