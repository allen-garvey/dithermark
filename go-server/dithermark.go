package main

import (
	"net/http"
)

func main() {
	http.Handle("/", http.FileServer(http.Dir("./public_html")))
	http.ListenAndServe(":8080", nil)
}
