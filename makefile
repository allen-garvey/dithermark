# HTML
PUBLIC_HTML_DIR=public_html
HTML_INDEX=$(PUBLIC_HTML_DIR)/index.html

# Electron
ELECTRON_DIR=electron
ELECTRON_HTML_DIR=$(ELECTRON_DIR)/$(PUBLIC_HTML_DIR)
ELECTRON_HTML_INDEX=$(ELECTRON_HTML_DIR)/electron.html

.PHONY: electron

electron:
	npm run deploy
	cp -r $(PUBLIC_HTML_DIR) $(ELECTRON_HTML_DIR)
	sed 's|/assets/style.css|./assets/style.css|' $(HTML_INDEX) | sed 's|/assets/app.js|./assets/app.js|' > $(ELECTRON_HTML_INDEX)


