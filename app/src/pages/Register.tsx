import React, { useState } from 'react';
import { IonContent, IonPage, IonText, IonIcon, IonInput, IonButton, IonToast, useIonRouter, IonLabel, IonSelect, IonSelectOption } from '@ionic/react';
import { personOutline, mailOutline, lockClosedOutline, barbellOutline, calendarOutline, arrowBackOutline, resizeOutline } from 'ionicons/icons';
import { api } from '../api/client';
import './Login.css'; // Reuse common styles

const Register: React.FC = () => {
  const router = useIonRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password || !weight || !height || !age) {
      setToastMessage('Por favor, preencha todos os campos.');
      setShowToast(true);
      return;
    }

    try {
      const res = await api.signup({
        name,
        email,
        password,
        weight: parseFloat(weight),
        height: parseFloat(height),
        age: parseInt(age),
        gender
      });

      localStorage.setItem('user_email', email); // Save email for verification page
      
      router.push(`/verify-email`, 'forward', 'replace');
    } catch (error: any) {
      setToastMessage(error.response?.data?.error || 'Erro ao realizar cadastro.');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="login-container">
          <div className="login-header" style={{ marginBottom: '10px' }}>
            <div className="logo-container" style={{ width: '40px', height: '40px' }} onClick={() => router.back()}>
              <IonIcon icon={arrowBackOutline} className="logo-icon" style={{ fontSize: '20px' }} />
            </div>
            <IonText color="light">
              <h1>Criar Conta</h1>
            </IonText>
          </div>

          <div className="glass-card login-card" style={{ padding: '15px' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <IonLabel>Nome</IonLabel>
                <div className="premium-input-wrapper">
                  <IonInput 
                    value={name} 
                    placeholder="Seu nome"
                    onIonInput={e => setName(e.detail.value!)}
                  />
                </div>
              </div>
              <div className="input-group">
                <IonLabel>Sexo</IonLabel>
                <div className="premium-input-wrapper">
                  <IonSelect 
                    value={gender} 
                    interface="popover"
                    onIonChange={e => setGender(e.detail.value)}
                    style={{ color: 'white', width: '100%' }}
                  >
                    <IonSelectOption value="male">Masc.</IonSelectOption>
                    <IonSelectOption value="female">Fem.</IonSelectOption>
                  </IonSelect>
                </div>
              </div>
            </div>

            <div className="input-group">
              <IonLabel>E-mail</IonLabel>
              <div className="premium-input-wrapper">
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
                <IonInput 
                  type="password" 
                  value={password} 
                  placeholder="Mínimo 6 caracteres"
                  onIonInput={e => setPassword(e.detail.value!)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
              <div className="input-group">
                <IonLabel>Peso (kg)</IonLabel>
                <div className="premium-input-wrapper">
                  <IonInput 
                    type="number" 
                    value={weight} 
                    placeholder="70"
                    onIonInput={e => setWeight(e.detail.value!)}
                  />
                </div>
              </div>
              <div className="input-group">
                <IonLabel>Idade</IonLabel>
                <div className="premium-input-wrapper">
                  <IonInput 
                    type="number" 
                    value={age} 
                    placeholder="25"
                    onIonInput={e => setAge(e.detail.value!)}
                  />
                </div>
              </div>
              <div className="input-group">
                <IonLabel>Alt. (cm)</IonLabel>
                <div className="premium-input-wrapper">
                  <IonInput 
                    type="number" 
                    value={height} 
                    placeholder="175"
                    onIonInput={e => setHeight(e.detail.value!)}
                  />
                </div>
              </div>
            </div>

            <IonButton expand="block" className="login-btn" onClick={handleRegister}>
              Cadastrar
            </IonButton>

            <div className="login-footer">
              <IonText color="primary" onClick={() => router.push('/login')}>
                <strong>Já tem conta? Entrar</strong>
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

export default Register;
