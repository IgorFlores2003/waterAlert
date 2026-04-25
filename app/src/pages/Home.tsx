import React, { useState } from 'react';
import { IonContent, IonPage, IonText, IonIcon, IonLabel, useIonViewWillEnter, useIonRouter, IonToast, IonAlert } from '@ionic/react';
import { addOutline, wineOutline, colorFillOutline, waterOutline, settingsOutline, refreshOutline, timeOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { api } from '../api/client';
import './Home.css';

const Home: React.FC = () => {
  const router = useIonRouter();
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [goal, setGoal] = useState(0);
  const [name, setName] = useState('');
  const [showResetToast, setShowResetToast] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const userId = localStorage.getItem('user_id');

  const fetchData = async () => {
    if (!userId) {
      router.push('/setup', 'root', 'replace');
      return;
    }
    try {
      const progressRes = await api.getProgress(parseInt(userId));
      setTotalConsumed(progressRes.data.total_consumed);
      
      const savedGoal = localStorage.getItem('water_goal');
      const savedName = localStorage.getItem('user_name');
      
      setGoal(parseInt(savedGoal || '2000'));
      setName(savedName || 'Usuário');
    } catch (error) {
      console.error('Failed to fetch progress', error);
    }
  };

  useIonViewWillEnter(() => {
    fetchData();
  });

  const addWater = async (amount: number) => {
    if (!userId) {
      router.push('/setup');
      return;
    }
    try {
      await api.logIntake(parseInt(userId), amount);
      fetchData();
    } catch (error) {
      console.error('Failed to log intake', error);
      alert('Erro de conexão com o servidor. Verifique se o backend está rodando!');
    }
  };

  const restartDay = async () => {
    if (!userId) return;
    try {
      await api.resetProgress(userId);
      setShowResetToast(true);
      fetchData();
    } catch (error) {
      console.error('Failed to reset day', error);
    }
  };

  const percentage = Math.min((totalConsumed / goal) * 100, 100);

  // Generate Alert Timeline (8:00 to 20:00 - 12 hours)
  const mlPerAlert = Math.ceil(goal / 12);
  const hours = Array.from({ length: 13 }, (_, i) => 8 + i);

  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="home-container">
          <div className="home-header">
            <div className="header-top">
              <IonText color="light">
                <h2>Olá, {name}!</h2>
                <p>Mantenha-se hidratado hoje</p>
              </IonText>
              <div className="header-actions">
                <div className="action-icon-btn" onClick={restartDay}>
                  <IonIcon icon={refreshOutline} />
                </div>
                <div className="action-icon-btn" onClick={() => router.push('/setup')}>
                  <IonIcon icon={settingsOutline} />
                </div>
              </div>
            </div>
          </div>

          <div className="progress-circle-container">
            <div className="progress-circle" style={{ '--percentage': `${percentage}%` } as any}>
              <div className="progress-inner">
                <IonIcon icon={waterOutline} className="water-icon-large" />
                <IonText>
                  <h1>{totalConsumed}ml</h1>
                  <p>de {goal}ml</p>
                </IonText>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <div className="glass-card action-card" onClick={() => addWater(180)}>
              <IonIcon icon={wineOutline} />
              <IonLabel>180ml</IonLabel>
            </div>
            <div className="glass-card action-card" onClick={() => setShowCustomAlert(true)}>
              <IonIcon icon={addOutline} />
              <IonLabel>Personalizado</IonLabel>
            </div>
          </div>

          <div className="timeline-section">
            <IonText color="light">
              <h3 className="section-title">Programação de Hoje</h3>
              <p className="section-subtitle">Meta por alerta: <strong>{mlPerAlert}ml</strong></p>
            </IonText>

            <div className="timeline-container">
              {hours.map((hour) => (
                <div key={hour} className={`timeline-item ${totalConsumed >= (hour - 7) * mlPerAlert ? 'completed' : ''}`}>
                  <div className="time-col">
                    <IonText color="light">
                      <span>{hour.toString().padStart(2, '0')}:00</span>
                    </IonText>
                  </div>
                  <div className="indicator-col">
                    <div className="line"></div>
                    <div className="dot">
                      {totalConsumed >= (hour - 7) * mlPerAlert && <IonIcon icon={checkmarkCircleOutline} />}
                    </div>
                  </div>
                  <div className="content-col">
                    <div className="glass-card timeline-card">
                      <IonIcon icon={timeOutline} slot="start" />
                      <IonLabel>Beber {mlPerAlert}ml</IonLabel>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showResetToast}
          onDidDismiss={() => setShowResetToast(false)}
          message="Dia reiniciado! Começando do zero."
          duration={2000}
          position="top"
          color="warning"
        />

        <IonAlert
          isOpen={showCustomAlert}
          onDidDismiss={() => setShowCustomAlert(false)}
          header={'Quanto você bebeu?'}
          inputs={[
            {
              name: 'amount',
              type: 'number',
              placeholder: 'Quantidade em ml'
            }
          ]}
          buttons={[
            {
              text: 'Cancelar',
              role: 'cancel',
              cssClass: 'secondary',
            },
            {
              text: 'Adicionar',
              handler: (data) => {
                if (data.amount) {
                  addWater(parseInt(data.amount));
                }
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Home;
