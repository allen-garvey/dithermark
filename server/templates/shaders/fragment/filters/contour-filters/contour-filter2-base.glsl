//@param u_radius radius in pixels (radiusPercentage / height)
precision mediump float;

uniform sampler2D u_texture;
varying vec2 v_texcoord;
uniform float u_radius;

#{{customDeclaration}}

//use the fragment position for a different seed per-pixel
float random(vec3 scale, float seed) {
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main(){
    vec4 pixel = texture2D(u_texture, v_texcoord);
    
    vec2 color = vec2(0.0);
    vec2 total = vec2(0.0);

    //randomize the lookup values to hide the fixed number of samples
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);

    for(float t = -30.0; t <= 30.0; t++){
        float percent = (t + offset - 0.5) / 30.0;
        float weight = 1.0 - abs(percent);
        vec2 sample = texture2D(u_texture, v_texcoord + vec2(0.0, u_radius) * percent).xy;
        color.x += sample.x * weight;
        total.x += weight;
        if(abs(t) < 15.0){
            weight = weight * 2.0 - 1.0;
            color.y += sample.y * weight;
            total.y += weight;
        }
    }
    float c = clamp(10000.0 * (color.y / total.y - color.x / total.x) + 0.5, 0.0, 1.0);
    if(c < 0.5){
        gl_FragColor = #{{customOutlineColor}}
    }
    else{
        gl_FragColor = vec4(0.0);
    }
}