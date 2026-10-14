package com.driveready.app.nativemodules;

import android.app.Activity;
import android.os.Build;
import android.speech.tts.TextToSpeech;
import android.view.HapticFeedbackConstants;
import android.view.View;

import androidx.annotation.NonNull;

import com.driveready.app.specs.NativeDriveReadySpec;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.UiThreadUtil;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Read-aloud (TextToSpeech), haptic feedback without the VIBRATE permission,
 * and the optional daily study reminder.
 */
public class DriveReadyModule extends NativeDriveReadySpec implements TextToSpeech.OnInitListener {
  public static final String NAME = "DriveReady";

  private TextToSpeech tts;
  /** null = still initializing, true/false = init result. */
  private Boolean ttsReady = null;
  private String pendingText;
  private double pendingRate = 1.0;
  private String pendingLanguage = "en-US";
  /** Language tag the engine is currently set to (null = not set yet). */
  private String currentLanguage;
  private final List<Promise> availabilityWaiters = new ArrayList<>();

  public DriveReadyModule(ReactApplicationContext context) {
    super(context);
  }

  @NonNull
  @Override
  public String getName() {
    return NAME;
  }

  // ---- speech -------------------------------------------------------------

  private synchronized void ensureTts() {
    if (tts == null) {
      ttsReady = null;
      currentLanguage = null;
      tts = new TextToSpeech(getReactApplicationContext(), this);
    }
  }

  @Override
  public synchronized void onInit(int status) {
    ttsReady = status == TextToSpeech.SUCCESS && tts != null;
    if (ttsReady) {
      applyLanguage(pendingLanguage);
      if (pendingText != null) {
        doSpeak(pendingText, pendingRate, pendingLanguage);
        pendingText = null;
      }
    }
    for (Promise p : availabilityWaiters) {
      p.resolve(ttsReady);
    }
    availabilityWaiters.clear();
  }

  /** Switches the voice language; falls back to the device language if the voice is not installed. */
  private void applyLanguage(String tag) {
    if (tag.equals(currentLanguage)) {
      return;
    }
    int result = tts.setLanguage(Locale.forLanguageTag(tag));
    if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
      // e.g. es-US missing: try generic Spanish before the device default.
      String base = tag.split("-")[0];
      result = tts.setLanguage(new Locale(base));
      if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
        tts.setLanguage(Locale.getDefault());
      }
    }
    currentLanguage = tag;
  }

  private void doSpeak(String text, double rate, String language) {
    applyLanguage(language);
    tts.setSpeechRate((float) Math.max(0.3, Math.min(2.0, rate)));
    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "driveready-utterance");
  }

  @Override
  public synchronized void speak(String text, double rate, String language) {
    ensureTts();
    if (Boolean.TRUE.equals(ttsReady)) {
      doSpeak(text, rate, language);
    } else if (ttsReady == null) {
      pendingText = text;
      pendingRate = rate;
      pendingLanguage = language;
    }
  }

  @Override
  public synchronized void stopSpeaking() {
    pendingText = null;
    if (tts != null) {
      tts.stop();
    }
  }

  @Override
  public synchronized void isSpeechAvailable(Promise promise) {
    ensureTts();
    if (ttsReady == null) {
      availabilityWaiters.add(promise);
    } else {
      promise.resolve(ttsReady);
    }
  }

  @Override
  public void invalidate() {
    synchronized (this) {
      if (tts != null) {
        tts.stop();
        tts.shutdown();
        tts = null;
      }
      for (Promise p : availabilityWaiters) {
        p.resolve(false);
      }
      availabilityWaiters.clear();
    }
    super.invalidate();
  }

  // ---- haptics ------------------------------------------------------------

  @Override
  public void haptic(String kind) {
    final Activity activity = getReactApplicationContext().getCurrentActivity();
    if (activity == null) {
      return;
    }
    final int constant = hapticConstant(kind);
    UiThreadUtil.runOnUiThread(() -> {
      View view = activity.getWindow() != null ? activity.getWindow().getDecorView() : null;
      if (view != null) {
        view.performHapticFeedback(constant);
      }
    });
  }

  private static int hapticConstant(String kind) {
    boolean api30 = Build.VERSION.SDK_INT >= Build.VERSION_CODES.R;
    switch (kind) {
      case "success":
        return api30 ? HapticFeedbackConstants.CONFIRM : HapticFeedbackConstants.VIRTUAL_KEY;
      case "error":
        return api30 ? HapticFeedbackConstants.REJECT : HapticFeedbackConstants.LONG_PRESS;
      case "selection":
        return HapticFeedbackConstants.CLOCK_TICK;
      case "heavy":
        return HapticFeedbackConstants.LONG_PRESS;
      default:
        return HapticFeedbackConstants.KEYBOARD_TAP;
    }
  }

  // ---- reminders ----------------------------------------------------------

  @Override
  public void scheduleDailyReminder(double hour, double minute, String title, String body, Promise promise) {
    try {
      ReminderScheduler.save(getReactApplicationContext(), true, (int) hour, (int) minute, title, body);
      ReminderScheduler.scheduleNext(getReactApplicationContext());
      promise.resolve(true);
    } catch (Exception e) {
      promise.reject("E_REMINDER", e.getMessage(), e);
    }
  }

  @Override
  public void cancelDailyReminder() {
    ReminderScheduler.disable(getReactApplicationContext());
  }
}
