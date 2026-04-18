import React, { useState } from 'react';
import { IonContent, IonPage, IonText, IonIcon, IonFab, IonFabButton, IonLabel, useIonViewWillEnter, useIonRouter } from '@ionic/react';
import { addOutline, beerOutline, colorFillOutline, waterOutline, settingsOutline } from 'ionicons/icons';
import { api } from '../api/client';
import './Home.css';

const Home: React.FC = () => {
  const router = useIonRouter();
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [goal, setGoal] = useState(0);
  const [name, setName] = useState('');
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

  const percentage = Math.min((totalConsumed / goal) * 100, 100);

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
              <div className="settings-btn" onClick={() => router.push('/setup')}>
                <IonIcon icon={settingsOutline} />
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
            <div className="glass-card action-card" onClick={() => addWater(250)}>
              <IonIcon icon={colorFillOutline} />
              <IonLabel>250ml</IonLabel>
            </div>
            <div className="glass-card action-card" onClick={() => addWater(500)}>
              <IonIcon icon={beerOutline} />
              <IonLabel>500ml</IonLabel>
            </div>
          </div>
        </div>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => addWater(200)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Home;
