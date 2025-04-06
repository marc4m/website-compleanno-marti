document.addEventListener('DOMContentLoaded', function () {
  console.log('[DOMContentLoaded] Inizio');

  // Funzione di Scroll Reveal
  function handleScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal:not(.revealed)');
    elements.forEach(element => {
      const position = element.getBoundingClientRect();
      if (position.top < window.innerHeight * 0.9) {
        element.classList.add('revealed');
      }
    });
  }

  handleScrollReveal();
  window.addEventListener('scroll', handleScrollReveal);

  const scriptURL = 'https://restless-morning-ac56.marcello-quattromani.workers.dev';

  function saveUserVote(optionId) {
    localStorage.setItem('userVote', optionId);
    console.log(`[saveUserVote] Voto salvato in localStorage: ${optionId}`);
  }

  function getUserVote() {
    const vote = localStorage.getItem('userVote');
    console.log(`[getUserVote] Voto recuperato: ${vote}`);
    return vote;
  }

  function saveVote(optionId) {
    console.log(`[saveVote] Inizio per ${optionId}`);
    saveUserVote(optionId);

    return fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify({ option: optionId }),
      headers: { "Content-Type": "application/json" },
    })
      .then(response => {
        console.log(`[saveVote] Risposta ricevuta: ${response.status}`);
        if (!response.ok) throw new Error('Risposta non OK');
        return response.json();
      })
      .then(data => {
        console.log(`[saveVote] Successo:`, data);
        setTimeout(updateVoteCounts, 1000);
      })
      .catch(error => {
        console.error(`[saveVote] Errore:`, error);
        setTimeout(updateVoteCounts, 1000);
      });
  }

  function getVotes() {
    console.log('[getVotes] Inizio');
    return fetch(scriptURL)
      .then(response => {
        console.log(`[getVotes] Risposta ricevuta: ${response.status}`);
        if (!response.ok) throw new Error('Risposta non OK');
        return response.json();
      })
      .then(data => {
        console.log('[getVotes] Dati ricevuti:', data);
        return data;
      })
      .catch(err => {
        console.error('[getVotes] Errore:', err);
        return {};
      });
  }

  function updateVoteCounts() {
    console.log('[updateVoteCounts] Inizio');
    getVotes()
      .then(votes => {
        console.log('[updateVoteCounts] Voti ricevuti:', votes);
        document.querySelectorAll('.poll-option').forEach(option => {
          const optionId = option.dataset.id;
          const voteCount = votes[optionId] || 0;
          const voteCountElement = option.querySelector('.vote-count');
          voteCountElement.textContent = `${voteCount} ${voteCount === 1 ? 'voto' : 'voti'}`;
          voteCountElement.dataset.count = voteCount;

          if (optionId === getUserVote()) {
            option.classList.add('selected');
            option.querySelector('.vote-button').classList.add('voted');
            option.querySelector('.vote-button').textContent = 'Votato';
          }
        });
        console.log('[updateVoteCounts] Fine');
      })
      .catch(err => {
        console.error('[updateVoteCounts] Errore:', err);
      });
  }

  // Inizializzazione
  console.log('[DOMContentLoaded] Avvio updateVoteCounts');
  updateVoteCounts();

  const userVote = getUserVote();
  if (userVote) {
    console.log('[DOMContentLoaded] Utente ha già votato:', userVote);
    document.querySelectorAll('.vote-button').forEach(btn => {
      btn.classList.add('disabled');
      if (btn.closest('.poll-option').dataset.id === userVote) {
        btn.textContent = 'Votato';
        btn.classList.add('voted');
      }
    });
  }

  document.querySelectorAll('.vote-button').forEach(button => {
    button.addEventListener('click', (event) => {
      console.log('[vote-button] Click, voto esistente:', getUserVote());
      if (getUserVote()) {
        const toast = document.getElementById('already-vote-toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
        return;
      }

      const pollOption = event.target.closest('.poll-option');
      const optionId = pollOption.dataset.id;
      console.log('[vote-button] Voto per:', optionId);

      saveVote(optionId);

      pollOption.classList.add('selected');
      document.querySelectorAll('.vote-button').forEach(btn => {
        btn.classList.add('disabled');
        if (btn === event.target) {
          btn.classList.add('voted');
          btn.textContent = 'Votato';
        }
      });

      const toast = document.getElementById('vote-toast');
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3000);
    });
  });

  setInterval(() => {
    console.log('[setInterval] Aggiornamento periodico');
    updateVoteCounts();
  }, 30000);

  console.log('[DOMContentLoaded] Fine');
});