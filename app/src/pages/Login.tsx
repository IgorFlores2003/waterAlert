import React, { useState } from 'react';
import { IonContent, IonPage, IonText, IonIcon, IonInput, IonButton, IonToast, useIonRouter, IonLabel } from '@ionic/react';
import { mailOutline, lockClosedOutline, waterOutline } from 'ionicons/icons';
import { api } from '../api/client';
import './Login.css';

const Login: React.FC = () => {
  const router = useIonRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setToastMessage('Por favor, preencha todos os campos.');
      setShowToast(true);
      return;
    }

    try {
      const res = await api.login({ email, password });
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('user_id', res.data.user.id.toString());
      localStorage.setItem('user_name', res.data.user.name);
      localStorage.setItem('water_goal', res.data.user.water_goal_ml.toString());
      
      router.push('/home', 'root', 'replace');
    } catch (error: any) {
      setToastMessage(error.response?.data?.error || 'Erro ao fazer login.');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="login-container">
          <div className="login-header">
            <div className="logo-container">
              <IonIcon icon={waterOutline} className="logo-icon" />
            </div>
            <IonText color="light">
              <h1>Water Alert</h1>
              <p>Hidrate-se com inteligência</p>
            </IonText>
          </div>

          <div className="glass-card login-card">
            <h2>Bem-vindo de volta!</h2>
            <p>Acesse sua conta para ver seu histórico</p>

            <div className="input-group">
              <IonLabel>E-mail</IonLabel>
              <div className="premium-input-wrapper">
                <IonIcon icon={mailOutline} />
                <IonInput 
                  type="email" 
                  value={email} 
                  placeholder="seu@email.com"
                  onIonInput={e => setEmail(e.detail.value!)}
                />
              </div>
            </div>

            <div className="input-group">
              <IonLabel>Senha</IonLabel>
              <div className="premium-input-wrapper">
                <IonIcon icon={lockClosedOutline} />
                <IonInput 
                  type="password" 
                  value={password} 
                  placeholder="••••••••"
                  onIonInput={e => setPassword(e.detail.value!)}
                />
              </div>
            </div>

            <IonButton expand="block" className="login-btn" onClick={handleLogin}>
              Entrar
            </IonButton>

            <div className="login-footer">
              <p>Não tem uma conta?</p>
              <IonText color="primary" onClick={() => router.push('/register')}>
                <strong>Cadastre-se agora</strong>
              </IonText>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
