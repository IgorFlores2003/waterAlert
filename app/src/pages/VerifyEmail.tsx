import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonText, IonIcon, IonInput, IonButton, IonToast, useIonRouter, IonLabel } from '@ionic/react';
import { mailUnreadOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { api } from '../api/client';
import './Login.css';

const VerifyEmail: React.FC = () => {
  const router = useIonRouter();
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem('user_email');
    if (!savedEmail) {
      router.push('/register', 'root', 'replace');
    } else {
      setEmail(savedEmail);
    }
  }, [router]);

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setToastMessage('Por favor, digite o código de 6 dígitos.');
      setShowToast(true);
      return;
    }

    try {
      const res = await api.verifyEmail({ email, code });
      setIsSuccess(true);
      setToastMessage('E-mail verificado com sucesso!');
      setShowToast(true);
      
      // Auto login
      localStorage.setItem('auth_token', res.data.token);
      localStorage.setItem('user_id', res.data.user.id.toString());
      localStorage.setItem('user_name', res.data.user.name);
      localStorage.setItem('water_goal', res.data.user.water_goal_ml.toString());

      setTimeout(() => {
        router.push('/home', 'root', 'replace');
      }, 2000);
    } catch (error: any) {
      setToastMessage(error.response?.data?.error || 'Código inválido.');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="login-container">
          <div className="login-header">
            <div className="logo-container">
              <IonIcon icon={mailUnreadOutline} className="logo-icon" />
            </div>
            <IonText color="light">
              <h1>Verifique seu E-mail</h1>
              <p>Enviamos um código para {email}</p>
            </IonText>
          </div>

          <div className="glass-card login-card">
            {isSuccess ? (
              <div className="success-view">
                <IonIcon icon={checkmarkCircleOutline} color="success" style={{ fontSize: '64px' }} />
                <h3>Sucesso!</h3>
                <p>Sua conta foi ativada. Redirecionando...</p>
              </div>
            ) : (
              <>
                <h2>Digite o Código</h2>
                <p>Verifique sua caixa de entrada (e spam)</p>

                <div className="code-squares-container">
                  <input 
                    type="tel" 
                    maxLength={6} 
                    value={code} 
                    onChange={e => setCode(e.target.value)}
                    className="hidden-input"
                    autoFocus
                  />
                  {[...Array(6)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`code-square ${code.length === i ? 'active' : ''} ${code.length > i ? 'filled' : ''}`}
                    >
                      {code[i] || ''}
                    </div>
                  ))}
                </div>

                <IonButton expand="block" className="login-btn" onClick={handleVerify} disabled={code.length !== 6}>
                  Verificar
                </IonButton>

                <div className="login-footer">
                  <p>Não recebeu?</p>
                  <IonText color="primary" onClick={() => router.push('/register')}>
                    <strong>Tentar outro e-mail</strong>
                  </IonText>
                </div>
              </>
            )}
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color={isSuccess ? "success" : "danger"}
        />
      </IonContent>
    </IonPage>
  );
};

export default VerifyEmail;
