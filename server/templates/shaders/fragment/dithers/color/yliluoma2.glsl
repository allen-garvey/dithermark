#version 300 es
// Yliluoma's ordered dithering
// from: https://bisqwit.iki.fi/story/howto/dither/jy/
// based on: Yliluoma's ordered dithering algorithm 2
// Joel Yliluoma considers this algorithm released in the public domain

precision mediump float;

in vec2 v_texcoord;
out vec4 output_color;
uniform sampler2D u_texture;

uniform sampler2D u_bayer_texture;
uniform float u_bayer_texture_dimensions;

uniform int u_colors_array_length;
uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];

#{{lightnessFunction}}

#{{hslFunctions}}

#{{distanceFunction}}

int deviseMixingPlan(vec3 pixel, int planIndex){
    vec2 planValues[<?= COLOR_DITHER_MAX_COLORS; ?>];
    int proportionTotal = 0;
    vec3 soFar = vec3(0.0);
    for(int i=0;i<u_colors_array_length;i++){
        int chosenAmount = 1;
        int chosen = 0;
        int maxTestCount = int(max(1.0, float(proportionTotal)));
        //big number
        float leastPenalty = 9999.99;

        for(int index=0; index<u_colors_array_length; index++){ 
            vec3 color = u_colors_array[index];
            vec3 sum = soFar;
            vec3 add = color;
            int p = 1;
            for(int q=0; q<u_colors_array_length; q++){
                if(p > maxTestCount){
                    break;
                }
                sum += add;
                add += add;
                vec3 test = sum / vec3(float(proportionTotal + p));
                float penalty = quick_distance(pixel, test);
                if(penalty < leastPenalty){
                    leastPenalty = penalty;
                    chosen = index;
                    chosenAmount = p;
                }
                p = p * 2;
            }
        }
        for(int p=0; p<u_colors_array_length; ++p){
            if(p >= chosenAmount || proportionTotal >= u_colors_array_length){
                break;
            }
            float luma = pixel_luma(u_colors_array[chosen]);
            planValues[proportionTotal] = vec2(float(chosen), luma);
            
            proportionTotal++;
        }
        vec3 color = u_colors_array[chosen];
        soFar = soFar + color * vec3(float(chosenAmount));
        
        if(proportionTotal >= u_colors_array_length){
            break;
        }
    }
    
    // bubble sort
    // can't use insertion sort since if we iterate array in reverse we would have to use continue statements until we found the actual end of the array
    // with optimization from wikipedia
    int innerLoopLimit = u_colors_array_length-1;
    for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
        bool swapped = false;
        for(int j=0;j<<?= COLOR_DITHER_MAX_COLORS; ?>-1;j++){
            if(j >= innerLoopLimit){
                break;
            }
            if(planValues[j].y > planValues[j+1].y){
                vec2 temp = planValues[j];
                planValues[j] = planValues[j+1];
                planValues[j+1] = temp;

                swapped = true;
            }
        }
        if(!swapped){
            break;
        }
        innerLoopLimit--;
    }

    return int(planValues[planIndex].x);
}

void main(){
    vec4 pixel = texture(u_texture, v_texcoord);
    vec3 outputPixel = pixel.rgb;
    vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
    vec4 bayerPixel = texture(u_bayer_texture, bayerPixelCoord);
    float bayerLength = u_bayer_texture_dimensions * u_bayer_texture_dimensions;
    // bayerValue could be rounded, but only webgl2 has round function, and difference is trivial
    float bayerValue = bayerPixel.r * (bayerLength - 1.0);
    int planIndex = int(bayerValue * float(u_colors_array_length) / bayerLength);
    int colorIndex = deviseMixingPlan(outputPixel, planIndex);

    output_color = vec4(u_colors_array[colorIndex], pixel.a);
}
