document.addEventListener('DOMContentLoaded', function () {
  // Funzione di Scroll Reveal
  function handleScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal:not(.revealed)'); 

    elements.forEach(element => {
      const position = element.getBoundingClientRect();

      // Se l'elemento è visibile (dentro la viewport)
      if (position.top < window.innerHeight * 0.9) {
        element.classList.add('revealed');
      }
    });
  }

  // Chiamata iniziale per rivelare gli elementi subito
  handleScrollReveal();

  // Ascolta lo scroll per rivelare gli elementi
  window.addEventListener('scroll', handleScrollReveal);

  const scriptURL = 'https://script.google.com/macros/s/AKfycbyzWCZbO2jh_SVfA7S9KX-fqIRU9ufAlGvB8cy9hR0-ZPeCxU4UbRSslFc4icZxlaE/exec';
  
  // Per memorizzare quale opzione ha votato l'utente
  function saveUserVote(optionId) {
    localStorage.setItem('userVote', optionId);
  }
  
  function getUserVote() {
    return localStorage.getItem('userVote');
  }

  function saveVote(optionId) {
    // Salviamo l'opzione votata dall'utente
    saveUserVote(optionId);
    
    // Invia il voto al server
    fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify({ option: optionId }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore nella risposta del server');
      }
      return response.text();
    })
    .then(data => {
      console.log('✅ Voto salvato con successo');
      // Aggiorna i conteggi dopo un breve ritardo
      setTimeout(updateVoteCounts, 1000);
    })
    .catch(error => {
      console.error('❌ Errore nel salvataggio del voto:', error);
      // Anche in caso di errore, aggiorniamo i conteggi
      setTimeout(updateVoteCounts, 1000);
    });
  }

  function getVotes() {
    return fetch(scriptURL)
      .then(response => {
        if (!response.ok) {
          throw new Error('Errore nella risposta del server');
        }
        return response.text();
      })
      .then(text => {
        try {
          return JSON.parse(text);
        } catch (e) {
          console.error('Errore nel parsing della risposta:', e);
          return {};
        }
      })
      .catch(err => {
        console.error('❌ Errore nel recupero dei voti:', err);
        return {};
      });
  }

  function updateVoteCounts() {
    getVotes()
      .then(votes => {
        // Aggiorna i conteggi dei voti per ogni opzione
        document.querySelectorAll('.poll-option').forEach(option => {
          const optionId = option.dataset.id;
          const voteCount = votes[optionId] || 0;
          const voteCountElement = option.querySelector('.vote-count');
          
          voteCountElement.textContent = `${voteCount} ${voteCount === 1 ? 'voto' : 'voti'}`;
          voteCountElement.dataset.count = voteCount;
          
          // Evidenzia l'opzione selezionata dall'utente
          if (optionId === getUserVote()) {
            option.classList.add('selected');
            option.querySelector('.vote-button').classList.add('voted');
            option.querySelector('.vote-button').textContent = 'Votato';
          }
        });
      });
  }

  // Inizializzazione
  updateVoteCounts();
  
  // Verifica se l'utente ha già votato
  const userVote = getUserVote();
  if (userVote) {
    document.querySelectorAll('.vote-button').forEach(btn => {
      btn.classList.add('disabled');
      if (btn.closest('.poll-option').dataset.id === userVote) {
        btn.textContent = 'Votato';
        btn.classList.add('voted');
      }
    });
  }

  // ✅ Gestione click sui bottoni
  document.querySelectorAll('.vote-button').forEach(button => {
    button.addEventListener('click', (event) => {
      // Se l'utente ha già votato, non fare nulla
      if (getUserVote()) return;
      
      const pollOption = event.target.closest('.poll-option');
      const optionId = pollOption.dataset.id;

      // Salva il voto
      saveVote(optionId);

      // Effetto visuale
      pollOption.classList.add('selected');
      
      // Disabilitiamo tutti i pulsanti dopo il voto
      document.querySelectorAll('.vote-button').forEach(btn => {
        btn.classList.add('disabled');
        if (btn === event.target) {
          btn.classList.add('voted');
          btn.textContent = 'Votato';
        }
      });

      const toast = document.getElementById('vote-toast');
      toast.classList.add('show');
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    });
  });
  
  // Aggiorna i conteggi ogni 30 secondi
  setInterval(updateVoteCounts, 30000);
});