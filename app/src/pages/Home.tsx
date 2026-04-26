import React, { useState } from 'react';
import { LuGlassWater } from 'react-icons/lu';
import { IonContent, IonPage, IonText, IonIcon, IonLabel, useIonViewWillEnter, useIonRouter, IonToast, IonAlert, IonModal, IonButton, IonInput, IonItem, IonToggle } from '@ionic/react';
import { addOutline, wineOutline, colorFillOutline, waterOutline, settingsOutline, refreshOutline, timeOutline, checkmarkCircleOutline, trophyOutline, cafeOutline, beerOutline, flaskOutline } from 'ionicons/icons';
import { api } from '../api/client';
import { NotificationService } from '../services/notificationService';
import './Home.css';

const Home: React.FC = () => {
  const router = useIonRouter();
  const [totalConsumed, setTotalConsumed] = useState(0);
  const [goal, setGoal] = useState(0);
  const [name, setName] = useState('');
  const [showResetToast, setShowResetToast] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const [customShortcuts, setCustomShortcuts] = useState<{id: string, amount: number, icon: string}[]>([]);
  
  // New intake modal state
  const [newAmount, setNewAmount] = useState<string>('');
  const [selectedIcon, setSelectedIcon] = useState('water');
  const [saveShortcut, setSaveShortcut] = useState(false);

  const userId = localStorage.getItem('user_id');

  const iconMap: {[key: string]: any} = {
    water: waterOutline,
    glass: wineOutline,
    coffee: cafeOutline,
    beer: beerOutline,
    flask: flaskOutline,
    custom: LuGlassWater
  };

  const fetchData = async () => {
    try {
      const progressRes = await api.getProgress();
      const consumed = progressRes.data.total_consumed;
      setTotalConsumed(consumed);
      
      const savedGoal = localStorage.getItem('water_goal');
      const savedName = localStorage.getItem('user_name');
      
      const goalVal = parseInt(savedGoal || '2000');
      setGoal(goalVal);
      setName(savedName || 'Usuário');

      // Update notifications with current progress
      NotificationService.scheduleHourlyNotifications(consumed, goalVal);

      // Load shortcuts
      const savedShortcuts = localStorage.getItem('custom_shortcuts');
      if (savedShortcuts) {
        setCustomShortcuts(JSON.parse(savedShortcuts));
      }

      // Check if goal reached for the first time
      const currentConsumed = progressRes.data.total_consumed;
      const currentGoal = parseInt(savedGoal || '2000');
      if (currentConsumed >= currentGoal && !hasCelebrated) {
        setShowGoalModal(true);
        setHasCelebrated(true);
      }
    } catch (error) {
      console.error('Failed to fetch progress', error);
    }
  };

  useIonViewWillEnter(() => {
    fetchData();
  });

  const playSound = () => {
    const audio = new Audio('/water-sound.mp3');
    audio.play().catch(e => console.error("Error playing sound", e));
  };

  const addWater = async (amount: number) => {
    try {
      await api.logIntake(amount);
      playSound();
      fetchData();
      
      // Reset celebration if more water is added after target
      const savedGoal = parseInt(localStorage.getItem('water_goal') || '2000');
      if ((totalConsumed + amount) < savedGoal) {
        setHasCelebrated(false);
      }
    } catch (error) {
      console.error('Failed to log intake', error);
      alert('Erro de conexão com o servidor. Verifique se o backend está rodando!');
    }
  };

  const restartDay = async () => {
    try {
      await api.resetProgress();
      setShowResetToast(true);
      setHasCelebrated(false);
      fetchData();
    } catch (error) {
      console.error('Failed to reset day', error);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login', 'root', 'replace');
  };

  const handleCustomAdd = async () => {
    const amount = parseInt(newAmount);
    if (isNaN(amount) || amount <= 0) return;

    await addWater(amount);

    if (saveShortcut) {
      const newShortcut = {
        id: Date.now().toString(),
        amount,
        icon: selectedIcon
      };
      const updatedShortcuts = [...customShortcuts, newShortcut];
      setCustomShortcuts(updatedShortcuts);
      localStorage.setItem('custom_shortcuts', JSON.stringify(updatedShortcuts));
    }

    setShowCustomAlert(false);
    setNewAmount('');
    setSaveShortcut(false);
  };

  const removeShortcut = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customShortcuts.filter(s => s.id !== id);
    setCustomShortcuts(updated);
    localStorage.setItem('custom_shortcuts', JSON.stringify(updated));
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
                <div className="action-icon-btn" onClick={handleLogout}>
                  <IonIcon icon={lockClosedOutline} />
                </div>
                <div className="action-icon-btn" onClick={() => router.push('/setup')}>
                  <IonIcon icon={settingsOutline} />
                </div>
              </div>
            </div>
          </div>

          <div className="progress-circle-container">
            <div className="drop-container" style={{ '--percentage': `${percentage}`, '--percentage-neg': `${-percentage}` } as any}>
              <svg viewBox="0 0 100 100" className="drop-svg">
                <defs>
                  <clipPath id="dropClip">
                    <path d="M50 0C50 0 20 40 20 70a30 30 0 0 0 60 0c0-30-30-70-30-70z" />
                  </clipPath>
                </defs>
                
                {/* Background Drop */}
                <path d="M50 0C50 0 20 40 20 70a30 30 0 0 0 60 0c0-30-30-70-30-70z" 
                      fill="rgba(255, 255, 255, 0.1)" 
                      stroke="rgba(255, 255, 255, 0.2)" 
                      strokeWidth="1" />
                
                {/* Water Fill */}
                <g clipPath="url(#dropClip)">
                  <rect x="0" y={100 - percentage} width="100" height="100" fill="#00B4DB" className="water-rect" />
                  <path d="M0 100 Q 25 95, 50 100 T 100 100 V 110 H 0 Z" 
                        fill="rgba(255,255,255,0.3)" 
                        className="water-wave-svg"
                        style={{ transform: `translateY(${-percentage}px)` } as any} />
                </g>
              </svg>

              <div className="progress-inner drop-text">
                <IonIcon icon={waterOutline} className="water-icon-large" />
                <IonText>
                  <h1>{totalConsumed}ml</h1>
                  <p>de {goal}ml</p>
                </IonText>
              </div>
            </div>
          </div>

          <div className="quick-actions">
            <div className="glass-card action-card add-btn" onClick={() => setShowCustomAlert(true)}>
              <IonIcon icon={addOutline} />
              <IonLabel>Novo</IonLabel>
            </div>
            
            <div className="glass-card action-card" onClick={() => addWater(180)}>
              <LuGlassWater size={32} color="white" />
              <IonLabel>180ml</IonLabel>
            </div>

            {customShortcuts.map(shortcut => (
              <div key={shortcut.id} className="glass-card action-card shortcut-card" onClick={() => addWater(shortcut.amount)}>
                <div className="remove-btn" onClick={(e) => removeShortcut(shortcut.id, e)}>×</div>
                {shortcut.icon === 'custom' ? 
                  <LuGlassWater size={32} color="white" /> : 
                  <IonIcon icon={iconMap[shortcut.icon] || waterOutline} />
                }
                <IonLabel>{shortcut.amount}ml</IonLabel>
              </div>
            ))}
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

        <IonModal 
          isOpen={showCustomAlert} 
          onDidDismiss={() => setShowCustomAlert(false)}
          className="custom-intake-modal"
        >
          <div className="modal-container">
            <div className="modal-header">
              <h3>Novo Registro</h3>
              <p>Escolha a quantidade e o ícone</p>
            </div>

            <div className="modal-body">
              <div className="input-section">
                <IonLabel>Quantidade (ml)</IonLabel>
                <IonInput 
                  type="number" 
                  value={newAmount} 
                  placeholder="Ex: 300"
                  onIonChange={e => setNewAmount(e.detail.value!)}
                  className="custom-input"
                />
              </div>

              <div className="icon-section">
                <IonLabel>Escolha um Ícone</IonLabel>
                <div className="icon-grid">
                  {Object.keys(iconMap).map(key => (
                    <div 
                      key={key} 
                      className={`icon-option ${selectedIcon === key ? 'active' : ''}`}
                      onClick={() => setSelectedIcon(key)}
                    >
                      {key === 'custom' ? <LuGlassWater /> : <IonIcon icon={iconMap[key]} />}
                    </div>
                  ))}
                </div>
              </div>

              <IonItem lines="none" className="toggle-item">
                <IonLabel>Salvar como atalho</IonLabel>
                <IonToggle 
                  checked={saveShortcut} 
                  onIonChange={e => setSaveShortcut(e.detail.checked)} 
                />
              </IonItem>
            </div>

            <div className="modal-footer">
              <IonButton fill="clear" onClick={() => setShowCustomAlert(false)}>Cancelar</IonButton>
              <IonButton className="main-btn" onClick={handleCustomAdd}>Beber</IonButton>
            </div>
          </div>
        </IonModal>

        <IonModal isOpen={showGoalModal} onDidDismiss={() => setShowGoalModal(false)} className="goal-modal">
          <div className="modal-content">
            <IonIcon icon={trophyOutline} className="trophy-icon" />
            <h2>Parabéns, {name}!</h2>
            <p>Você atingiu sua meta de hidratação hoje!</p>
            <IonButton expand="block" onClick={() => setShowGoalModal(false)}>Continuar</IonButton>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
