# HTML
PUBLIC_HTML_DIR=public_html
HTML_INDEX=$(PUBLIC_HTML_DIR)/index.html

# Electron
ELECTRON_DIR=electron
ELECTRON_HTML_DIR=$(ELECTRON_DIR)/$(PUBLIC_HTML_DIR)
ELECTRON_HTML_INDEX=$(ELECTRON_HTML_DIR)/electron.html


#php source
PHP_CONFIG=inc/config.php
PHP_DITHER_ALGORITHM_MODEL=inc/models/algorithm-model.php


#JS generated modules
JS_GENERATED_SRC_DIR=js_generated
JS_GENERATED_OUTPUT_DIR=js_src/generated_output
JS_GENERATED_OUTPUT_WORKER_DIR=$(JS_GENERATED_OUTPUT_DIR)/worker

JS_GENERATED_WORKER_ALGORITHM_MODEL_OUTPUT=$(JS_GENERATED_OUTPUT_WORKER_DIR)/algorithm-model.js

#list of all generated js output files
JS_GENERATED_OUTPUT= $(JS_GENERATED_WORKER_ALGORITHM_MODEL_OUTPUT)


# running webpack each time the recipe is run is technically inefficient,
# but it's the only way to not have make warnings without the dev and production css output file names being different
# also, we avoid the edge case where make won't trigger rebuild if packages in node_modules are updated by running webpack each time
all: $(JS_GENERATED_OUTPUT)
	npm run build

setup:
	mkdir -p $(JS_GENERATED_OUTPUT_WORKER_DIR)

install: setup
	npm install

electron: $(ELECTRON_HTML_INDEX)

reset:
	rm -f $(JS_GENERATED_OUTPUT)

#see comment for all: about running webpack each time recipe is called
release: $(JS_GENERATED_OUTPUT)
	npm run deploy

###### PHP generated JS

$(JS_GENERATED_WORKER_ALGORITHM_MODEL_OUTPUT): $(JS_GENERATED_WORKER_ALGORITHM_MODEL_SRC) $(PHP_CONFIG) $(PHP_DITHER_ALGORITHM_MODEL)
	php $(JS_GENERATED_WORKER_ALGORITHM_MODEL_SRC) > $(JS_GENERATED_WORKER_ALGORITHM_MODEL_OUTPUT)

####### HTML

$(ELECTRON_HTML_DIR): $(HTML_INDEX)
	cp -r $(PUBLIC_HTML_DIR) $(ELECTRON_HTML_DIR)

$(ELECTRON_HTML_INDEX): $(ELECTRON_HTML_DIR)
	sed 's|/assets/style.css|./assets/style.css|' $(HTML_INDEX) | sed 's|/assets/bundle.min.js|./assets/bundle.min.js|' > $(ELECTRON_HTML_INDEX)

