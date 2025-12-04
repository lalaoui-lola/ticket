// Créer un son de notification simple avec Web Audio API
export const playNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    
    // Créer un oscillateur pour générer le son
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    // Configuration du son (double bip)
    oscillator.frequency.value = 800 // Fréquence en Hz
    oscillator.type = 'sine'
    
    // Premier bip
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.1)
    
    // Deuxième bip
    setTimeout(() => {
      const oscillator2 = audioContext.createOscillator()
      const gainNode2 = audioContext.createGain()
      
      oscillator2.connect(gainNode2)
      gainNode2.connect(audioContext.destination)
      
      oscillator2.frequency.value = 1000
      oscillator2.type = 'sine'
      
      gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1)
      
      oscillator2.start(audioContext.currentTime)
      oscillator2.stop(audioContext.currentTime + 0.1)
    }, 150)
    
  } catch (error) {
    console.error('Erreur lors de la lecture du son:', error)
  }
}
