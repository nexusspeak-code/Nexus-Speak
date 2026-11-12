package com.nexusspeak.app;

import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import org.json.JSONArray;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class TranslationHelper {
    private static final String TAG = "NexusTranslation";
    private static final ExecutorService executor = Executors.newSingleThreadExecutor();
    private static final Handler mainHandler = new Handler(Looper.getMainLooper());

    public interface TranslationCallback {
        void onSuccess(String translatedText);
        void onError(String error);
    }

    public static void translate(String text, String sourceLang, String targetLang, TranslationCallback callback) {
        if (text == null || text.trim().isEmpty()) {
            callback.onSuccess("");
            return;
        }

        // If source and target are the same, return as is
        if (sourceLang.equalsIgnoreCase(targetLang)) {
            callback.onSuccess(text);
            return;
        }

        executor.execute(() -> {
            String srcCode = cleanLanguageCode(sourceLang);
            String tgtCode = cleanLanguageCode(targetLang);
            String normalized = normalizeSpeech(text, srcCode);

            try {
                String encodedText = URLEncoder.encode(normalized, StandardCharsets.UTF_8.toString());

                // 1. Google Translate NMT Engine (dict-chrome-ex) - High accuracy & fast
                String chromeUrlStr = "https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl="
                        + srcCode + "&tl=" + tgtCode + "&q=" + encodedText;

                URL url1 = new URL(chromeUrlStr);
                HttpURLConnection conn1 = (HttpURLConnection) url1.openConnection();
                conn1.setRequestMethod("GET");
                conn1.setConnectTimeout(6000);
                conn1.setReadTimeout(6000);
                conn1.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");

                if (conn1.getResponseCode() == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn1.getInputStream(), StandardCharsets.UTF_8));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    JSONArray jsonArray = new JSONArray(response.toString());
                    if (jsonArray.length() > 0) {
                        String result = jsonArray.getString(0);
                        if (result != null && !result.trim().isEmpty()) {
                            mainHandler.post(() -> callback.onSuccess(result.trim()));
                            return;
                        }
                    }
                }
            } catch (Exception e1) {
                Log.w(TAG, "Chrome-ex translate failed, trying fallback: " + e1.getMessage());
            }

            // 2. Google Translate GTX Endpoint Fallback
            try {
                String encodedText = URLEncoder.encode(text, StandardCharsets.UTF_8.toString());
                String gtxUrlStr = "https://translate.googleapis.com/translate_a/single?client=gtx&sl="
                        + srcCode + "&tl=" + tgtCode + "&dt=t&q=" + encodedText;

                URL url2 = new URL(gtxUrlStr);
                HttpURLConnection conn2 = (HttpURLConnection) url2.openConnection();
                conn2.setRequestMethod("GET");
                conn2.setConnectTimeout(6000);
                conn2.setReadTimeout(6000);
                conn2.setRequestProperty("User-Agent", "Mozilla/5.0");

                if (conn2.getResponseCode() == 200) {
                    BufferedReader reader = new BufferedReader(new InputStreamReader(conn2.getInputStream(), StandardCharsets.UTF_8));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    JSONArray jsonArray = new JSONArray(response.toString());
                    JSONArray sentences = jsonArray.getJSONArray(0);
                    StringBuilder translated = new StringBuilder();
                    for (int i = 0; i < sentences.length(); i++) {
                        JSONArray sentence = sentences.getJSONArray(i);
                        translated.append(sentence.getString(0));
                    }

                    String result = translated.toString().trim();
                    if (!result.isEmpty()) {
                        mainHandler.post(() -> callback.onSuccess(result));
                        return;
                    }
                }
            } catch (Exception e2) {
                Log.e(TAG, "GTX translate failed", e2);
            }

            mainHandler.post(() -> callback.onError("Translation server busy. Kept original speech."));
        });
    }

    private static String normalizeSpeech(String text, String srcCode) {
        if (text == null) return "";
        if ("ta".equalsIgnoreCase(srcCode)) {
            String[][] replacements = {
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
                {"ரொம்ப தேங்க்ஸ்", "மிக்க நன்றி"}
            };
            for (String[] pair : replacements) {
                text = text.replace(pair[0], pair[1]);
            }
        }
        return text;
    }

    private static String cleanLanguageCode(String fullCode) {
        if (fullCode == null) return "en";
        String lower = fullCode.toLowerCase();
        if (lower.startsWith("ta")) return "ta";
        if (lower.startsWith("hi")) return "hi";
        if (lower.startsWith("te")) return "te";
        if (lower.startsWith("ml")) return "ml";
        if (lower.startsWith("en")) return "en";
        return lower.split("-")[0];
    }
}
