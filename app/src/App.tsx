import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonToast } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { LocalNotifications, PluginListenerHandle } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import Home from './pages/Home';
import Setup from './pages/Setup';
import { api } from './api/client';
import { NotificationService } from './services/notificationService';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

const App: React.FC = () => {
  const isRegistered = !!localStorage.getItem('user_id');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    let notificationListener: PluginListenerHandle;

    const setupNotifications = async () => {
      // Only run on native platforms
      if (Capacitor.getPlatform() === 'web') return;

      await NotificationService.init();

      notificationListener = await LocalNotifications.addListener(
        'localNotificationActionPerformed', 
        async (payload) => {
          const { actionId, notification } = payload;
          const userId = notification.extra?.userId || localStorage.getItem('user_id');

          if (userId) {
            try {
              if (actionId === 'drink_250') {
                await api.logIntake(parseInt(userId), 250);
                setToastMessage('250ml registrados com sucesso! 💧');
                setShowToast(true);
              } else if (actionId === 'drink_500') {
                await api.logIntake(parseInt(userId), 500);
                setToastMessage('500ml registrados com sucesso! 🌊');
                setShowToast(true);
              }
            } catch (error) {
              console.error('Erro ao registrar via notificação:', error);
            }
          }
        }
      );
    };

    setupNotifications();

    return () => {
      if (notificationListener) {
        notificationListener.remove();
      }
    };
  }, []);

  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route exact path="/home">
            <Home />
          </Route>
          <Route exact path="/setup">
            <Setup />
          </Route>
          <Route exact path="/">
            {isRegistered ? <Redirect to="/home" /> : <Redirect to="/setup" />}
          </Route>
        </IonRouterOutlet>
      </IonReactRouter>
      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
        color="primary"
      />
    </IonApp>
  );
};

export default App;
