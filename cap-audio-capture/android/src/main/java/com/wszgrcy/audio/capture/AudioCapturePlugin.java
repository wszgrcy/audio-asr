package com.wszgrcy.audio.capture;

import android.media.projection.MediaProjectionManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.JSArray;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import androidx.activity.result.ActivityResult;

@CapacitorPlugin(
        name = "AudioCapture",
        permissions = {
                @Permission(
                        alias = "recordAudio",
                        strings = {android.Manifest.permission.RECORD_AUDIO}
                )
        }
)
public class AudioCapturePlugin extends Plugin {

    private static final int REQUEST_CODE = 101;
    private static final String TAG = "AudioCapturePlugin";
    private static AudioCapturePlugin instance;
    private static final int MAX_BYTES = 4096;

    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState("recordAudio") != PermissionState.GRANTED) {
            requestPermissionForAlias("recordAudio", call, "recordAudioCallback");
            return;
        }

        launchScreenCaptureIntent(call);
    }

    @PermissionCallback
    private void recordAudioCallback(PluginCall call) {
        if (getPermissionState("recordAudio") == PermissionState.GRANTED) {
            launchScreenCaptureIntent(call);
        } else {
            call.reject("Record audio permission is required");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getBridge().getContext().startService(AudioCaptureService.getStopIntent(getBridge().getContext()));
        call.resolve();
    }

    @PluginMethod
    public void echo(PluginCall call) {
        String value = call.getString("value");
        JSObject ret = new JSObject();
        ret.put("value", value);
        call.resolve(ret);
    }

    private void launchScreenCaptureIntent(PluginCall call) {
        MediaProjectionManager mProjectionManager =
                (MediaProjectionManager) getBridge().getContext().getSystemService(android.content.Context.MEDIA_PROJECTION_SERVICE);
        startActivityForResult(call, mProjectionManager.createScreenCaptureIntent(), "screenCaptureResult");
    }

    @ActivityCallback
    private void screenCaptureResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        if (result.getResultCode() == android.app.Activity.RESULT_OK) {
            getBridge().getContext().startService(AudioCaptureService.getStartIntent(
                    getBridge().getContext(), result.getResultCode(), result.getData()));
            call.resolve();
        } else {
            call.reject("User denied audio capture permission");
        }
    }

    /**
     * Service calls this method to send audio data to Plugin
     */
    public static void onAudioDataReceived(byte[] audioData, int bytesRead) {
        if (audioData != null && bytesRead > 0) {
            // Convert to int array for JavaScript compatibility
            int[] intData = new int[bytesRead];
            for (int i = 0; i < bytesRead; i++) {
                intData[i] = audioData[i] & 0xFF;
            }

            JSObject ret = new JSObject();
            ret.put("data", JSArray.from(intData));
            instance.notifyListeners("audioData", ret, true);
        }
    }

    @Override
    public void load() {
        instance = this;
    }

    public void onDestroy() {
        instance = null;
    }
}
