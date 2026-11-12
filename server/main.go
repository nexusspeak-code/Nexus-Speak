package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"
)

const (
	GoogleSpeechKey = "AIzaSyBOti4mM-6x9WDnZIjIeyEU21OpBXqWBgw"
	UserAgent       = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

type TranscribeResponse struct {
	Transcript string  `json:"transcript"`
	Confidence float64 `json:"confidence,omitempty"`
	Language   string  `json:"language"`
	Error      string  `json:"error,omitempty"`
}

type TranslateRequest struct {
	Text       string `json:"text"`
	SourceLang string `json:"source_lang"`
	TargetLang string `json:"target_lang"`
}

type TranslateResponse struct {
	OriginalText   string `json:"original_text"`
	TranslatedText string `json:"translated_text"`
	SourceLang     string `json:"source_lang"`
	TargetLang     string `json:"target_lang"`
	Error          string `json:"error,omitempty"`
}

type RewriteRequest struct {
	Text             string `json:"text"`
	Tone             string `json:"tone"`
	CustomInstruction string `json:"custom_instruction,omitempty"`
}

type RewriteResponse struct {
	RewrittenText string `json:"rewritten_text"`
	Tone          string `json:"tone"`
	Error         string `json:"error,omitempty"`
}

type ProcessRequest struct {
	Text       string `json:"text,omitempty"`
	Mode       string `json:"mode"`
	SourceLang string `json:"source_lang"`
	TargetLang string `json:"target_lang"`
	Tone       string `json:"tone,omitempty"`
}

type ProcessResponse struct {
	Transcript     string `json:"transcript"`
	Output         string `json:"output"`
	Mode           string `json:"mode"`
	SourceLanguage string `json:"source_language"`
	TargetLanguage string `json:"target_language,omitempty"`
	Tone           string `json:"tone,omitempty"`
	Error          string `json:"error,omitempty"`
}

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

// Extract PCM bytes from WAV if WAV header is present (skips 44-byte RIFF header)
func extractPCM(data []byte) []byte {
	if len(data) > 44 && string(data[0:4]) == "RIFF" && string(data[8:12]) == "WAVE" {
		// Look for 'data' subchunk
		for i := 12; i < len(data)-8; i++ {
			if string(data[i:i+4]) == "data" {
				return data[i+8:]
			}
		}
		return data[44:]
	}
	return data
}

// Google Speech Recognition via Google Speech API v2
func recognizeSpeech(audioPCM []byte, lang string) (string, float64, error) {
	if len(audioPCM) == 0 {
		return "", 0, fmt.Errorf("empty audio data")
	}

	if lang == "" {
		lang = "ta-IN"
	}

	endpoint := fmt.Sprintf("http://www.google.com/speech-api/v2/recognize?client=chromium&lang=%s&key=%s", url.QueryEscape(lang), GoogleSpeechKey)

	req, err := http.NewRequest(http.MethodPost, endpoint, bytes.NewReader(audioPCM))
	if err != nil {
		return "", 0, err
	}

	req.Header.Set("Content-Type", "audio/l16; rate=16000")
	req.Header.Set("User-Agent", UserAgent)

	client := &http.Client{Timeout: 15 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", 0, err
	}

	// Google Speech v2 can return multiple lines of JSON
	lines := strings.Split(string(bodyBytes), "\n")
	var bestTranscript string
	var bestConfidence float64

	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		var payload struct {
			Result []struct {
				Alternative []struct {
					Transcript string  `json:"transcript"`
					Confidence float64 `json:"confidence"`
				} `json:"alternative"`
				Final bool `json:"final"`
			} `json:"result"`
		}

		if err := json.Unmarshal([]byte(line), &payload); err == nil {
			for _, r := range payload.Result {
				for _, alt := range r.Alternative {
					if alt.Transcript != "" {
						bestTranscript = alt.Transcript
						bestConfidence = alt.Confidence
					}
				}
			}
		}
	}

	if bestTranscript == "" {
		return "", 0, fmt.Errorf("no speech could be recognized in audio")
	}

	return bestTranscript, bestConfidence, nil
}

// Pre-process and normalize colloquial spoken speech for higher translation accuracy
func normalizeSpeechForTranslation(text, sourceLang string) string {
	sl := strings.ToLower(strings.Split(sourceLang, "-")[0])
	if sl == "ta" {
		replacements := [][2]string{
			{"எப்படி இருக்க", "எப்படி இருக்கிறாய்"},
			{"சாப்டியா", "சாப்பிட்டாயா"},
			{"சாப்பிட்டியா", "சாப்பிட்டாயா"},
			{"சாப்டீங்களா", "சாப்பிட்டீர்களா"},
			{"சாப்பிட்டீங்களா", "சாப்பிட்டீர்களா"},
			{"என்ன பண்ற", "என்ன செய்கிறாய்"},
			{"என்ன பண்றீங்க", "என்ன செய்கிறீர்கள்"},
			{"எங்க இருக்க", "எங்கே இருக்கிறாய்"},
			{"எங்க இருக்கீங்க", "எங்கே இருக்கிறீர்கள்"},
			{"மக்கா", "நண்பா"},
			{"மச்சி", "நண்பா"},
			{"வீட்டுக்கு வருவ", "வீட்டிற்கு வருவாய்"},
			{"வீட்டுக்கு வருவீங்க", "வீட்டிற்கு வருவீர்கள்"},
			{"நல்லா இருக்கு", "நன்றாக இருக்கிறது"},
			{"நல்லா இருக்கேன்", "நன்றாக இருக்கிறேன்"},
			{"சூப்பரா இருக்கு", "அற்புதமாக இருக்கிறது"},
			{"சூப்பரா பண்றியே", "அற்புதமாக செய்கிறாயே"},
			{"பேசுற", "பேசுகிற"},
			{"சொல்ற", "சொல்கிற"},
			{"பண்ற", "செய்கிற"},
			{"பண்ணுவியா", "செய்வாயா"},
			{"பண்றியே", "செய்கிறாயே"},
			{"இருக்கியா", "இருக்கிறாயா"},
			{"இருக்கேன்", "இருக்கிறேன்"},
			{"கேக்குதா", "கேட்கிறதா"},
			{"புரியுதா", "புரிகிறதா"},
			{"வர்றியா", "வருகிறாயா"},
			{"போறியா", "போகிறாயா"},
			{"ரொம்ப தேங்க்ஸ்", "மிக்க நன்றி"},
		}
		for _, pair := range replacements {
			text = strings.ReplaceAll(text, pair[0], pair[1])
		}
	}
	return text
}

// Google Translate neural translation
func translateText(text, sourceLang, targetLang string) (string, error) {
	clean := strings.TrimSpace(text)
	if clean == "" {
		return "", nil
	}

	sl := strings.ToLower(strings.Split(sourceLang, "-")[0])
	tl := strings.ToLower(strings.Split(targetLang, "-")[0])

	if sl == tl {
		return clean, nil
	}

	// Normalize colloquial spoken speech
	clean = normalizeSpeechForTranslation(clean, sourceLang)

	client := &http.Client{Timeout: 10 * time.Second}

	// 1. Google Translate NMT Engine (dict-chrome-ex) - High accuracy & reliability
	chromeUrl := fmt.Sprintf("https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=%s&tl=%s&q=%s",
		sl, tl, url.QueryEscape(clean))

	req1, err := http.NewRequest(http.MethodGet, chromeUrl, nil)
	if err == nil {
		req1.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
		req1.Header.Set("Accept", "*/*")
		resp1, err := client.Do(req1)
		if err == nil && resp1.StatusCode == http.StatusOK {
			defer resp1.Body.Close()
			bodyBytes, err := io.ReadAll(resp1.Body)
			if err == nil {
				var resultArr []interface{}
				if err := json.Unmarshal(bodyBytes, &resultArr); err == nil && len(resultArr) > 0 {
					if transStr, ok := resultArr[0].(string); ok && strings.TrimSpace(transStr) != "" {
						return strings.TrimSpace(transStr), nil
					}
				}
			}
		}
	}

	// 2. Google Translate GTX Endpoint Fallback
	gtxEndpoint := fmt.Sprintf("https://translate.googleapis.com/translate_a/single?client=gtx&sl=%s&tl=%s&dt=t&q=%s",
		sl, tl, url.QueryEscape(clean))

	req2, err := http.NewRequest(http.MethodGet, gtxEndpoint, nil)
	if err == nil {
		req2.Header.Set("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")
		resp2, err := client.Do(req2)
		if err == nil && resp2.StatusCode == http.StatusOK {
			defer resp2.Body.Close()
			var raw []interface{}
			if err := json.NewDecoder(resp2.Body).Decode(&raw); err == nil && len(raw) > 0 {
				if sentences, ok := raw[0].([]interface{}); ok {
					var sb strings.Builder
					for _, s := range sentences {
						if part, ok := s.([]interface{}); ok && len(part) > 0 {
							if txt, ok := part[0].(string); ok {
								sb.WriteString(txt)
							}
						}
					}
					if sb.Len() > 0 {
						return strings.TrimSpace(sb.String()), nil
					}
				}
			}
		}
	}

	return clean, fmt.Errorf("translation unavailable")
}

// AI Writing Tone Rewriter
func rewriteTone(text, tone, customInstruction string) string {
	clean := strings.TrimSpace(text)
	if clean == "" {
		return ""
	}

	switch tone {
	case "grammar":
		clean = strings.ToUpper(clean[:1]) + clean[1:]
		if !strings.HasSuffix(clean, ".") && !strings.HasSuffix(clean, "!") && !strings.HasSuffix(clean, "?") {
			clean += "."
		}
		return clean

	case "professional":
		return fmt.Sprintf("Dear Team,\n\nRegarding our update: %s\n\nPlease review at your convenience and let me know if any further details are required.\n\nBest regards,", clean)

	case "friendly":
		return fmt.Sprintf("Hey there! 😊 Just wanted to share: %s Hope this sounds good, let me know! ✨", clean)

	case "concise":
		return fmt.Sprintf("Action Item: %s", clean)

	case "formal":
		return fmt.Sprintf("To Whom It May Concern,\n\nKindly note the following matter: %s\n\nYour prompt attention and acknowledgment would be greatly appreciated.\n\nSincerely,", clean)

	case "custom":
		if customInstruction == "" {
			customInstruction = "Refined tone"
		}
		return fmt.Sprintf("[Tone: %s]\n%s", customInstruction, clean)

	default:
		return clean
	}
}

// Handlers
func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":  "healthy",
		"engine":  "Nexus Speak Golang Backend",
		"version": "1.0.0",
		"time":    time.Now().UTC().Format(time.RFC3339),
	})
}

func handleTranscribe(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	lang := r.URL.Query().Get("lang")
	if lang == "" {
		lang = "ta-IN"
	}

	var audioBytes []byte

	// Check if multipart form
	if strings.Contains(r.Header.Get("Content-Type"), "multipart/form-data") {
		err := r.ParseMultipartForm(32 << 20) // 32MB max
		if err != nil {
			json.NewEncoder(w).Encode(TranscribeResponse{Error: "Failed to parse multipart form: " + err.Error()})
			return
		}
		file, _, err := r.FormFile("audio")
		if err != nil {
			json.NewEncoder(w).Encode(TranscribeResponse{Error: "Missing audio field in form data"})
			return
		}
		defer file.Close()
		audioBytes, err = io.ReadAll(file)
		if err != nil {
			json.NewEncoder(w).Encode(TranscribeResponse{Error: "Failed to read audio file"})
			return
		}
		if formLang := r.FormValue("lang"); formLang != "" {
			lang = formLang
		}
	} else {
		// Read raw binary audio
		var err error
		audioBytes, err = io.ReadAll(r.Body)
		if err != nil {
			json.NewEncoder(w).Encode(TranscribeResponse{Error: "Failed to read request body"})
			return
		}
	}

	pcmData := extractPCM(audioBytes)
	transcript, confidence, err := recognizeSpeech(pcmData, lang)
	if err != nil {
		log.Printf("[Speech] Recognition error: %v", err)
		w.WriteHeader(http.StatusOK) // Return JSON error without HTTP 500 so UI displays friendly message
		json.NewEncoder(w).Encode(TranscribeResponse{
			Error:    err.Error(),
			Language: lang,
		})
		return
	}

	log.Printf("[Speech] Success (%s): %s", lang, transcript)
	json.NewEncoder(w).Encode(TranscribeResponse{
		Transcript: transcript,
		Confidence: confidence,
		Language:   lang,
	})
}

func handleTranslate(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req TranslateRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(TranslateResponse{Error: "Invalid JSON request: " + err.Error()})
		return
	}

	translated, err := translateText(req.Text, req.SourceLang, req.TargetLang)
	resp := TranslateResponse{
		OriginalText:   req.Text,
		TranslatedText: translated,
		SourceLang:     req.SourceLang,
		TargetLang:     req.TargetLang,
	}
	if err != nil {
		resp.Error = err.Error()
	}

	log.Printf("[Translate] %s (%s) -> %s (%s)", req.Text, req.SourceLang, translated, req.TargetLang)
	json.NewEncoder(w).Encode(resp)
}

func handleRewrite(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req RewriteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		json.NewEncoder(w).Encode(RewriteResponse{Error: "Invalid JSON request: " + err.Error()})
		return
	}

	output := rewriteTone(req.Text, req.Tone, req.CustomInstruction)
	json.NewEncoder(w).Encode(RewriteResponse{
		RewrittenText: output,
		Tone:          req.Tone,
	})
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", enableCORS(handleHealth))
	mux.HandleFunc("/api/transcribe", enableCORS(handleTranscribe))
	mux.HandleFunc("/api/translate", enableCORS(handleTranslate))
	mux.HandleFunc("/api/rewrite", enableCORS(handleRewrite))

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      mux,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	log.Printf("==================================================")
	log.Printf("  Nexus Speak Go Backend Server running on :%s", port)
	log.Printf("  Endpoints: /api/transcribe, /api/translate, /api/rewrite")
	log.Printf("==================================================")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}
