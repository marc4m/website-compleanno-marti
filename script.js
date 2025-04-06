document.addEventListener('DOMContentLoaded', function () {
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
  }

  function getUserVote() {
    return localStorage.getItem('userVote');
  }

  function saveVote(optionId) {
    saveUserVote(optionId);

    // Aggiorna il contatore localmente prima della richiesta al server
    const pollOption = document.querySelector(`.poll-option[data-id="${optionId}"]`);
    const voteCountElement = pollOption.querySelector('.vote-count');
    const currentCount = parseInt(voteCountElement.dataset.count) || 0;
    voteCountElement.textContent = `${currentCount + 1} ${currentCount + 1 === 1 ? 'voto' : 'voti'}`;
    voteCountElement.dataset.count = currentCount + 1;

    fetch(scriptURL, {
      method: "POST",
      body: JSON.stringify({ option: optionId }),
      headers: { "Content-Type": "application/json" },
    })
      .then(response => {
        if (!response.ok) throw new Error('Errore nella risposta del server');
        return response.json();
      })
      .then(data => {
        console.log('✅ Voto salvato con successo:', data);
        updateVoteCounts(); // Aggiorna dal server immediatamente
      })
      .catch(error => {
        console.error('❌ Errore nel salvataggio del voto:', error);
        updateVoteCounts(); // Aggiorna comunque per sincronizzare
      });
  }

  function getVotes() {
    return fetch(scriptURL)
      .then(response => {
        if (!response.ok) throw new Error('Errore nella risposta del server');
        return response.json();
      })
      .then(data => data)
      .catch(err => {
        console.error('❌ Errore nel recupero dei voti:', err);
        return {};
      });
  }

  function updateVoteCounts() {
    getVotes()
      .then(votes => {
        document.querySelectorAll('.poll-option').forEach(option => {
          const optionId = option.dataset.id;
          const voteCount = votes[optionId] || 0;
          const voteCountElement = option.querySelector('.vote-count');
          voteCountElement.textContent = `${voteCount} ${voteCount === 1 ? 'voto' : 'voti'}`;
          voteCountElement.dataset.count = voteCount;

          if (optionId === getUserVote()) {
            option.classList.add('selected');
            option.querySelector('.vote-button').classList.add('votedFAST');
            option.querySelector('.vote-button').textContent = 'Votato';
          }
        });
      });
  }

  // Inizializzazione
  updateVoteCounts();

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

  document.querySelectorAll('.vote-button').forEach(button => {
    button.addEventListener('click', (event) => {
      if (getUserVote()) {
        const toast = document.getElementById('already-vote-toast');
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
        return;
      }

      const pollOption = event.target.closest('.poll-option');
      const optionId = pollOption.dataset.id;

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

  setInterval(updateVoteCounts, 30000);
});