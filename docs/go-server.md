# Go Static Server

There is a Go static server so that Dithermark can be run stand-alone on Windows, since Windows does not have any built in HTML static file servers.

## Dependencies

* go >= 1.22

## How to build

* For a debug build `go build -o deploy/ go-server/dithermark.go`
* To cross-compile for Windows `env GOOS=windows GOARCH=arm64 go build -o deploy/dithermark-arm64.exe go-server/dithermark.go && env GOOS=windows GOARCH=amd64 go build -o deploy/dithermark-x64.exe go-server/dithermark.go`