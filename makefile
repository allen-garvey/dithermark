JS_SRC=js_src/app.js
JS_OUTPUT=public_html/js/app.js

CSS_OUTPUT = public_html/styles/style.css

all: $(JS_OUTPUT) $(CSS_OUTPUT)


$(JS_OUTPUT): $(JS_SRC)
	cat $(JS_SRC) > $(JS_OUTPUT)
	
$(CSS_OUTPUT): $(shell find ./sass -type f -name '*.scss')
	sassc --style compressed sass/style.scss $(CSS_OUTPUT)