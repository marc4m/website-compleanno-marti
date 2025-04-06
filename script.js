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

  const scriptURL = 'https://restless-morning-ac56.marcello-quattromani.workers.dev/';

  // Per memorizzare quale opzione ha votato l'utente
  function saveUserVote(optionId) {
    localStorage.setItem('userVote', optionId);
  }

  function getUserVote() {
    return localStorage.getItem('userVote');
  }

  function saveVote(optionId) {
    saveUserVote(optionId);

    fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify({ option: optionId }),
      headers: {
        "Content-Type": "application/json", // Cambia a application/json
      },
    })
      .then(response => response.json())
      .then(data => {
        console.log('✅ Voto salvato con successo');
        setTimeout(updateVoteCounts, 1000);
      })
      .catch(error => {
        console.error('❌ Errore nel salvataggio del voto:', error);
        setTimeout(updateVoteCounts, 1000);
      });
  }

  function getVotes() {
    return fetch(scriptURL)
      .then(response => response.json())
      .then(data => data)
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