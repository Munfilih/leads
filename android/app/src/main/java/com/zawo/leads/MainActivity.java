package com.zawo.leads;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Configure WebView settings for proper zoom
        WebView webView = getBridge().getWebView();
        WebSettings webSettings = webView.getSettings();
        
        // Enable zoom controls
        webSettings.setSupportZoom(true);
        webSettings.setBuiltInZoomControls(true);
        webSettings.setDisplayZoomControls(false); // Hide zoom buttons but allow pinch zoom
        
        // Set initial scale to 75%
        webView.setInitialScale(75);
        
        // Enable wide viewport
        webSettings.setUseWideViewPort(true);
        webSettings.setLoadWithOverviewMode(true);
    }
}
