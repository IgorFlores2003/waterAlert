import React, { useEffect, useState } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact, IonToast } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor, PluginListenerHandle } from '@capacitor/core';
import Home from './pages/Home';
import Setup from './pages/Setup';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
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
              if (actionId === 'drink_180') {
                await api.logIntake(180);
                setToastMessage('180ml registrados com sucesso!');
                setShowToast(true);
              } else if (actionId === 'drink_custom') {
                // For notifications, we might just log a default or open the app
                setToastMessage('Abra o app para registrar um valor personalizado.');
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
          <Route exact path="/login">
            <Login />
          </Route>
          <Route exact path="/register">
            <Register />
          </Route>
          <Route exact path="/verify-email">
            <VerifyEmail />
          </Route>
          <Route exact path="/home">
            {localStorage.getItem('auth_token') ? <Home /> : <Redirect to="/login" />}
          </Route>
          <Route exact path="/setup">
            {localStorage.getItem('auth_token') ? <Setup /> : <Redirect to="/login" />}
          </Route>
          <Route exact path="/">
            {localStorage.getItem('auth_token') ? <Redirect to="/home" /> : <Redirect to="/login" />}
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
