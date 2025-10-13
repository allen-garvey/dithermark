#version 300 es
precision mediump float;
    
in vec2 v_texcoord;
out vec4 output_color;
uniform sampler2D u_texture;

uniform int u_colors_array_length;
uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];
uniform float u_dither_r_coefficient;

#{{lightnessFunction}}

#{{hslFunctions}}

#{{labFunctions}}

#{{distanceFunction}}

#{{customDeclaration}}

void main(){
    vec4 pixel = texture(u_texture, v_texcoord);
    vec3 adjustedPixel = pixel.rgb;

    #{{customBody}}
    
    float shortestDistance = 9999.9;
    vec3 closestPixel = adjustedPixel;
    
    for(int i=0;i<u_colors_array_length;i++){
        vec3 currentColor = u_colors_array[i];
        float currentDistance = quick_distance(adjustedPixel, currentColor);
        if(currentDistance < shortestDistance){
            shortestDistance = currentDistance;
            closestPixel = currentColor;
        }
    }
    
    vec3 outputPixel = closestPixel;

    #{{optionalPostscript}}
    
    output_color = vec4(outputPixel, pixel.a);
}