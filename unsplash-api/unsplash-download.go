package main

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"time"
)

type Response struct {
	StatusCode int         `json:"statusCode,omitempty"`
	Body       interface{} `json:"body"`
}

type ErrorBody struct {
	Errors string `json:"errors"`
}

type SuccessBody struct {
	Data bool `json:"data"`
}

// UnsplashPhoto represents a single entry in unsplash.json.
type UnsplashPhoto struct {
	URLs        UnsplashPhotoURLs `json:"urls"`
	Download    string            `json:"download"`
	Link        string            `json:"link"`
	Author      UnsplashAuthor    `json:"author"`
	Description string            `json:"description,omitempty"`
}

type UnsplashPhotoURLs struct {
	Regular string `json:"regular"`
	Small   string `json:"small"`
}

type UnsplashAuthor struct {
	Name string `json:"name"`
	Link string `json:"link"`
}

func loadUnsplashImageData(path string) ([]UnsplashPhoto, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var photos []UnsplashPhoto
	if err := json.Unmarshal(data, &photos); err != nil {
		return nil, err
	}

	return photos, nil
}

func getEnvOrDefault(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func logUnsplashAccess(photoLink, defaultLogDir string) error {
	logPath := filepath.Join(getEnvOrDefault("UNSPLASH_ACCESS_LOG_DIR", defaultLogDir), "unsplash_access.csv")

	f, err := os.OpenFile(logPath, os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
	if err != nil {
		return err
	}
	defer f.Close()

	w := csv.NewWriter(f)
	defer w.Flush()

	timestamp := time.Now().UTC().Format(time.RFC3339)
	if err := w.Write([]string{timestamp, photoLink}); err != nil {
		return err
	}

	return w.Error()
}

func handleUnsplashApiRequest(rawPhotoId string) Response {
	photoId, err := strconv.Atoi(rawPhotoId)
	if err != nil {
		return Response{
			StatusCode: 400,
			Body:       ErrorBody{Errors: "Invalid input argument"},
		}
	}

	exePath, err := os.Executable()
	if err != nil {
		fmt.Printf("Error getting executable path: %v\n", err)
		return Response{
			StatusCode: 500,
			Body:       ErrorBody{Errors: "Error getting executable path"},
		}
	}

	exeDir := filepath.Dir(exePath)

	unsplashImageData, err := loadUnsplashImageData(filepath.Join(exeDir, "unsplash.json"))
	if err != nil {
		return Response{
			StatusCode: 500,
			Body:       ErrorBody{Errors: "Problem reading unsplash image data"},
		}
	}

	if photoId < 0 || photoId >= len(unsplashImageData) {
		return Response{
			StatusCode: 400,
			Body:       ErrorBody{Errors: "Invalid input argument"},
		}
	}

	photo := unsplashImageData[photoId]
	unsplashDownloadUrl := fmt.Sprintf(
		"%s?client_id=%s",
		photo.Download,
		os.Getenv("UNSPLASH_ACCESS_KEY"),
	)

	resp, err := http.Get(unsplashDownloadUrl)
	if err != nil {
		return Response{
			StatusCode: 500,
			Body:       ErrorBody{Errors: "Problem contacting unsplash download url"},
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return Response{
			StatusCode: 500,
			Body:       ErrorBody{Errors: "Problem contacting unsplash download url"},
		}
	}

	if err := logUnsplashAccess(photo.Link, exeDir); err != nil {
		fmt.Fprintf(os.Stderr, "Problem logging unsplash access: %v\n", err)
	}

	return Response{
		Body: SuccessBody{Data: true},
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	photoIdStr := r.URL.Query().Get("photo_id")

	result := handleUnsplashApiRequest(photoIdStr)

	w.Header().Set("Content-Type", "application/json")
	if result.StatusCode != 0 {
		w.WriteHeader(result.StatusCode)
	}
	json.NewEncoder(w).Encode(result.Body)
}

func main() {
	port := "3001"
	if len(os.Args) > 1 {
		port = os.Args[1]
	}

	http.HandleFunc("/", handler)
	addr := ":" + port
	fmt.Printf("Listening on %s\n", addr)
	if err := http.ListenAndServe(addr, nil); err != nil {
		fmt.Println("Server error:", err)
		os.Exit(1)
	}
}
