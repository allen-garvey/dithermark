<?php 
/**
     * Yliluoma's ordered dithering
     * from: https://bisqwit.iki.fi/story/howto/dither/jy/
     * based on: Yliluoma's ordered dithering algorithm 2
     */
?>
<script type="webgl/fragment-shader" id="webgl-yliluoma2-color-fshader">
    precision mediump float;
    
    varying vec2 v_texcoord;
    uniform sampler2D u_texture;

    uniform sampler2D u_bayer_texture;
    uniform float u_bayer_texture_dimensions;
    
    uniform int u_colors_array_length;
    uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];
    
    #{{lightnessFunction}}
    
    #{{hslFunctions}}
    
    #{{distanceFunction}}

    float pixelLuma(vec3 pixel){
        return dot(vec3(1.0), vec3(299.0, 587.0, 114.0) * pixel);
    }

    int deviseMixingPlan(vec3 pixel, int planIndex){
        vec2 planValues[<?= COLOR_DITHER_MAX_COLORS; ?>];
        int proportionTotal = 0;
        vec3 soFar = vec3(0.0);
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            int chosenAmount = 1;
            int chosen = 0;
            int maxTestCount = int(max(1.0, float(proportionTotal)));
            <?php //big number ?>
            float leastPenalty = 99999999999.0;

            for(int index=0; index<<?= COLOR_DITHER_MAX_COLORS; ?>; index++){
                if(index >= u_colors_array_length){
                    break;
                }   
                vec3 color = u_colors_array[index];
                vec3 sum = soFar;
                vec3 add = color;
                int p = 1;
                for(int q=0; q<<?= COLOR_DITHER_MAX_COLORS; ?>; q++){
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
            for(int p=0; p<<?= COLOR_DITHER_MAX_COLORS; ?>; ++p){
                if(p >= chosenAmount || proportionTotal >= u_colors_array_length){
                    break;
                }
                for(int q=0; q<<?= COLOR_DITHER_MAX_COLORS; ?>; q++){
                    if(q == proportionTotal){
                        float luma = 0.0;
                        for(int j=0;j<<?= COLOR_DITHER_MAX_COLORS; ?>;j++){
                            if(j == chosen){
                                luma = pixelLuma(u_colors_array[j]);
                                break;
                            }
                        }
                        planValues[q] = vec2(float(chosen), luma);
                        break;
                    }
                }
                proportionTotal++;
            }
            for(int p=0; p<<?= COLOR_DITHER_MAX_COLORS; ?>; ++p){
                if(p==chosen){
                    vec3 color = u_colors_array[p];
                    soFar = soFar + color * vec3(float(chosenAmount));
                    break;
               }
            }
            if(proportionTotal >= u_colors_array_length){
                break;
            }
        }

        
        <?php //bubble sort
            //can't use insertion sort since if we iterate array in reverse we would have to use continue
            //statements until we found the actual end of the array
            //with optimization from wikipedia
        ?>
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

        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i == planIndex){
                return int(planValues[i].x);
            }
        }
        <?php //should never reach this line, but to keep compiler happy ?>
        return 0;
    }
    
    void main(){
        #{{transparencyCheck}}
        vec3 outputPixel = pixel.rgb;
        vec2 bayerPixelCoord = vec2(gl_FragCoord.xy / vec2(u_bayer_texture_dimensions));
        vec4 bayerPixel = texture2D(u_bayer_texture, bayerPixelCoord);
        float bayerValue = bayerPixel.r * u_bayer_texture_dimensions;
        int planIndex = int(bayerValue * float(u_colors_array_length) / u_bayer_texture_dimensions);
        int colorIndex = deviseMixingPlan(outputPixel, planIndex);
        
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i == colorIndex){
                outputPixel = u_colors_array[i];
                break;
            }
        }

        gl_FragColor = vec4(outputPixel, pixel.a);
    }
</script>