package com.prittyapp;

import android.content.pm.ActivityInfo;
import android.graphics.Bitmap;
import org.apache.cordova.*;
import android.os.Bundle;

public class MyActivity extends DroidGap
{
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.setIntegerProperty("splashscreen", R.drawable.splashscreen);;
        super.loadUrl("file:///android_asset/www/index.html", 3000);
        setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
    }
}
