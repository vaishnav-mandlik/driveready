package com.driveready.app.nativemodules;

import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;

import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;

import com.driveready.app.MainActivity;
import com.driveready.app.R;

import java.util.Calendar;

/**
 * Daily study reminder using inexact, idle-friendly alarms
 * (no SCHEDULE_EXACT_ALARM permission needed). Each alarm schedules the next.
 */
public final class ReminderScheduler {
  static final String ACTION_FIRE = "com.driveready.app.action.STUDY_REMINDER";
  private static final String PREFS = "driveready_reminder";
  private static final String CHANNEL_ID = "study_reminders";
  private static final int REQUEST_CODE = 4101;
  private static final int NOTIFICATION_ID = 4102;

  private ReminderScheduler() {}

  static void save(Context ctx, boolean enabled, int hour, int minute, String title, String body) {
    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        .edit()
        .putBoolean("enabled", enabled)
        .putInt("hour", hour)
        .putInt("minute", minute)
        .putString("title", title)
        .putString("body", body)
        .apply();
  }

  static void disable(Context ctx) {
    ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean("enabled", false).apply();
    AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
    if (am != null) {
      am.cancel(alarmIntent(ctx));
    }
  }

  private static PendingIntent alarmIntent(Context ctx) {
    Intent intent = new Intent(ctx, ReminderAlarmReceiver.class).setAction(ACTION_FIRE);
    return PendingIntent.getBroadcast(
        ctx, REQUEST_CODE, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
  }

  /** Schedules the next reminder if enabled. Safe to call repeatedly. */
  static void scheduleNext(Context ctx) {
    SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    if (!p.getBoolean("enabled", false)) {
      return;
    }
    Calendar next = Calendar.getInstance();
    next.set(Calendar.HOUR_OF_DAY, p.getInt("hour", 19));
    next.set(Calendar.MINUTE, p.getInt("minute", 0));
    next.set(Calendar.SECOND, 0);
    next.set(Calendar.MILLISECOND, 0);
    if (next.getTimeInMillis() <= System.currentTimeMillis() + 60_000) {
      next.add(Calendar.DAY_OF_YEAR, 1);
    }
    AlarmManager am = (AlarmManager) ctx.getSystemService(Context.ALARM_SERVICE);
    if (am != null) {
      am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, next.getTimeInMillis(), alarmIntent(ctx));
    }
  }

  static void showNotification(Context ctx) {
    SharedPreferences p = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE);
    if (!p.getBoolean("enabled", false)) {
      return;
    }
    NotificationManagerCompat nm = NotificationManagerCompat.from(ctx);
    if (!nm.areNotificationsEnabled()) {
      return;
    }
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel =
          new NotificationChannel(CHANNEL_ID, "Study reminders", NotificationManager.IMPORTANCE_DEFAULT);
      channel.setDescription("A daily nudge to keep your practice streak going");
      NotificationManager sys = ctx.getSystemService(NotificationManager.class);
      if (sys != null) {
        sys.createNotificationChannel(channel);
      }
    }
    Intent open = new Intent(ctx, MainActivity.class)
        .setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
    PendingIntent content = PendingIntent.getActivity(
        ctx, REQUEST_CODE + 1, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    NotificationCompat.Builder b = new NotificationCompat.Builder(ctx, CHANNEL_ID)
        .setSmallIcon(R.drawable.ic_stat_notify)
        .setContentTitle(p.getString("title", "Time to practice"))
        .setContentText(p.getString("body", "A few questions a day keeps the retest away."))
        .setStyle(new NotificationCompat.BigTextStyle().bigText(p.getString("body", "")))
        .setContentIntent(content)
        .setAutoCancel(true)
        .setPriority(NotificationCompat.PRIORITY_DEFAULT);
    try {
      nm.notify(NOTIFICATION_ID, b.build());
    } catch (SecurityException ignored) {
      // POST_NOTIFICATIONS was revoked; nothing to do.
    }
  }
}
