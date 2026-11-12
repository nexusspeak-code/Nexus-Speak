package com.nexusspeak.app;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.view.View;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import java.io.InputStream;

public class MainActivity extends AppCompatActivity {
    // =========================================================================
    // AUTO-UPDATE CONFIGURATION (Live Cloud Web URL)
    // =========================================================================
    // If you have deployed your app to Vercel, set your live URL here.
    // Example: "https://nexus-speak.vercel.app"
    public static final String LIVE_AUTO_UPDATE_URL = "";
    private static final String LOCAL_FALLBACK_URL = "file:///android_asset/www/index.html";

    private static final int REQUEST_OVERLAY_CODE = 101;
    private static final int REQUEST_AUDIO_PERM_CODE = 102;
    private static final int REQUEST_NOTIF_PERM_CODE = 103;

    private WebView webView;
    private LinearLayout layoutFloatingPill;
    private TextView tvFloatingPillText;
    private boolean isServiceRunning = false;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        checkAudioPermission();
        checkNotificationPermission();

        setupWebView();
        setupFloatingPill();
    }

    private void setupWebView() {
        webView = findViewById(R.id.main_webview);
        if (webView != null) {
            WebSettings ws = webView.getSettings();
            ws.setJavaScriptEnabled(true);
            ws.setDomStorageEnabled(true);
            ws.setDatabaseEnabled(true);
            ws.setAllowFileAccess(true);
            ws.setAllowContentAccess(true);
            ws.setAllowFileAccessFromFileURLs(true);
            ws.setAllowUniversalAccessFromFileURLs(true);
            ws.setMediaPlaybackRequiresUserGesture(false);
            ws.setUseWideViewPort(true);
            ws.setLoadWithOverviewMode(true);
            ws.setCacheMode(WebSettings.LOAD_DEFAULT);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                ws.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
            }

            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public void onPermissionRequest(final PermissionRequest request) {
                    runOnUiThread(() -> {
                        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                            request.grant(request.getResources());
                        }
                    });
                }
            });

            webView.setWebViewClient(new WebViewClient() {
                @Override
                public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                    Uri uri = request.getUrl();
                    String path = uri.getPath();
                    if (path != null && uri.getScheme() != null && uri.getScheme().equals("file")) {
                        try {
                            String assetPath = path;
                            if (assetPath.startsWith("/android_asset/")) {
                                assetPath = assetPath.substring("/android_asset/".length());
                            } else if (assetPath.startsWith("/")) {
                                assetPath = "www" + assetPath;
                            }

                            InputStream is = getAssets().open(assetPath);
                            String mime = "text/plain";
                            if (path.endsWith(".html")) mime = "text/html";
                            else if (path.endsWith(".js") || path.endsWith(".mjs")) mime = "application/javascript";
                            else if (path.endsWith(".css")) mime = "text/css";
                            else if (path.endsWith(".png")) mime = "image/png";
                            else if (path.endsWith(".jpg") || path.endsWith(".jpeg")) mime = "image/jpeg";
                            else if (path.endsWith(".svg")) mime = "image/svg+xml";
                            else if (path.endsWith(".json")) mime = "application/json";

                            return new WebResourceResponse(mime, "UTF-8", is);
                        } catch (Exception ignored) {
                        }
                    }
                    return super.shouldInterceptRequest(view, request);
                }

                @Override
                public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                    // If live cloud URL is unreachable or user is offline, load bundled local assets
                    if (!failingUrl.startsWith("file:///android_asset/")) {
                        view.loadUrl(LOCAL_FALLBACK_URL);
                    }
                }
            });

            // If live auto-update URL is configured, load live; otherwise load local assets
            if (LIVE_AUTO_UPDATE_URL != null && !LIVE_AUTO_UPDATE_URL.trim().isEmpty()) {
                webView.loadUrl(LIVE_AUTO_UPDATE_URL);
            } else {
                webView.loadUrl(LOCAL_FALLBACK_URL);
            }
        }
    }

    private void setupFloatingPill() {
        layoutFloatingPill = findViewById(R.id.layout_floating_pill);
        tvFloatingPillText = findViewById(R.id.tv_floating_pill_text);

        if (layoutFloatingPill != null) {
            layoutFloatingPill.setOnClickListener(v -> {
                if (!hasOverlayPermission()) {
                    requestOverlayPermission();
                    return;
                }
                if (!hasAudioPermission()) {
                    requestAudioPermission();
                    return;
                }

                if (isServiceRunning) {
                    stopFloatingService();
                } else {
                    startFloatingService();
                }
            });
        }
    }

    private boolean hasOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            return Settings.canDrawOverlays(this);
        }
        return true;
    }

    private boolean hasAudioPermission() {
        return ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private void requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + getPackageName()));
            startActivityForResult(intent, REQUEST_OVERLAY_CODE);
        }
    }

    private void requestAudioPermission() {
        ActivityCompat.requestPermissions(this,
                new String[]{Manifest.permission.RECORD_AUDIO},
                REQUEST_AUDIO_PERM_CODE);
    }

    private void checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                ActivityCompat.requestPermissions(this, new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQUEST_NOTIF_PERM_CODE);
            }
        }
    }

    private void checkAudioPermission() {
        if (!hasAudioPermission()) {
            requestAudioPermission();
        }
    }

    private void startFloatingService() {
        Intent serviceIntent = new Intent(this, FloatingVoiceService.class);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(serviceIntent);
        } else {
            startService(serviceIntent);
        }
        isServiceRunning = true;
        if (tvFloatingPillText != null) {
            tvFloatingPillText.setText("🛑 Stop Bubble");
        }
        Toast.makeText(this, "Floating Bubble Activated! Open WhatsApp to test it.", Toast.LENGTH_LONG).show();
    }

    private void stopFloatingService() {
        Intent serviceIntent = new Intent(this, FloatingVoiceService.class);
        stopService(serviceIntent);
        isServiceRunning = false;
        if (tvFloatingPillText != null) {
            tvFloatingPillText.setText("🚀 Floating Bubble");
        }
        Toast.makeText(this, "Floating Assistant Stopped", Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
}
