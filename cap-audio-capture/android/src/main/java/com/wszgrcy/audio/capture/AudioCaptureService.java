package com.wszgrcy.audio.capture;

import android.annotation.SuppressLint;
import android.app.Notification;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioPlaybackCaptureConfiguration;
import android.media.AudioRecord;
import android.media.projection.MediaProjection;
import android.media.projection.MediaProjectionManager;
import android.os.IBinder;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.util.Pair;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class AudioCaptureService extends Service {

    private static final String TAG = "AudioCaptureService";
    private static final String RESULT_CODE = "RESULT_CODE";
    private static final String DATA = "DATA";
    private static final String ACTION = "ACTION";
    private static final int SAMPLE_RATE = 16000;
    private static final int CHANNEL_CONFIG = AudioFormat.CHANNEL_IN_MONO;
    private static final int AUDIO_FORMAT = AudioFormat.ENCODING_PCM_16BIT;

    private MediaProjection mMediaProjection;
    private AudioRecord mAudioRecord;
    private ExecutorService mExecutorService;
    private boolean isCapturing = false;
    public static Intent getStartIntent(Context context, int resultCode, Intent data) {
        return new Intent(context, AudioCaptureService.class)
                .putExtra(ACTION, "START")
                .putExtra(RESULT_CODE, resultCode)
                .putExtra(DATA, data);
    }

    public static Intent getStopIntent(Context context) {
        return new Intent(context, AudioCaptureService.class).putExtra(ACTION, "STOP");
    }

    @Override
    public void onCreate() {
        super.onCreate();
        mExecutorService = Executors.newSingleThreadExecutor();
    }

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        if ("START".equals(intent.getStringExtra(ACTION))) {
            Pair<Integer, Notification> notification = NotificationUtils.getNotification(this);
            startForeground(notification.first, notification.second);

            int resultCode = intent.getIntExtra(RESULT_CODE, -1);
            Intent data = intent.getParcelableExtra(DATA);
            startAudioCapture(resultCode, data);
        } else if ("STOP".equals(intent.getStringExtra(ACTION))) {
            stopAudioCapture();
            stopSelf();
        } else {
            stopSelf();
        }

        return START_NOT_STICKY;
    }

    private void startAudioCapture(int resultCode, Intent data) {
        if (mMediaProjection == null) {
            MediaProjectionManager mpManager = (MediaProjectionManager) getSystemService(Context.MEDIA_PROJECTION_SERVICE);
            mMediaProjection = mpManager.getMediaProjection(resultCode, data);
            
            if (mMediaProjection != null) {
                AudioPlaybackCaptureConfiguration config =
                        new AudioPlaybackCaptureConfiguration.Builder(mMediaProjection)
                                .addMatchingUsage(AudioAttributes.USAGE_MEDIA)
                                .addMatchingUsage(AudioAttributes.USAGE_GAME)
                                .addMatchingUsage(AudioAttributes.USAGE_UNKNOWN)
                                .build();

                AudioFormat format = new AudioFormat.Builder()
                        .setEncoding(AUDIO_FORMAT)
                        .setSampleRate(SAMPLE_RATE)
                        .setChannelMask(CHANNEL_CONFIG)
                        .build();

                mAudioRecord = new AudioRecord.Builder()
                        .setAudioFormat(format)
                        .setAudioPlaybackCaptureConfig(config)
                        .build();

                if (mAudioRecord.getState() == AudioRecord.STATE_INITIALIZED) {
                    isCapturing = true;
                    Log.d(TAG, "AudioRecord start");
                    mExecutorService.execute(new AudioCaptureRunnable());
                }
            }
        }
    }

    private void stopAudioCapture() {
        isCapturing = false;

        if (mExecutorService != null) {
            mExecutorService.shutdownNow();
            mExecutorService = null;
        }

        if (mAudioRecord != null) {
            try {
                if (mAudioRecord.getRecordingState() == AudioRecord.RECORDSTATE_RECORDING) {
                    mAudioRecord.stop();
                }
                mAudioRecord.release();
            } catch (Exception e) {
                Log.e(TAG, "Error releasing AudioRecord", e);
            } finally {
                mAudioRecord = null;
            }
        }

        if (mMediaProjection != null) {
            mMediaProjection.stop();
            mMediaProjection = null;
        }
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        stopAudioCapture();
    }

    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }

    @SuppressLint("MissingPermission")
    private class AudioCaptureRunnable implements Runnable {
        @Override
        public void run() {
            try {
                mAudioRecord.startRecording();

                int minBufferSize = AudioRecord.getMinBufferSize(
                        SAMPLE_RATE, CHANNEL_CONFIG, AUDIO_FORMAT);
                byte[] audioData = new byte[minBufferSize*2];

                while (isCapturing) {
                    int bytesRead = mAudioRecord.read(audioData, 0, audioData.length);
                    
                    if (bytesRead > 0) {
                        // Send audio data to Plugin using callback
                        AudioCapturePlugin.onAudioDataReceived(audioData, bytesRead);
                    } else if (bytesRead == AudioRecord.ERROR_INVALID_OPERATION) {
                        Log.e(TAG, "Invalid operation error");
                        break;
                    } else if (bytesRead == AudioRecord.ERROR_BAD_VALUE) {
                        Log.e(TAG, "Bad value error");
                        break;
                    }
                }
            } catch (Exception e) {
                Log.e(TAG, "Error in audio capture", e);
            } finally {
                if (mAudioRecord != null && mAudioRecord.getRecordingState() == AudioRecord.RECORDSTATE_RECORDING) {
                    mAudioRecord.stop();
                }
            }
        }
    }
}
