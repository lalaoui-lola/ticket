import React, { useState, useEffect } from 'react';
import { 
  requestNotificationPermission, 
  notifyNewTicket, 
  notifyAdminAssigned, 
  notifyStatusChanged, 
  notifyNewComment 
} from './utils/desktopNotifications';

export default function NotificationTest() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  useEffect(() => {
    // Vérifier si les notifications sont activées
    const checkNotifications = async () => {
      const enabled = await requestNotificationPermission();
      setNotificationsEnabled(enabled);
    };
    
    checkNotifications();
  }, []);
  
  const handleEnableNotifications = async () => {
    const enabled = await requestNotificationPermission();
    setNotificationsEnabled(enabled);
  };
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black text-primary-800 mb-6">Test des notifications</h1>
      
      {!notificationsEnabled ? (
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="font-medium text-yellow-800 mb-2">
            Les notifications ne sont pas activées.
          </p>
          <button
            onClick={handleEnableNotifications}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700"
          >
            Activer les notifications
          </button>
        </div>
      ) : (
        <div className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg">
          <p className="font-medium text-green-800">
            Les notifications sont activées ! Vous pouvez tester les différentes notifications.
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-white rounded-xl shadow border border-neutral-200">
          <h2 className="text-xl font-bold text-primary-800 mb-4">Notifications de tickets</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => notifyNewTicket('Jean Dupont', 'Problème d\'imprimante')}
              className="w-full px-4 py-3 bg-accent-500 text-white rounded-lg font-bold hover:bg-accent-600"
            >
              Tester notification nouveau ticket
            </button>
            
            <button
              onClick={() => notifyAdminAssigned('Admin Support', 'Problème d\'imprimante')}
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
            >
              Tester notification admin assigné
            </button>
            
            <button
              onClick={() => notifyStatusChanged('Problème d\'imprimante', 'en_cours')}
              className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600"
            >
              Tester notification état modifié (en cours)
            </button>
            
            <button
              onClick={() => notifyStatusChanged('Problème d\'imprimante', 'resolu')}
              className="w-full px-4 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600"
            >
              Tester notification état modifié (résolu)
            </button>
            
            <button
              onClick={() => notifyNewComment('Support IT', 'Problème d\'imprimante', 'J\'ai redémarré l\'imprimante et cela semble fonctionner')}
              className="w-full px-4 py-3 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-600"
            >
              Tester notification commentaire
            </button>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-xl shadow border border-neutral-200">
          <h2 className="text-xl font-bold text-primary-800 mb-4">Instructions</h2>
          
          <ol className="list-decimal list-inside space-y-3 text-primary-700">
            <li className="font-medium">Cliquez sur "Activer les notifications" si ce n'est pas déjà fait.</li>
            <li className="font-medium">Testez chaque type de notification en cliquant sur les boutons.</li>
            <li className="font-medium">Vous devriez voir les notifications apparaître près de l'horloge en bas à droite de votre écran.</li>
            <li className="font-medium">Vous pouvez cliquer sur les notifications pour les fermer ou attendre qu'elles disparaissent automatiquement.</li>
          </ol>
          
          <p className="mt-6 text-sm text-primary-600">
            <strong>Note:</strong> Sur certains systèmes d'exploitation ou navigateurs, l'apparence des notifications peut varier.
            Assurez-vous que votre navigateur est configuré pour afficher les notifications.
          </p>
        </div>
      </div>
    </div>
  );
}
