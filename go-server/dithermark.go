package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path"
	"path/filepath"
)

type Config struct {
	Port int `json:"port"`
}

func getPort(configPath string) int {
	defaultPort := 8800

	file, err := os.ReadFile(configPath)
	if err != nil {
		return defaultPort
	}

	var config Config
	err = json.Unmarshal(file, &config)
	if err != nil {
		fmt.Println(err)
		return defaultPort
	}

	if config.Port < 0 {
		return defaultPort
	}

	return config.Port
}

func main() {
	executable, err := os.Executable()
	if err != nil {
		fmt.Println(err)
		panic(err)
	}
	configPath := path.Join(filepath.Dir(executable), "config.json")

	port := getPort(configPath)
	http.Handle("/", http.FileServer(http.Dir(path.Join(filepath.Dir(executable), "public_html"))))

	fmt.Printf("Dithermark server listening on http://localhost:%d\n", port)
	http.ListenAndServe(fmt.Sprintf(":%d", port), nil)
}
