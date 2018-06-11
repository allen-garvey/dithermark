PHP_BUILD_MODE=debug

PUBLIC_HTML_DIR=public_html
HTML_INDEX=$(PUBLIC_HTML_DIR)/index.html

#js source files
JS_APP_SRC=$(shell find ./js_src/app -type f -name '*.js')
JS_WORKER_SRC=$(shell find ./js_src/image_dithering_worker -type f -name '*.js')
JS_SHARED_SRC=$(shell find ./js_src/shared -type f -name '*.js')

#php source
PHP_MODELS=$(shell find ./inc/models -type f -name '*.php')
PHP_VIEWS=$(shell find ./inc/views -type f -name '*.php')
PHP_CONFIG=inc/config.php

#JS source php builders
JS_APP_TEMPLATE=templates/app.js.php
JS_WORKER_TEMPLATE=templates/worker.js.php

#JS output files
JS_OUTPUT_DIR=$(PUBLIC_HTML_DIR)/js
JS_APP_OUTPUT=$(JS_OUTPUT_DIR)/app.js
JS_WORKER_OUTPUT=$(JS_OUTPUT_DIR)/worker.js
#JS release output files
JS_APP_OUTPUT_RELEASE=$(JS_OUTPUT_DIR)/app.min.js
JS_WORKER_OUTPUT_RELEASE=$(JS_OUTPUT_DIR)/worker.min.js

#VUE js files
VUE_SRC=node_modules/vue/dist/vue.min.js
VUE_OUTPUT=$(JS_OUTPUT_DIR)/vue.min.js

#vue color picker
VUE_COLOR_PICKER_DIR=./lib/dithermark-vue-color
VUE_COLOR_PICKER_COMPILED=$(VUE_COLOR_PICKER_DIR)/dist/vue-color.min.js

#css
SASS_SRC=$(shell find ./sass -type f -name '*.scss')
CSS_OUTPUT_DIR=$(PUBLIC_HTML_DIR)/styles
CSS_OUTPUT=$(CSS_OUTPUT_DIR)/style.css


all: $(JS_APP_OUTPUT) $(CSS_OUTPUT) $(VUE_OUTPUT) $(JS_WORKER_OUTPUT) $(HTML_INDEX)

install:
	npm install

#used when changing between PHP_BUILD_MODES
reset:
	rm -f $(JS_APP_OUTPUT)
	rm -f $(JS_WORKER_OUTPUT)
	rm $(HTML_INDEX)

#don't use variable with -rf, to guard against it becoming unset
clean: reset
	rm -r $(JS_APP_OUTPUT_RELEASE)
	rm -r $(JS_WORKER_OUTPUT_RELEASE)
	rm -rf ./public_html/styles

#target specific variable
release: PHP_BUILD_MODE=release
release: $(HTML_INDEX) $(VUE_OUTPUT) gulp_release
	rm -f $(JS_APP_OUTPUT)
	rm -f $(JS_WORKER_OUTPUT)

gulp_release: $(JS_APP_OUTPUT) $(JS_WORKER_OUTPUT) $(SASS_SRC)
	npm run gulp:release

unsplash_api:
	php scripts/unsplash-random-images.php > $(PUBLIC_HTML_DIR)/api/unsplash.json

$(VUE_OUTPUT): $(VUE_SRC) $(VUE_COLOR_PICKER_COMPILED)
	cat $(VUE_SRC) $(VUE_COLOR_PICKER_COMPILED) > $(VUE_OUTPUT) 

$(JS_APP_OUTPUT): $(JS_APP_SRC) $(JS_SHARED_SRC) $(PHP_CONFIG) $(PHP_MODELS) $(JS_APP_TEMPLATE)
	php $(JS_APP_TEMPLATE) $(PHP_BUILD_MODE) > $(JS_APP_OUTPUT)

$(JS_WORKER_OUTPUT): $(JS_WORKER_SRC) $(JS_SHARED_SRC) $(PHP_CONFIG) $(PHP_MODELS) $(JS_WORKER_TEMPLATE)
	php $(JS_WORKER_TEMPLATE) $(PHP_BUILD_MODE) > $(JS_WORKER_OUTPUT)
	
$(CSS_OUTPUT): $(SASS_SRC)
	npm run gulp

$(HTML_INDEX): $(shell find ./templates/index -type f -name '*.php') $(PHP_CONFIG) $(PHP_VIEWS)
	php templates/index/index.php $(PHP_BUILD_MODE) > $(HTML_INDEX)