// Système de son amélioré avec différentes tonalités selon le type de notification

// Configuration des sons
const SOUNDS = {
  default: { frequency: 800, duration: 100, type: 'sine' },
  new_ticket: { frequency: [800, 1000], duration: 100, type: 'sine', gap: 150, volume: 0.4 },
  admin_assigned: { frequency: [600, 800, 1000], duration: 80, type: 'sine', gap: 100, volume: 0.3 },
  ticket_update: { frequency: [700, 900], duration: 120, type: 'sine', gap: 100, volume: 0.3 },
  comment: { frequency: 600, duration: 50, type: 'sine', repeat: 3, gap: 50, volume: 0.2 }
};

/**
 * Joue un son de notification selon le type spécifié
 * @param {string} type - Type de notification ('new_ticket', 'admin_assigned', 'ticket_update', 'comment')
 */
export const playNotificationSound = (type = 'default') => {
  try {
    // Vérifier si le navigateur prend en charge Web Audio API
    if (!window.AudioContext && !window.webkitAudioContext) {
      console.warn('Web Audio API non prise en charge par ce navigateur.');
      return;
    }

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const soundConfig = SOUNDS[type] || SOUNDS.default;
    
    // Si plusieurs fréquences, jouer séquentiellement
    if (Array.isArray(soundConfig.frequency)) {
      playSequence(audioContext, soundConfig);
    } else if (soundConfig.repeat) {
      // Si répétition, jouer plusieurs fois
      playRepeated(audioContext, soundConfig);
    } else {
      // Jouer un son simple
      playTone(audioContext, soundConfig.frequency, soundConfig.duration, soundConfig.type, soundConfig.volume || 0.3);
    }
  } catch (error) {
    console.error('Erreur lors de la lecture du son:', error);
  }
};

/**
 * Joue une séquence de sons
 * @param {AudioContext} context - Contexte audio
 * @param {Object} config - Configuration du son
 */
const playSequence = (context, config) => {
  const frequencies = config.frequency;
  
  frequencies.forEach((freq, index) => {
    setTimeout(() => {
      playTone(context, freq, config.duration, config.type, config.volume || 0.3);
    }, index * (config.duration + (config.gap || 100)));
  });
};

/**
 * Joue un son répété plusieurs fois
 * @param {AudioContext} context - Contexte audio
 * @param {Object} config - Configuration du son
 */
const playRepeated = (context, config) => {
  for (let i = 0; i < config.repeat; i++) {
    setTimeout(() => {
      playTone(context, config.frequency, config.duration, config.type, config.volume || 0.3);
    }, i * (config.duration + (config.gap || 50)));
  }
};

/**
 * Joue une tonalité simple
 * @param {AudioContext} context - Contexte audio
 * @param {number} frequency - Fréquence en Hz
 * @param {number} duration - Durée en ms
 * @param {string} type - Type d'oscillateur ('sine', 'square', 'sawtooth', 'triangle')
 * @param {number} volume - Volume (0-1)
 */
const playTone = (context, frequency, duration, type = 'sine', volume = 0.3) => {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(context.destination);
  
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  
  gainNode.gain.setValueAtTime(volume, context.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);
  
  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + duration / 1000);
};

/**
 * Fonction pour permettre d'activer l'audio lors d'une interaction utilisateur
 * (nécessaire sur certains navigateurs qui bloquent l'autoplay)
 */
export const initAudio = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  // Créer un oscillateur silencieux de 1ms juste pour initialiser l'audio
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  gainNode.gain.setValueAtTime(0.001, audioContext.currentTime); // Presque silencieux
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.001);
};

// Exemples d'utilisation:
// import { playNotificationSound, initAudio } from '../utils/improvedSound';
//
// // Initialiser l'audio lors du clic sur un bouton
// useEffect(() => {
//   const handleUserInteraction = () => {
//     initAudio();
//     document.removeEventListener('click', handleUserInteraction);
//   };
//   document.addEventListener('click', handleUserInteraction);
// }, []);
//
// // Jouer différents sons selon le type de notification
// playNotificationSound('new_ticket');     // Double bip pour nouveau ticket
// playNotificationSound('admin_assigned'); // Séquence de trois tons pour assignation
// playNotificationSound('ticket_update');  // Double bip différent pour mise à jour
// playNotificationSound('comment');        // Triple bip court pour commentaire
