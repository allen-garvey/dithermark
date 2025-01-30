package main

import (
	"fmt"
	"net/http"
	"os"
	"path"
	"path/filepath"
)

func main() {
	executable, err := os.Executable()
	if err != nil {
		panic(err)
	}
	port := 8800
	http.Handle("/", http.FileServer(http.Dir(path.Join(filepath.Dir(executable), "public_html"))))

	fmt.Printf("Dithermark server listening on http://localhost:%d\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
}
