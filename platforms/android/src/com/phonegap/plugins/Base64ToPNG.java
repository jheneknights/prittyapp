 package com.phonegap.plugins;

/**
 * A phonegap plugin that converts a Base64 String to a PNG file.
 *
 * @author mcaesar
 * @lincese MIT.
 */

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;
import org.json.JSONArray;

import android.os.Environment;
import java.io.*;
import java.util.Calendar;

import org.json.JSONException;
import org.json.JSONObject;
import android.util.Base64;

public class Base64ToPNG extends Plugin  {

    @Override
    public PluginResult execute(String action, JSONArray args, String callbackId) {

        if (!action.equals("saveImage")) {
            return new PluginResult(PluginResult.Status.INVALID_ACTION);
        }

        try {j

            String b64String = "";
            if (b64String.startsWith("data:image")) {
                b64String = args.getString(0).substring(22);
            } else {
                b64String = args.getString(0);
            }
            JSONObject params = args.getJSONObject(1);

            //Optional parameter
            String filename = params.has("filename")
                    ? params.getString("filename") + '-' + filenameFromCurrentDate() + ".png"
                    : "b64Image_" + System.currentTimeMillis() + ".png";

            String folder = params.has("folder")
                    ? Environment.getExternalStorageDirectory() + "/" + params.getString("folder")
                    : Environment.getExternalStorageDirectory() + "/Pictures";

            Boolean overwrite = params.has("overwrite")
                    ? params.getBoolean("overwrite")
                    : false;

            Boolean shareThis = params.has("shareThis")
                    ? params.getBoolean("shareThis")
                    : false;

            return this.saveImage(b64String, filename, folder, overwrite, shareThis, callbackId);

        } catch (JSONException e) {

            e.printStackTrace();
            return new PluginResult(PluginResult.Status.JSON_EXCEPTION, "JSONException: " +  e.getMessage());

        } catch (InterruptedException e) {
            e.printStackTrace();
            return new PluginResult(PluginResult.Status.ERROR, "InterruptedException: " +  e.getMessage());
        }

    }

    private PluginResult saveImage(String b64String, String fileName, String dirName, Boolean overwrite, Boolean shareThis, String callbackId) throws InterruptedException, JSONException {

        try {

            //check to see if the directory exist, if it dsnt, make it
            File dir = new File(dirName);
            if (!dir.isDirectory()) { dir.mkdirs(); }

            File file = new File(dirName, fileName);

            //Avoid overwriting a file
            if (!overwrite && file.exists()) {
                return new PluginResult(PluginResult.Status.OK, "File already exists!");
            }

            //Decode Base64 back to Binary format
            byte[] decodedString = Base64.decode(b64String.getBytes(), Base64.DEFAULT);

            //Save Binary file to phone
            file.createNewFile();
            FileOutputStream fOut = new FileOutputStream(file);
            fOut.write(decodedString);
            fOut.close();

            //now update the Library for the photo to appear
            scanPhoto(file.getPath());

            String fullfilePath = dirName + "/" + fileName;

            //now check to see if the user has chosen to share the image
            if(shareThis) { 
                hereAreTheChoises(fullfilePath, "my thoughts on a PrittyNote", "PrittyNote", "Share PrittyNote to:"); 
            }
            return new PluginResult(PluginResult.Status.OK, "Image Saved successfully: " + fileName);

        } catch (FileNotFoundException e) {
            return new PluginResult(PluginResult.Status.ERROR, "FileNotFoundException: File not Found!");
        } catch (IOException e) {
            return new PluginResult(PluginResult.Status.ERROR, "IOException:"  + e.getMessage());
        }

    }

    private String filenameFromCurrentDate() {
        Calendar c = Calendar.getInstance();
        String date = fromInt(c.get(Calendar.YEAR)) + fromInt(c.get(Calendar.MONTH)) +
                fromInt(c.get(Calendar.DAY_OF_MONTH)) + fromInt(c.get(Calendar.HOUR_OF_DAY)) +
                fromInt(c.get(Calendar.MINUTE)) + fromInt(c.get(Calendar.SECOND));
        return date;
    }

    private String fromInt(int val) {
        return String.valueOf(val);
    }

    private void scanPhoto(String imageFileName) {
        Intent mediaScanIntent = new Intent(Intent.ACTION_MEDIA_SCANNER_SCAN_FILE);
        File f = new File(imageFileName);
        Uri contentUri = Uri.fromFile(f);
        mediaScanIntent.setData(contentUri);
        this.cordova.getActivity().sendBroadcast(mediaScanIntent);
    }

    private void hereAreTheChoises(String fileName, String text, String extraSubject, String header) {
        Intent sendIntent = new Intent(android.content.Intent.ACTION_SEND);
        sendIntent.setType("image/png");
        
        sendIntent.putExtra(android.content.Intent.EXTRA_SUBJECT, extraSubject);
        sendIntent.putExtra(android.content.Intent.EXTRA_TEXT, text) ;
        Uri uriFile = Uri.fromFile(new File(fileName));
        sendIntent.putExtra(android.content.Intent.EXTRA_STREAM, uriFile);
        sendIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
        sendIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION);
      
        this.cordova.startActivityForResult(this, Intent.createChooser(sendIntent, header), 0);
    }

}

