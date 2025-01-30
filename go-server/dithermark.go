package main

import (
	"encoding/json"
	"fmt"
	"net"
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
		fmt.Fprintf(os.Stderr, "Invalid config. Using default port: %d\n", defaultPort)
		return defaultPort
	}

	if config.Port < 0 {
		fmt.Fprintf(os.Stderr, "Port out of range. Using default port: %d\n", defaultPort)
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
	configName := "config.json"
	configPath := path.Join(filepath.Dir(executable), configName)

	port := getPort(configPath)
	http.Handle("/", http.FileServer(http.Dir(path.Join(filepath.Dir(executable), "public_html"))))

	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to listen on port %d. Try changing the port in %s\n", port, configName)
		os.Exit(1)
	}

	fmt.Printf("Dithermark server listening on http://localhost:%d\n", port)

	serverErr := http.Serve(listener, nil)

	if serverErr != nil {
		fmt.Fprintf(os.Stderr, "Unable to start the server. Error: %s", serverErr)
		os.Exit(1)
	}
}
