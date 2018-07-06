<?php 
//used to add outline around images
//based on https://github.com/evanw/glfx.js/blob/master/src/filters/fun/edgework.js

/*
Copyright (C) 2011 by Evan Wallace

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

//Picks out different frequencies in the image by subtracting two copies of the image blurred with different radii.

//@param u_radius radius in pixels (radiusPercentage / width)
?>
<script type="webgl/fragment-shader" id="webgl-fragment-image-outline-filter1">
    precision mediump float;

    uniform sampler2D u_texture;
    varying vec2 v_texcoord;
    uniform float u_radius;

    <?php //use the fragment position for a different seed per-pixel ?>
    float random(vec3 scale, float seed) {
        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
    }

    void main(){
        vec2 color = vec2(0.0);
        vec2 total = vec2(0.0);

        <?php //randomize the lookup values to hide the fixed number of samples ?>
        float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
        for(float t = -30.0; t <= 30.0; t++){
            float percent = (t + offset - 0.5) / 30.0;
            float weight = 1.0 - abs(percent);
            vec3 sample = texture2D(u_texture, v_texcoord + vec2(u_radius, 0.0) * percent).rgb;
            float average = (sample.r + sample.g + sample.b) / 3.0;
            color.x += average * weight;
            total.x += weight;
            if(abs(t) < 15.0){
                weight = weight * 2.0 - 1.0;
                color.y += average * weight;
                total.y += weight;
            }
        }
        gl_FragColor = vec4(color / total, 0.0, 1.0);
    }
</script>


<?php 
//@param u_radius radius in pixels (radiusPercentage / height)
?>
<script type="webgl/fragment-shader" id="webgl-fragment-image-outline-filter2">
    precision mediump float;

    uniform sampler2D u_texture;
    varying vec2 v_texcoord;
    uniform float u_radius;

    <?php //use the fragment position for a different seed per-pixel ?>
    float random(vec3 scale, float seed) {
        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
    }

    void main(){
        vec2 color = vec2(0.0);
        vec2 total = vec2(0.0);

        <?php //randomize the lookup values to hide the fixed number of samples ?>
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
            vec3 outlineColor = vec3(0.0);
            gl_FragColor = vec4(outlineColor, 1.0);
        }
        else{
            gl_FragColor = vec4(0.0);
        }
    }
</script>
<?php 
//@param u_radius radius in pixels (radiusPercentage / height)
//uses closest color in palette to background color that is darker for outline color
?>
<script type="webgl/fragment-shader" id="webgl-fragment-image-outline-filter2-background">
    precision mediump float;

    uniform sampler2D u_texture;
    uniform sampler2D u_background_texture;
    varying vec2 v_texcoord;
    uniform float u_radius;

    uniform int u_colors_array_length;
    uniform vec3 u_colors_array[<?= COLOR_DITHER_MAX_COLORS; ?>];

    #{{lightnessFunction}}
    #{{hslFunctions}}
    #{{distanceFunction}}

    <?php //find closest color to backgroundPixel that is darker to use for outline color ?>
    vec3 get_dark_outline_color(vec3 backgroundPixel){
        vec3 outlineColor = backgroundPixel;
        float backgroundLightness = lightness(backgroundPixel);
        
        <?php //arbitrarily large number ?>
        float shortestDistance = 99999.99;
        for(int i=0;i<<?= COLOR_DITHER_MAX_COLORS; ?>;i++){
            if(i >= u_colors_array_length){
                break;
            }
            vec3 currentColor = u_colors_array[i];
            float currentDistance = quick_distance(backgroundPixel, currentColor);
            if(lightness(currentColor) < backgroundLightness && currentDistance < shortestDistance){
                shortestDistance = currentDistance;
                outlineColor = currentColor;
            }
        }

        return outlineColor;
    }

    <?php //use the fragment position for a different seed per-pixel ?>
    float random(vec3 scale, float seed) {
        return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
    }

    void main(){
        vec2 color = vec2(0.0);
        vec2 total = vec2(0.0);

        <?php //randomize the lookup values to hide the fixed number of samples ?>
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
            vec3 outlineColor = vec3(0.0);
            gl_FragColor = vec4(get_dark_outline_color(texture2D(u_background_texture, v_texcoord).rgb), 1.0);
        }
        else{
            gl_FragColor = vec4(0.0);
        }
    }
</script>