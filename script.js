// Funzione per togglare il colore di sfondo
function toggleBackgroundColor() {
    const body = document.body;
    const btn = document.getElementById('bg-toggle-btn');
    
    // Aggiungiamo un log per il debug
    console.log('toggleBackgroundColor is called');
    
    // Controlliamo se il body ha la classe 'dark-mode'
    const isActive = body.classList.contains('dark-mode');
    
    // Se la classe 'dark-mode' è presente, rimuoviamola, altrimenti aggiungiamola
    if (isActive) {
        body.classList.remove('dark-mode');
        btn.classList.remove('active');
    } else {
        body.classList.add('dark-mode');
        btn.classList.add('active');
    }
}

