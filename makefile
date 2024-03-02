PHP_BUILD_MODE=debug

# HTML
PUBLIC_HTML_DIR=public_html
HTML_INDEX=$(PUBLIC_HTML_DIR)/index.html

# Electron
ELECTRON_DIR=electron
ELECTRON_HTML_DIR=$(ELECTRON_DIR)/$(PUBLIC_HTML_DIR)
ELECTRON_HTML_INDEX=$(ELECTRON_HTML_DIR)/electron.html


#php source
PHP_TEMPLATES != find ./templates/index -type f -name '*.php'
PHP_CONFIG=inc/config.php
PHP_DITHER_ALGORITHM_MODEL=inc/models/algorithm-model.php
PHP_COLOR_QUANTIZATION_MODES=inc/models/color-quantization-modes.php


#JS generated modules
JS_GENERATED_SRC_DIR=js_generated
JS_GENERATED_OUTPUT_DIR=js_src/generated_output
JS_GENERATED_OUTPUT_APP_DIR=$(JS_GENERATED_OUTPUT_DIR)/app
JS_GENERATED_OUTPUT_WORKER_DIR=$(JS_GENERATED_OUTPUT_DIR)/worker

JS_GENERATED_APP_CONSTANTS_SRC=$(JS_GENERATED_SRC_DIR)/app/constants.js.php
JS_GENERATED_APP_CONSTANTS_OUTPUT=$(JS_GENERATED_OUTPUT_APP_DIR)/constants.js

JS_GENERATED_APP_ALGORITHM_MODEL_SRC=$(JS_GENERATED_SRC_DIR)/app/algorithm-model.js.php
JS_GENERATED_APP_ALGORITHM_MODEL_OUTPUT=$(JS_GENERATED_OUTPUT_APP_DIR)/algorithm-model.js

JS_GENERATED_APP_COLOR_QUANTIZATION_MODES_SRC=$(JS_GENERATED_SRC_DIR)/app/color-quantization-modes.js.php
JS_GENERATED_APP_COLOR_QUANTIZATION_MODES_OUTPUT=$(JS_GENERATED_OUTPUT_APP_DIR)/color-quantization-modes.js

JS_GENERATED_WORKER_ALGORITHM_MODEL_SRC=$(JS_GENERATED_SRC_DIR)/worker/algorithm-model.js.php
JS_GENERATED_WORKER_ALGORITHM_MODEL_OUTPUT=$(JS_GENERATED_OUTPUT_WORKER_DIR)/algorithm-model.js

JS_GENERATED_WORKER_COLOR_QUANTIZATION_MODES_SRC=$(JS_GENERATED_SRC_DIR)/worker/color-quantization-modes.js.php
JS_GENERATED_WORKER_COLOR_QUANTIZATION_MODES_OUTPUT=$(JS_GENERATED_OUTPUT_WORKER_DIR)/color-quantization-modes.js

#list of all generated js output files
JS_GENERATED_OUTPUT=$(JS_GENERATED_APP_CONSTANTS_OUTPUT) $(JS_GENERATED_APP_ALGORITHM_MODEL_OUTPUT) $(JS_GENERATED_APP_COLOR_QUANTIZATION_MODES_OUTPUT) $(JS_GENERATED_WORKER_ALGORITHM_MODEL_OUTPUT) $(JS_GENERATED_WORKER_COLOR_QUANTIZATION_MODES_OUTPUT)


# running webpack each time the recipe is run is technically inefficient,
# but it's the only way to not have make warnings without the dev and production css output file names being different
# also, we avoid the edge case where make won't trigger rebuild if packages in node_modules are updated by running webpack each time
all: $(JS_GENERATED_OUTPUT) $(HTML_INDEX)
	npm run build

setup:
	mkdir -p $(JS_GENERATED_OUTPUT_APP_DIR)
	mkdir -p $(JS_GENERATED_OUTPUT_WORKER_DIR)

install: setup
	npm install

electron: $(ELECTRON_HTML_INDEX)

#used when changing between PHP_BUILD_MODES
reset:
	rm -f $(HTML_INDEX)
	rm -f $(JS_GENERATED_OUTPUT)

#see comment for all: about running webpack each time recipe is called
release: PHP_BUILD_MODE=release
release: $(HTML_INDEX) $(JS_GENERATED_OUTPUT)
	npm run deploy
	rsync -av --exclude='*.php' --exclude='assets/bundle.js' --exclude='assets/js_src_worker_worker-main_js.bundle.js' $(PUBLIC_HTML_DIR) release

unsplash_api:
	php scripts/unsplash-random-images.php > $(PUBLIC_HTML_DIR)/api/unsplash.json

serverless:
	mkdir -p inc/serverless/build
	php inc/serverless/unsplash-download.php > inc/serverless/build/unsplash-download.php

###### PHP generated JS

$(JS_GENERATED_APP_CONSTANTS_OUTPUT): $(JS_GENERATED_APP_CONSTANTS_SRC) $(PHP_CONFIG)
	php $(JS_GENERATED_APP_CONSTANTS_SRC) $(PHP_BUILD_MODE) > $(JS_GENERATED_APP_CONSTANTS_OUTPUT)

$(JS_GENERATED_APP_ALGORITHM_MODEL_OUTPUT): $(JS_GENERATED_APP_ALGORITHM_MODEL_SRC) $(PHP_CONFIG) $(PHP_DITHER_ALGORITHM_MODEL)
	php $(JS_GENERATED_APP_ALGORITHM_MODEL_SRC) $(PHP_BUILD_MODE) > $(JS_GENERATED_APP_ALGORITHM_MODEL_OUTPUT)

$(JS_GENERATED_APP_COLOR_QUANTIZATION_MODES_OUTPUT): $(JS_GENERATED_APP_COLOR_QUANTIZATION_MODES_SRC) $(PHP_CONFIG) $(PHP_COLOR_QUANTIZATION_MODES)
	php $(JS_GENERATED_APP_COLOR_QUANTIZATION_MODES_SRC) $(PHP_BUILD_MODE) > $(JS_GENERATED_APP_COLOR_QUANTIZATION_MODES_OUTPUT)

$(JS_GENERATED_WORKER_ALGORITHM_MODEL_OUTPUT): $(JS_GENERATED_WORKER_ALGORITHM_MODEL_SRC) $(PHP_CONFIG) $(PHP_DITHER_ALGORITHM_MODEL)
	php $(JS_GENERATED_WORKER_ALGORITHM_MODEL_SRC) $(PHP_BUILD_MODE) > $(JS_GENERATED_WORKER_ALGORITHM_MODEL_OUTPUT)

$(JS_GENERATED_WORKER_COLOR_QUANTIZATION_MODES_OUTPUT): $(JS_GENERATED_WORKER_COLOR_QUANTIZATION_MODES_SRC) $(PHP_CONFIG) $(PHP_COLOR_QUANTIZATION_MODES)
	php $(JS_GENERATED_WORKER_COLOR_QUANTIZATION_MODES_SRC) $(PHP_BUILD_MODE) > $(JS_GENERATED_WORKER_COLOR_QUANTIZATION_MODES_OUTPUT)

####### HTML

$(HTML_INDEX): $(PHP_TEMPLATES) $(PHP_CONFIG)
	php templates/index/index.php $(PHP_BUILD_MODE) > $(HTML_INDEX)

$(ELECTRON_HTML_DIR): $(HTML_INDEX)
	cp -r $(PUBLIC_HTML_DIR) $(ELECTRON_HTML_DIR)

$(ELECTRON_HTML_INDEX): $(ELECTRON_HTML_DIR)
	sed 's|/assets/style.css|./assets/style.css|' $(HTML_INDEX) | sed 's|/assets/bundle.min.js|./assets/bundle.min.js|' > $(ELECTRON_HTML_INDEX)

