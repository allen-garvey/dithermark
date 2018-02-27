PUBLIC_HTML_DIR=public_html
HTML_INDEX=$(PUBLIC_HTML_DIR)/index.html

JS_SRC_DIR=js_src
VUES_DIR=$(JS_SRC_DIR)/vues
JS_OUTPUT_DIR=$(PUBLIC_HTML_DIR)/js

JS_SRC=$(JS_SRC_DIR)/polyfills.js $(JS_SRC_DIR)/worker-headers.js $(JS_SRC_DIR)/color-dither-modes.js $(JS_SRC_DIR)/fs.js $(JS_SRC_DIR)/worker-util.js $(JS_SRC_DIR)/timer.js $(JS_SRC_DIR)/pixel.js $(JS_SRC_DIR)/color-picker.js $(JS_SRC_DIR)/canvas.js $(JS_SRC_DIR)/bayer-matrix.js $(JS_SRC_DIR)/bayer-webgl.js $(JS_SRC_DIR)/webgl-m4.js $(JS_SRC_DIR)/webgl.js $(JS_SRC_DIR)/webgl-bw-dither.js $(JS_SRC_DIR)/webgl-color-dither.js $(JS_SRC_DIR)/histogram.js $(JS_SRC_DIR)/algorithm-model.js $(VUES_DIR)/bw-dither-component.js $(VUES_DIR)/color-dither-component.js $(VUES_DIR)/dither-studio-component.js $(VUES_DIR)/app.js
JS_OUTPUT=$(JS_OUTPUT_DIR)/app.js


DITHER_WORKER_DIR=$(JS_SRC_DIR)/image_dithering_worker

DITHER_WORKER_SRC=$(JS_SRC_DIR)/polyfills.js $(JS_SRC_DIR)/worker-headers.js $(JS_SRC_DIR)/color-dither-modes.js $(JS_SRC_DIR)/timer.js $(JS_SRC_DIR)/pixel.js $(DITHER_WORKER_DIR)/image.js $(DITHER_WORKER_DIR)/threshold.js $(DITHER_WORKER_DIR)/error-prop-dither.js $(JS_SRC_DIR)/bayer-matrix.js $(DITHER_WORKER_DIR)/ordered-dither.js $(DITHER_WORKER_DIR)/algorithm-model.js $(DITHER_WORKER_DIR)/worker-util.js $(DITHER_WORKER_DIR)/histogram.js $(DITHER_WORKER_DIR)/main.js
DITHER_WORKER_OUTPUT=$(JS_OUTPUT_DIR)/dither-worker.js


VUE_SRC=node_modules/vue/dist/vue.min.js
VUE_OUTPUT=$(JS_OUTPUT_DIR)/vue.min.js

CSS_OUTPUT_DIR=$(PUBLIC_HTML_DIR)/styles
CSS_OUTPUT=$(CSS_OUTPUT_DIR)/style.css


all: $(JS_OUTPUT) $(CSS_OUTPUT) $(VUE_OUTPUT) $(DITHER_WORKER_OUTPUT) $(HTML_INDEX)

$(PUBLIC_HTML_DIR):
	mkdir -p $(PUBLIC_HTML_DIR)

$(JS_OUTPUT_DIR):
	mkdir -p $(JS_OUTPUT_DIR)

$(CSS_OUTPUT_DIR):
	mkdir -p $(CSS_OUTPUT_DIR)

$(VUE_OUTPUT): $(VUE_SRC) $(JS_OUTPUT_DIR)
	cat $(VUE_SRC) > $(VUE_OUTPUT) 

$(JS_OUTPUT): $(JS_SRC) $(JS_OUTPUT_DIR)
	cat $(JS_SRC) > $(JS_OUTPUT)

$(DITHER_WORKER_OUTPUT): $(DITHER_WORKER_SRC) $(JS_OUTPUT_DIR)
	cat $(DITHER_WORKER_SRC) > $(DITHER_WORKER_OUTPUT)
	
$(CSS_OUTPUT): $(shell find ./sass -type f -name '*.scss') $(CSS_OUTPUT_DIR)
	sassc --style compressed sass/style.scss $(CSS_OUTPUT)


$(HTML_INDEX): $(shell find ./templates -type f -name '*.php') $(PUBLIC_HTML_DIR) config/config.php
	php templates/index.php > $(HTML_INDEX)
	
watch_js:
	while true; do \
        make $(JS_OUTPUT); \
        make $(DITHER_WORKER_OUTPUT); \
        inotifywait --quiet --recursive --event create --event modify --event move ./js_src/; \
    done