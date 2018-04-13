PUBLIC_HTML_DIR=public_html
HTML_INDEX=$(PUBLIC_HTML_DIR)/index.html

JS_APP_SRC=$(shell find ./js_src/app -type f -name '*.js')
JS_WORKER_SRC=$(shell find ./js_src/image_dithering_worker -type f -name '*.js')
JS_SHARED_SRC=$(shell find ./js_src/shared -type f -name '*.js')

PHP_MODELS=$(shell find ./inc/models -type f -name '*.php')
PHP_VIEWS=$(shell find ./inc/views -type f -name '*.php')
PHP_CONFIG=inc/config.php

JS_APP_TEMPLATE=templates/app.js.php
JS_WORKER_TEMPLATE=templates/worker.js.php

JS_OUTPUT_DIR=$(PUBLIC_HTML_DIR)/js
JS_APP_OUTPUT=$(JS_OUTPUT_DIR)/app.js
JS_WORKER_OUTPUT=$(JS_OUTPUT_DIR)/dither-worker.js


VUE_SRC=node_modules/vue/dist/vue.min.js
VUE_OUTPUT=$(JS_OUTPUT_DIR)/vue.min.js

CSS_OUTPUT_DIR=$(PUBLIC_HTML_DIR)/styles
CSS_OUTPUT=$(CSS_OUTPUT_DIR)/style.css


all: $(JS_APP_OUTPUT) $(CSS_OUTPUT) $(VUE_OUTPUT) $(JS_WORKER_OUTPUT) $(HTML_INDEX)

install: $(PUBLIC_HTML_DIR) $(JS_OUTPUT_DIR)
	npm install

#don't use PUBLIC_HTML_DIR variable, to guard against it becoming unset
clean:
	rm -rf ./public_html

$(PUBLIC_HTML_DIR):
	mkdir -p $(PUBLIC_HTML_DIR)

$(JS_OUTPUT_DIR):
	mkdir -p $(JS_OUTPUT_DIR)

$(VUE_OUTPUT): $(VUE_SRC)
	cat $(VUE_SRC) > $(VUE_OUTPUT) 

$(JS_APP_OUTPUT): $(JS_APP_SRC) $(JS_SHARED_SRC) $(PHP_CONFIG) $(PHP_MODELS) $(JS_APP_TEMPLATE)
	php $(JS_APP_TEMPLATE) > $(JS_APP_OUTPUT)

$(JS_WORKER_OUTPUT): $(JS_WORKER_SRC) $(JS_SHARED_SRC) $(PHP_CONFIG) $(PHP_MODELS) $(JS_WORKER_TEMPLATE)
	php $(JS_WORKER_TEMPLATE) > $(JS_WORKER_OUTPUT)
	
$(CSS_OUTPUT): $(shell find ./sass -type f -name '*.scss')
	npm run gulp

$(HTML_INDEX): $(shell find ./templates/index -type f -name '*.php') $(PHP_CONFIG) $(PHP_VIEWS)
	php templates/index/index.php > $(HTML_INDEX)
	
watch_js:
	while true; do \
        make $(JS_OUTPUT); \
        make $(DITHER_WORKER_OUTPUT); \
        inotifywait --quiet --recursive --event create --event modify --event move ./js_src/; \
    done