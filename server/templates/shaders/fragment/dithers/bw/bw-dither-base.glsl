#version 300 es
precision mediump float;
    
in vec2 v_texcoord;
out vec4 output_color;
uniform sampler2D u_texture;
uniform float u_threshold;
uniform vec3 u_black_pixel;
uniform vec3 u_white_pixel;
uniform float u_dither_r_coefficient;

#{{customDeclaration}}

#{{lightnessFunction}}

void main(){
    vec4 pixel = texture(u_texture, v_texcoord);
    float pixelLightness = lightness(pixel.rgb);
    #{{customBody}}
    
    vec3 outputPixel;
    if(shouldUseBlackPixel){
        outputPixel = u_black_pixel;
    }
    else{
        outputPixel = u_white_pixel;
    }
    output_color = vec4(outputPixel, pixel.a);
}