import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

export const NotificationService = {
  async init() {
    if (Capacitor.getPlatform() === 'web') return;

    // Register actions (buttons)
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'WATER_ACTIONS',
          actions: [
            {
              id: 'drink_250',
              title: 'Beber 250ml',
              foreground: true // Opens the app to ensure API call finishes
            },
            {
              id: 'drink_500',
              title: 'Beber 500ml',
              foreground: true
            }
          ]
        }
      ]
    });
  },

  async requestPermissions() {
    const status = await LocalNotifications.checkPermissions();
    if (status.display === 'granted') return true;

    const request = await LocalNotifications.requestPermissions();
    return request.display === 'granted';
  },

  async scheduleHourlyNotifications() {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const userId = localStorage.getItem('user_id');

    await LocalNotifications.cancel({ notifications: [{ id: 1 }] });

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "Hora de beber água!",
          body: "Bata sua meta diária. Já bebeu agora?",
          id: 1,
          actionTypeId: 'WATER_ACTIONS',
          extra: {
            userId: userId
          },
          schedule: { 
            allowWhileIdle: true,
            repeats: true,
            every: 'hour'
          }
        }
      ]
    });
  }
};
