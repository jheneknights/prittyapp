package com.phonegap.plugins;

import android.content.Intent;
import android.net.Uri;
import org.apache.cordova.api.CallbackContext;
import org.apache.cordova.api.CordovaPlugin;
import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;

public class sharethisFuckingShit extends CordovaPlugin {

    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {

        if (action.equals("shareThis")) {
            JSONObject params = args.getJSONObject(0);

            //Required Paramters
            String text = params.getString("text");
            String subject = params.getString("subject");
            String header = params.getString("title");

            this.hereAreTheChoises(text, subject, header);
            callbackContext.success();
        }
        
        return false;
    }

    private void hereAreTheChoises(String text, String extraSubject, String header) {
        Intent sendIntent = new Intent(android.content.Intent.ACTION_SEND);
        sendIntent.setType("text/plain");

        sendIntent.putExtra(android.content.Intent.EXTRA_SUBJECT, extraSubject);
        sendIntent.putExtra(android.content.Intent.EXTRA_TEXT, text) ;

        this.cordova.startActivityForResult(this, Intent.createChooser(sendIntent, header), 0);
    }

}
