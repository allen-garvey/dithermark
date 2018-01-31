JS_SRC_DIR=js_src
JS_OUTPUT_DIR=public_html/js

JS_SRC=$(JS_SRC_DIR)/polyfills.js $(JS_SRC_DIR)/worker-headers.js $(JS_SRC_DIR)/fs.js $(JS_SRC_DIR)/worker-util.js $(JS_SRC_DIR)/timer.js $(JS_SRC_DIR)/pixel.js $(JS_SRC_DIR)/color-picker.js $(JS_SRC_DIR)/canvas.js $(JS_SRC_DIR)/bayer-matrix.js $(JS_SRC_DIR)/bayer-webgl.js $(JS_SRC_DIR)/webgl-m4.js $(JS_SRC_DIR)/webgl.js $(JS_SRC_DIR)/webgl-bw-dither.js $(JS_SRC_DIR)/histogram.js $(JS_SRC_DIR)/algorithm-model.js $(JS_SRC_DIR)/vues/bw-dither-component.js $(JS_SRC_DIR)/vues/app.js
JS_OUTPUT=$(JS_OUTPUT_DIR)/app.js


DITHER_WORKER_DIR=$(JS_SRC_DIR)/image_dithering_worker

DITHER_WORKER_SRC=$(JS_SRC_DIR)/polyfills.js $(JS_SRC_DIR)/worker-headers.js $(JS_SRC_DIR)/timer.js $(JS_SRC_DIR)/pixel.js $(DITHER_WORKER_DIR)/image.js $(DITHER_WORKER_DIR)/threshold.js $(DITHER_WORKER_DIR)/error-prop-dither.js $(JS_SRC_DIR)/bayer-matrix.js $(DITHER_WORKER_DIR)/ordered-dither.js $(DITHER_WORKER_DIR)/algorithm-model.js $(DITHER_WORKER_DIR)/worker-util.js $(DITHER_WORKER_DIR)/histogram.js $(DITHER_WORKER_DIR)/main.js
DITHER_WORKER_OUTPUT=$(JS_OUTPUT_DIR)/dither-worker.js


VUE_SRC=node_modules/vue/dist/vue.min.js
VUE_OUTPUT=$(JS_OUTPUT_DIR)/vue.min.js

CSS_OUTPUT = public_html/styles/style.css

all: $(JS_OUTPUT) $(CSS_OUTPUT) $(VUE_OUTPUT) $(DITHER_WORKER_OUTPUT)

$(VUE_OUTPUT): $(VUE_SRC)
	cat $(VUE_SRC) > $(VUE_OUTPUT) 

$(JS_OUTPUT): $(JS_SRC)
	cat $(JS_SRC) > $(JS_OUTPUT)

$(DITHER_WORKER_OUTPUT): $(DITHER_WORKER_SRC)
	cat $(DITHER_WORKER_SRC) > $(DITHER_WORKER_OUTPUT)
	
$(CSS_OUTPUT): $(shell find ./sass -type f -name '*.scss')
	sassc --style compressed sass/style.scss $(CSS_OUTPUT)
	
watch_js:
	while true; do \
        make $(JS_OUTPUT); \
        make $(DITHER_WORKER_OUTPUT); \
        inotifywait --quiet --recursive --event create --event modify --event move ./js_src/; \
    done