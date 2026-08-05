all: deploy/unsplash_api deploy/unsplash.json

deploy:
	mkdir -p deploy

deploy/unsplash.json: deploy ../deploy/public_html/api/unsplash.json
	cp ../deploy/public_html/api/unsplash.json deploy/unsplash.json

deploy/unsplash_api: deploy unsplash-download.go
	go build -o deploy/ unsplash-download.go