package com.driveready.app.nativemodules;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Not exported: only our own alarm PendingIntent can reach it. */
public class ReminderAlarmReceiver extends BroadcastReceiver {
  @Override
  public void onReceive(Context context, Intent intent) {
    if (ReminderScheduler.ACTION_FIRE.equals(intent.getAction())) {
      ReminderScheduler.showNotification(context);
      ReminderScheduler.scheduleNext(context);
    }
  }
}
