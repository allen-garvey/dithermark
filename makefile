JS_SRC=js_src/fs.js js_src/timer.js js_src/pixel.js js_src/canvas.js js_src/image.js js_src/threshold.js js_src/error-prop-dither.js js_src/ordered-dither.js js_src/histogram.js js_src/app.js
JS_OUTPUT=public_html/js/app.js

VUE_SRC=node_modules/vue/dist/vue.min.js
VUE_OUTPUT=public_html/js/vue.min.js

CSS_OUTPUT = public_html/styles/style.css

all: $(JS_OUTPUT) $(CSS_OUTPUT) $(VUE_OUTPUT)

$(VUE_OUTPUT): $(VUE_SRC)
	cat $(VUE_SRC) > $(VUE_OUTPUT) 

$(JS_OUTPUT): $(JS_SRC)
	cat $(JS_SRC) > $(JS_OUTPUT)
	
$(CSS_OUTPUT): $(shell find ./sass -type f -name '*.scss')
	sassc --style compressed sass/style.scss $(CSS_OUTPUT)
	
watch_js:
	while true; do \
        make $(JS_OUTPUT); \
        inotifywait --quiet --recursive --event create --event modify --event move ./js_src/; \
    done