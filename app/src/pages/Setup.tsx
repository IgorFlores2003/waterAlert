import React, { useState, useEffect } from 'react';
import { IonContent, IonPage, IonInput, IonItem, IonLabel, IonButton, IonText, IonIcon, useIonRouter, useIonViewWillEnter, IonButtons, IonBackButton } from '@ionic/react';
import { waterOutline, personOutline, barbellOutline, calendarOutline, resizeOutline, arrowBackOutline } from 'ionicons/icons';
import { api } from '../api/client';
import { NotificationService } from '../services/notificationService';
import './Setup.css';

const Setup: React.FC = () => {
  const [name, setName] = useState('');
  const [weight, setWeight] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [age, setAge] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  const router = useIonRouter();
  const userId = localStorage.getItem('user_id');

  const loadUserData = async () => {
    if (userId) {
      setIsEdit(true);
      try {
        const response = await api.getUserProfile(userId);
        const { name, weight, height, age } = response.data;
        setName(name);
        setWeight(weight);
        setHeight(height);
        setAge(age);
      } catch (error) {
        console.error('Failed to load user data', error);
      }
    }
  };

  useIonViewWillEnter(() => {
    loadUserData();
  });

  const handleSave = async () => {
    if (!name || !weight || !height || !age) return;
    setLoading(true);
    try {
      let response;
      if (isEdit && userId) {
        response = await api.updateUser(userId, { name, weight, height, age });
      } else {
        response = await api.registerUser({ name, weight, height, age });
      }

      localStorage.setItem('user_id', response.data.id.toString());
      localStorage.setItem('user_name', response.data.name);
      localStorage.setItem('water_goal', response.data.water_goal_ml.toString());
      
      // Schedule/Update notifications
      await NotificationService.scheduleHourlyNotifications(0, response.data.water_goal_ml);

      router.push('/home', 'forward', 'replace');
    } catch (error) {
      console.error('Action failed', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="setup-content">
        {isEdit && (
          <div className="back-btn-container" onClick={() => router.push('/home', 'back')}>
            <IonIcon icon={arrowBackOutline} />
          </div>
        )}
        
        <div className="setup-container">
          <div className="water-logo">
            <IonIcon icon={waterOutline} />
          </div>
          <IonText color="light">
            <h1>{isEdit ? 'Editar Perfil' : 'WaterAlert'}</h1>
            <p>{isEdit ? 'Atualize seus dados para recalcular a meta' : 'Seus dados para calcularmos sua meta'}</p>
          </IonText>

          <div className="glass-card setup-form">
            <IonItem className="glass-item">
              <IonIcon icon={personOutline} slot="start" />
              <IonLabel position="floating">Nome</IonLabel>
              <IonInput value={name} onIonInput={(e) => setName(e.detail.value!)} />
            </IonItem>

            <IonItem className="glass-item">
              <IonIcon icon={barbellOutline} slot="start" />
              <IonLabel position="floating">Peso (kg)</IonLabel>
              <IonInput type="number" value={weight} onIonInput={(e) => setWeight(parseInt(e.detail.value!))} />
            </IonItem>

            <IonItem className="glass-item">
              <IonIcon icon={resizeOutline} slot="start" />
              <IonLabel position="floating">Altura (cm)</IonLabel>
              <IonInput type="number" value={height} onIonInput={(e) => setHeight(parseInt(e.detail.value!))} />
            </IonItem>

            <IonItem className="glass-item">
              <IonIcon icon={calendarOutline} slot="start" />
              <IonLabel position="floating">Idade</IonLabel>
              <IonInput type="number" value={age} onIonInput={(e) => setAge(parseInt(e.detail.value!))} />
            </IonItem>

            <IonButton expand="block" shape="round" className="setup-button" onClick={handleSave} disabled={loading}>
              {loading ? 'Salvando...' : (isEdit ? 'Salvar Alterações' : 'Começar Agora')}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Setup;
