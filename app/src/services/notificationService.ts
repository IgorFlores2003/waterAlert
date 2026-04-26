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
              id: 'drink_180',
              title: 'Beber 180ml',
              foreground: true 
            },
            {
              id: 'drink_custom',
              title: 'Personalizado',
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

  async scheduleHourlyNotifications(totalConsumed: number, goal: number) {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    const userId = localStorage.getItem('user_id');
    
    // Clear all previous notifications
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }

    const notifications = [];
    const mlPerAlert = Math.ceil(goal / 12);
    
    // Schedule from 8:00 to 20:00
    for (let hour = 8; hour <= 20; hour++) {
      const targetAtThisHour = (hour - 7) * mlPerAlert;
      const alreadyDrunk = totalConsumed >= targetAtThisHour;
      
      notifications.push({
        id: hour,
        title: alreadyDrunk ? "Parabéns! 💧" : "Hora de beber água!",
        body: alreadyDrunk 
          ? "Eu ia te avisar para beber agora, mas você já se adiantou! Continue assim!" 
          : `Já bebeu seus ${mlPerAlert}ml das ${hour}:00? Não esqueça!`,
        actionTypeId: 'WATER_ACTIONS',
        sound: 'water_sound.mp3', // Note: Must be present in native project assets
        extra: {
          userId: userId
        },
        schedule: { 
          at: new Date(new Date().setHours(hour, 0, 0, 0)),
          allowWhileIdle: true
        }
      });
    }

    await LocalNotifications.schedule({ notifications });
  }
};
