package com.nexusspeak.app;

import android.animation.ValueAnimator;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.ClipData;
import android.content.ClipboardManager;
import android.content.Context;
import android.content.Intent;
import android.graphics.PixelFormat;
import android.graphics.Point;
import android.os.Build;
import android.os.IBinder;
import android.os.Vibrator;
import android.view.Display;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.MotionEvent;
import android.view.View;
import android.view.WindowManager;
import android.view.animation.OvershootInterpolator;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.core.app.NotificationCompat;

public class FloatingVoiceService extends Service {
    private static final String CHANNEL_ID = "nexus_floating_service_channel";
    private static final int NOTIFICATION_ID = 1001;

    private WindowManager windowManager;
    private View bubbleView;
    private View widgetView;
    private WindowManager.LayoutParams bubbleParams;
    private WindowManager.LayoutParams widgetParams;

    private SpeechRecognitionHelper speechHelper;
    private ClipboardManager clipboardManager;
    private Vibrator vibrator;

    private int screenWidth = 1080;
    private int screenHeight = 1920;

    // Supported Languages
    private int currentLangIndex = 0;
    private final String[] langLabels = {
            "🇮🇳 தமிழ் (Tamil) ➔ 🇬🇧 English",
            "🇬🇧 English ➔ 🇮🇳 தமிழ் (Tamil)",
            "🇮🇳 हिंदी (Hindi) ➔ 🇬🇧 English",
            "🇮🇳 తెలుగు (Telugu) ➔ 🇬🇧 English",
            "🇮🇳 മലയാളം (Malayalam) ➔ 🇬🇧 English"
    };
    private final String[] sourceCodes = {"ta-IN", "en-IN", "hi-IN", "te-IN", "ml-IN"};
    private final String[] targetCodes = {"en", "ta", "en", "en", "en"};

    // Widget UI elements
    private TextView tvStatus;
    private TextView tvSpoken;
    private TextView tvTranslated;
    private TextView tvSourceLabel;
    private TextView tvTargetLabel;
    private FrameLayout btnMic;
    private ImageView imgMicIcon;
    private View[] waveBars;

    private String rawTranslatedText = "";
    private String currentTone = "natural";

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, createNotification());

        windowManager = (WindowManager) getSystemService(WINDOW_SERVICE);
        clipboardManager = (ClipboardManager) getSystemService(CLIPBOARD_SERVICE);
        vibrator = (Vibrator) getSystemService(VIBRATOR_SERVICE);
        speechHelper = new SpeechRecognitionHelper(this);

        updateScreenDimensions();
        initBubbleView();
        initWidgetView();
    }

    private void updateScreenDimensions() {
        if (windowManager != null) {
            Display display = windowManager.getDefaultDisplay();
            Point size = new Point();
            display.getSize(size);
            screenWidth = size.x;
            screenHeight = size.y;
        }
    }

    private void initBubbleView() {
        LayoutInflater inflater = LayoutInflater.from(this);
        bubbleView = inflater.inflate(R.layout.layout_floating_bubble, null);

        int layoutFlag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;

        bubbleParams = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE,
                PixelFormat.TRANSLUCENT
        );

        bubbleParams.gravity = Gravity.TOP | Gravity.START;
        bubbleParams.x = 20;
        bubbleParams.y = screenHeight / 3;

        // Superflow-style draggable bubble with Edge Snapping!
        bubbleView.setOnTouchListener(new View.OnTouchListener() {
            private int initialX, initialY;
            private float initialTouchX, initialTouchY;
            private static final int CLICK_THRESHOLD = 15;

            @Override
            public boolean onTouch(View v, MotionEvent event) {
                switch (event.getAction()) {
                    case MotionEvent.ACTION_DOWN:
                        initialX = bubbleParams.x;
                        initialY = bubbleParams.y;
                        initialTouchX = event.getRawX();
                        initialTouchY = event.getRawY();
                        return true;

                    case MotionEvent.ACTION_MOVE:
                        bubbleParams.x = initialX + (int) (event.getRawX() - initialTouchX);
                        bubbleParams.y = initialY + (int) (event.getRawY() - initialTouchY);
                        windowManager.updateViewLayout(bubbleView, bubbleParams);
                        return true;

                    case MotionEvent.ACTION_UP:
                        float diffX = Math.abs(event.getRawX() - initialTouchX);
                        float diffY = Math.abs(event.getRawY() - initialTouchY);
                        if (diffX < CLICK_THRESHOLD && diffY < CLICK_THRESHOLD) {
                            showWidgetView();
                        } else {
                            // Snap to nearest edge (Superflow feature)
                            snapBubbleToEdge();
                        }
                        return true;
                }
                return false;
            }
        });

        windowManager.addView(bubbleView, bubbleParams);
    }

    private void snapBubbleToEdge() {
        int bubbleWidth = bubbleView.getWidth();
        int targetX = (bubbleParams.x + bubbleWidth / 2 < screenWidth / 2) ? 15 : screenWidth - bubbleWidth - 15;

        ValueAnimator animator = ValueAnimator.ofInt(bubbleParams.x, targetX);
        animator.setDuration(220);
        animator.setInterpolator(new OvershootInterpolator(1.2f));
        animator.addUpdateListener(animation -> {
            bubbleParams.x = (int) animation.getAnimatedValue();
            if (bubbleView != null && bubbleView.getWindowToken() != null) {
                windowManager.updateViewLayout(bubbleView, bubbleParams);
            }
        });
        animator.start();
    }

    private void initWidgetView() {
        LayoutInflater inflater = LayoutInflater.from(this);
        widgetView = inflater.inflate(R.layout.layout_floating_widget, null);

        int layoutFlag = Build.VERSION.SDK_INT >= Build.VERSION_CODES.O
                ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
                : WindowManager.LayoutParams.TYPE_PHONE;

        widgetParams = new WindowManager.LayoutParams(
                WindowManager.LayoutParams.WRAP_CONTENT,
                WindowManager.LayoutParams.WRAP_CONTENT,
                layoutFlag,
                WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSLUCENT
        );

        widgetParams.gravity = Gravity.CENTER;

        // UI elements
        tvStatus = widgetView.findViewById(R.id.tv_widget_status);
        tvSpoken = widgetView.findViewById(R.id.tv_spoken_text);
        tvTranslated = widgetView.findViewById(R.id.tv_translated_text);
        tvSourceLabel = widgetView.findViewById(R.id.tv_source_lang_label);
        tvTargetLabel = widgetView.findViewById(R.id.tv_target_lang_label);
        btnMic = widgetView.findViewById(R.id.btn_floating_mic);
        imgMicIcon = widgetView.findViewById(R.id.img_widget_mic_icon);

        // Waveform bars
        waveBars = new View[]{
                widgetView.findViewById(R.id.wave_bar_1),
                widgetView.findViewById(R.id.wave_bar_2),
                widgetView.findViewById(R.id.wave_bar_3),
                widgetView.findViewById(R.id.wave_bar_4),
                widgetView.findViewById(R.id.wave_bar_5),
                widgetView.findViewById(R.id.wave_bar_6),
                widgetView.findViewById(R.id.wave_bar_7)
        };

        ImageButton btnMinimize = widgetView.findViewById(R.id.btn_minimize);
        ImageButton btnShare = widgetView.findViewById(R.id.btn_share_whatsapp);
        Button btnCopy = widgetView.findViewById(R.id.btn_copy_translation);
        Button btnClear = widgetView.findViewById(R.id.btn_clear_text);
        LinearLayout layoutLang = widgetView.findViewById(R.id.layout_lang_capsule);

        // Tone chips
        TextView chipNatural = widgetView.findViewById(R.id.chip_tone_natural);
        TextView chipFormal = widgetView.findViewById(R.id.chip_tone_formal);
        TextView chipConcise = widgetView.findViewById(R.id.chip_tone_concise);

        // Language switcher toggle
        updateLangLabels();
        layoutLang.setOnClickListener(v -> {
            currentLangIndex = (currentLangIndex + 1) % langLabels.length;
            updateLangLabels();
            vibratePhone(25);
            Toast.makeText(this, "Language: " + langLabels[currentLangIndex], Toast.LENGTH_SHORT).show();
        });

        // Tone Selector
        chipNatural.setOnClickListener(v -> setTone("natural", chipNatural, chipFormal, chipConcise));
        chipFormal.setOnClickListener(v -> setTone("formal", chipFormal, chipNatural, chipConcise));
        chipConcise.setOnClickListener(v -> setTone("concise", chipConcise, chipNatural, chipFormal));

        // Mic Button
        btnMic.setOnClickListener(v -> toggleListening());

        // Copy Button (Copies & Auto-Minimizes so WhatsApp is immediately open)
        btnCopy.setOnClickListener(v -> {
            String textToCopy = tvTranslated.getText().toString();
            if (textToCopy.isEmpty() || textToCopy.startsWith("Translated English")) {
                textToCopy = tvSpoken.getText().toString();
            }

            if (!textToCopy.isEmpty() && !textToCopy.startsWith("Speak now")) {
                copyToClipboard(textToCopy);
                vibratePhone(40);
                Toast.makeText(FloatingVoiceService.this, "✓ Copied! Paste into WhatsApp", Toast.LENGTH_SHORT).show();
                hideWidgetView();
            } else {
                Toast.makeText(FloatingVoiceService.this, "Please speak something first", Toast.LENGTH_SHORT).show();
            }
        });

        // Share to WhatsApp Button
        btnShare.setOnClickListener(v -> {
            String textToShare = tvTranslated.getText().toString();
            if (!textToShare.isEmpty() && !textToShare.startsWith("Translated English")) {
                shareToWhatsApp(textToShare);
            } else {
                Toast.makeText(FloatingVoiceService.this, "Speak a message before sharing", Toast.LENGTH_SHORT).show();
            }
        });

        // Retry / Clear Button
        btnClear.setOnClickListener(v -> {
            rawTranslatedText = "";
            tvSpoken.setText("Speak now to see real-time transcription...");
            tvTranslated.setText("Translated English text will appear here");
            tvStatus.setText("Tap mic to speak");
            resetWaveform();
        });

        // Minimize Button
        btnMinimize.setOnClickListener(v -> hideWidgetView());
    }

    private void updateLangLabels() {
        if (currentLangIndex == 0) {
            tvSourceLabel.setText("🇮🇳 தமிழ் (Tamil)");
            tvTargetLabel.setText("🇬🇧 English");
        } else if (currentLangIndex == 1) {
            tvSourceLabel.setText("🇬🇧 English");
            tvTargetLabel.setText("🇮🇳 தமிழ் (Tamil)");
        } else if (currentLangIndex == 2) {
            tvSourceLabel.setText("🇮🇳 हिंदी (Hindi)");
            tvTargetLabel.setText("🇬🇧 English");
        } else if (currentLangIndex == 3) {
            tvSourceLabel.setText("🇮🇳 తెలుగు (Telugu)");
            tvTargetLabel.setText("🇬🇧 English");
        } else {
            tvSourceLabel.setText("🇮🇳 മലയാളം (Malayalam)");
            tvTargetLabel.setText("🇬🇧 English");
        }
    }

    private void setTone(String tone, TextView selected, TextView other1, TextView other2) {
        currentTone = tone;
        selected.setBackgroundResource(R.drawable.bg_action_gradient);
        selected.setTextColor(0xFFFFFFFF);
        other1.setBackgroundResource(R.drawable.bg_chip_tone);
        other1.setTextColor(0xFF94A3B8);
        other2.setBackgroundResource(R.drawable.bg_chip_tone);
        other2.setTextColor(0xFF94A3B8);

        if (!rawTranslatedText.isEmpty()) {
            applyToneToText(rawTranslatedText);
        }
    }

    private void applyToneToText(String baseText) {
        if (currentTone.equals("formal")) {
            String polished = "Dear Sir/Madam, " + baseText + ". Thank you and regards.";
            tvTranslated.setText(polished);
        } else if (currentTone.equals("concise")) {
            tvTranslated.setText(baseText.replace("Please note that ", "").replace("I would like to tell you that ", ""));
        } else {
            tvTranslated.setText(baseText);
        }
    }

    private void toggleListening() {
        if (speechHelper.isCurrentlyListening()) {
            speechHelper.stopListening();
            tvStatus.setText("Processing speech...");
            resetWaveform();
            return;
        }

        String sourceLang = sourceCodes[currentLangIndex];
        String targetLang = targetCodes[currentLangIndex];

        tvStatus.setText("Listening… Speak now!");
        tvSpoken.setText("Listening...");
        tvTranslated.setText("Waiting for speech to finish...");

        speechHelper.startListening(sourceLang, new SpeechRecognitionHelper.SpeechCallback() {
            @Override
            public void onSpeechStart() {
                tvStatus.setText("Listening to your voice...");
            }

            @Override
            public void onSpeechPartial(String partial) {
                tvSpoken.setText(partial);
            }

            @Override
            public void onSpeechComplete(String finalText) {
                tvSpoken.setText(finalText);
                tvStatus.setText("Translating speech...");
                resetWaveform();

                TranslationHelper.translate(finalText, sourceLang, targetLang, new TranslationHelper.TranslationCallback() {
                    @Override
                    public void onSuccess(String translatedText) {
                        rawTranslatedText = translatedText;
                        applyToneToText(translatedText);
                        tvStatus.setText("✓ Ready! Auto-copied to clipboard.");
                        copyToClipboard(tvTranslated.getText().toString());
                        vibratePhone(45);
                        Toast.makeText(FloatingVoiceService.this, "✓ Copied! Ready to paste into WhatsApp", Toast.LENGTH_SHORT).show();
                    }

                    @Override
                    public void onError(String error) {
                        rawTranslatedText = finalText;
                        tvTranslated.setText(finalText);
                        tvStatus.setText("Direct speech copied.");
                        copyToClipboard(finalText);
                    }
                });
            }

            @Override
            public void onSpeechError(String error) {
                tvStatus.setText(error);
                resetWaveform();
            }

            @Override
            public void onRmsdBChanged(float rmsdB) {
                animateWaveform(rmsdB);
            }
        });
    }

    private void animateWaveform(float rmsdB) {
        float normalized = Math.max(0, Math.min(10, rmsdB));
        int baseHeight = 12;
        int maxExtra = 26;

        for (int i = 0; i < waveBars.length; i++) {
            if (waveBars[i] != null) {
                float multiplier = (float) Math.sin((i + 1) * 0.8f);
                int h = (int) (baseHeight + (normalized / 10f) * maxExtra * Math.abs(multiplier));
                LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) waveBars[i].getLayoutParams();
                lp.height = Math.max(6, h);
                waveBars[i].setLayoutParams(lp);
            }
        }
    }

    private void resetWaveform() {
        for (View bar : waveBars) {
            if (bar != null) {
                LinearLayout.LayoutParams lp = (LinearLayout.LayoutParams) bar.getLayoutParams();
                lp.height = 10;
                bar.setLayoutParams(lp);
            }
        }
    }

    private void shareToWhatsApp(String text) {
        try {
            Intent sendIntent = new Intent();
            sendIntent.setAction(Intent.ACTION_SEND);
            sendIntent.putExtra(Intent.EXTRA_TEXT, text);
            sendIntent.setType("text/plain");
            sendIntent.setPackage("com.whatsapp");
            sendIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(sendIntent);
        } catch (Exception e) {
            // Fallback to generic chooser
            Intent sendIntent = new Intent(Intent.ACTION_SEND);
            sendIntent.putExtra(Intent.EXTRA_TEXT, text);
            sendIntent.setType("text/plain");
            Intent chooser = Intent.createChooser(sendIntent, "Send text to...");
            chooser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(chooser);
        }
    }

    private void copyToClipboard(String text) {
        ClipData clip = ClipData.newPlainText("Nexus Speak", text);
        clipboardManager.setPrimaryClip(clip);
    }

    private void vibratePhone(long ms) {
        try {
            if (vibrator != null && vibrator.hasVibrator()) {
                vibrator.vibrate(ms);
            }
        } catch (Exception ignored) {}
    }

    private void showWidgetView() {
        try {
            if (bubbleView != null && bubbleView.getWindowToken() != null) {
                windowManager.removeView(bubbleView);
            }
            windowManager.addView(widgetView, widgetParams);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void hideWidgetView() {
        try {
            if (widgetView != null && widgetView.getWindowToken() != null) {
                windowManager.removeView(widgetView);
            }
            if (bubbleView != null && bubbleView.getWindowToken() == null) {
                windowManager.addView(bubbleView, bubbleParams);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = new NotificationChannel(
                    CHANNEL_ID,
                    "Nexus Speak Floating Service",
                    NotificationManager.IMPORTANCE_LOW
            );
            channel.setDescription("Floating Voice Bubble active over WhatsApp");
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager != null) {
                manager.createNotificationChannel(channel);
            }
        }
    }

    private Notification createNotification() {
        Intent notificationIntent = new Intent(this, MainActivity.class);
        PendingIntent pendingIntent = PendingIntent.getActivity(
                this,
                0,
                notificationIntent,
                PendingIntent.FLAG_IMMUTABLE
        );

        return new NotificationCompat.Builder(this, CHANNEL_ID)
                .setContentTitle("Nexus Flow Active")
                .setContentText("Tap floating bubble anytime to speak & paste into WhatsApp")
                .setSmallIcon(R.drawable.ic_mic)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build();
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        if (speechHelper != null) {
            speechHelper.stopListening();
        }
        if (bubbleView != null && bubbleView.getWindowToken() != null) {
            windowManager.removeView(bubbleView);
        }
        if (widgetView != null && widgetView.getWindowToken() != null) {
            windowManager.removeView(widgetView);
        }
    }
}
