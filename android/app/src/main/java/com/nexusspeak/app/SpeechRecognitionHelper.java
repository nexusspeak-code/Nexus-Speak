package com.nexusspeak.app;

import android.content.Context;
import android.content.Intent;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.util.Log;

import java.util.ArrayList;

public class SpeechRecognitionHelper {
    private static final String TAG = "NexusSpeech";

    public interface SpeechCallback {
        void onSpeechStart();
        void onSpeechPartial(String partial);
        void onSpeechComplete(String finalText);
        void onSpeechError(String error);
        default void onRmsdBChanged(float rmsdB) {}
    }

    private final Context context;
    private SpeechRecognizer speechRecognizer;
    private boolean isListening = false;

    public SpeechRecognitionHelper(Context context) {
        this.context = context;
    }

    public boolean isAvailable() {
        return SpeechRecognizer.isRecognitionAvailable(context);
    }

    public void startListening(String languageCode, SpeechCallback callback) {
        stopListening();

        try {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context);
            Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, languageCode);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, languageCode);
            intent.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, languageCode);
            intent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3);

            speechRecognizer.setRecognitionListener(new RecognitionListener() {
                @Override
                public void onReadyForSpeech(Bundle params) {
                    isListening = true;
                    callback.onSpeechStart();
                }

                @Override
                public void onBeginningOfSpeech() {
                    Log.d(TAG, "Speech started");
                }

                @Override
                public void onRmsChanged(float rmsdB) {
                    callback.onRmsdBChanged(rmsdB);
                }

                @Override
                public void onBufferReceived(byte[] buffer) {
                }

                @Override
                public void onEndOfSpeech() {
                    isListening = false;
                }

                @Override
                public void onError(int error) {
                    isListening = false;
                    String message = getErrorMessage(error);
                    Log.e(TAG, "SpeechRecognizer error: " + message + " (code " + error + ")");
                    callback.onSpeechError(message);
                }

                @Override
                public void onResults(Bundle results) {
                    isListening = false;
                    ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        String recognized = matches.get(0);
                        callback.onSpeechComplete(recognized);
                    } else {
                        callback.onSpeechError("No voice detected. Please speak clearly.");
                    }
                }

                @Override
                public void onPartialResults(Bundle partialResults) {
                    ArrayList<String> matches = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    if (matches != null && !matches.isEmpty()) {
                        callback.onSpeechPartial(matches.get(0));
                    }
                }

                @Override
                public void onEvent(int eventType, Bundle params) {
                }
            });

            speechRecognizer.startListening(intent);
        } catch (Exception e) {
            isListening = false;
            Log.e(TAG, "Failed to start listening", e);
            callback.onSpeechError("Error: " + e.getMessage());
        }
    }

    public void stopListening() {
        if (speechRecognizer != null) {
            try {
                speechRecognizer.stopListening();
                speechRecognizer.cancel();
                speechRecognizer.destroy();
            } catch (Exception ignored) {
            }
            speechRecognizer = null;
        }
        isListening = false;
    }

    public boolean isCurrentlyListening() {
        return isListening;
    }

    private String getErrorMessage(int errorCode) {
        switch (errorCode) {
            case SpeechRecognizer.ERROR_AUDIO:
                return "Audio recording error";
            case SpeechRecognizer.ERROR_CLIENT:
                return "Client error. Check microphone permission.";
            case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                return "Microphone permission required";
            case SpeechRecognizer.ERROR_NETWORK:
            case SpeechRecognizer.ERROR_NETWORK_TIMEOUT:
                return "Network connection issue for voice typing";
            case SpeechRecognizer.ERROR_NO_MATCH:
                return "No speech detected. Please tap mic and try again.";
            case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                return "Recognizer is busy. Retrying...";
            case SpeechRecognizer.ERROR_SERVER:
                return "Voice recognition server error";
            case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                return "No speech heard within time limit";
            default:
                return "Voice recognition error (code " + errorCode + ")";
        }
    }
}
