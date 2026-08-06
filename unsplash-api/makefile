all: deploy/unsplash-download-api deploy/unsplash-download-api-freebsd deploy/unsplash.json

deploy:
	mkdir -p deploy

deploy/unsplash.json: deploy ../deploy/public_html/api/unsplash.json
	cp ../deploy/public_html/api/unsplash.json deploy/unsplash.json

deploy/unsplash-download-api: deploy unsplash-download-api.go
	go build -o deploy/ unsplash-download-api.go

deploy/unsplash-download-api-freebsd: deploy unsplash-download-api.go
	env GOOS=freebsd GOARCH=amd64 go build -o deploy/unsplash-download-api-freebsd unsplash-download-api.go