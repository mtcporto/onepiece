/**
 * Módulo para a lógica do jogo de Trunfo de One Piece
 */

class TrumpGame {
  constructor() {
    // Arrays e estado do jogo
    this.allCharacters = [];
    this.playerDeck = [];
    this.computerDeck = [];
    this.currentPlayerCard = null;
    this.currentComputerCard = null;
    this.selectedAttribute = null;
    this.playerScore = 0;
    this.computerScore = 0;
    this.gameOver = false;
    this.roundCount = 0;
    this.soundEnabled = true;
    this.animationsEnabled = true;
    
    // Referências de DOM
    this.loadingElement = document.getElementById('loading');
    this.errorMessageElement = document.getElementById('error-message');
    this.loadFallbackElement = document.getElementById('load-fallback');
    this.loadFallbackButton = document.getElementById('load-fallback-btn');
    this.gameContentElement = document.getElementById('game-content');
    this.playerCardElement = document.getElementById('player-card');
    this.computerCardElement = document.getElementById('computer-card');
    this.playerScoreElement = document.getElementById('player-score');
    this.computerScoreElement = document.getElementById('computer-score');
    this.playerCardsCountElement = document.getElementById('player-cards-count');
    this.computerCardsCountElement = document.getElementById('computer-cards-count');
    this.gameStatusElement = document.getElementById('game-status');
    this.playButton = document.getElementById('play-btn');
    this.nextButton = document.getElementById('next-btn');
    this.restartButton = document.getElementById('restart-btn');
    
    // Inicialização de sons
    this.sounds = {
      cardFlip: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-quick-paper-flick-1495.mp3'),
      win: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3'),
      lose: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-drum-joke-accent-579.mp3'),
      draw: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-arcade-mechanical-bling-210.mp3'),
      gameOver: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-game-level-completed-2059.mp3'),
      click: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-select-click-1109.mp3')
    };
    
    // Pré-carrega os sons e define volume
    Object.values(this.sounds).forEach(sound => {
      sound.load();
      sound.volume = 0.5;
    });
    
    // Bind de métodos
    this.init = this.init.bind(this);
    this.startGame = this.startGame.bind(this);
    this.showNextCards = this.showNextCards.bind(this);
    this.renderCard = this.renderCard.bind(this);
    this.selectAttribute = this.selectAttribute.bind(this);
    this.playRound = this.playRound.bind(this);
    this.updateCardCount = this.updateCardCount.bind(this);
    this.endGame = this.endGame.bind(this);
    this.restartGame = this.restartGame.bind(this);
    this.showLoading = this.showLoading.bind(this);
    this.showErrorMessage = this.showErrorMessage.bind(this);
    this.hideErrorMessage = this.hideErrorMessage.bind(this);
    this.showFallbackButton = this.showFallbackButton.bind(this);
    this.hideFallbackButton = this.hideFallbackButton.bind(this);
    this.showGameContent = this.showGameContent.bind(this);
    this.useFallbackData = this.useFallbackData.bind(this);
    this.useFallbackDataAutomatically = this.useFallbackDataAutomatically.bind(this);
    this.playSound = this.playSound.bind(this);
    this.toggleSound = this.toggleSound.bind(this);
    this.toggleAnimations = this.toggleAnimations.bind(this);
    this.clearCache = this.clearCache.bind(this);
    
    // Event listeners
    this.playButton.addEventListener('click', this.playRound);
    this.nextButton.addEventListener('click', this.showNextCards);
    this.restartButton.addEventListener('click', this.restartGame);
    this.loadFallbackButton.addEventListener('click', this.useFallbackData);
    
    // Adiciona elementos de controle para som, animações e cache
    this.addGameControls();
    
    // Inicializa teclas de atalho
    this.setupKeyboardShortcuts();
  }
  
  /**
   * Adiciona controles de jogo para som, animações e cache
   */
  addGameControls() {
    // Cria o contêiner para os controles
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'game-controls';
    controlsContainer.innerHTML = `
      <button id="sound-toggle" class="icon-button" aria-label="Desativar som">
        <i class="fas fa-volume-up"></i>
      </button>
      <button id="animation-toggle" class="icon-button" aria-label="Desativar animações">
        <i class="fas fa-film"></i>
      </button>
      <button id="clear-cache" class="icon-button" aria-label="Limpar cache">
        <i class="fas fa-sync-alt"></i>
      </button>
    `;
    
    // Adiciona à página após o título
    const title = document.querySelector('h1');
    title.parentNode.insertBefore(controlsContainer, title.nextSibling);
    
    // Adiciona event listeners
    document.getElementById('sound-toggle').addEventListener('click', this.toggleSound);
    document.getElementById('animation-toggle').addEventListener('click', this.toggleAnimations);
    document.getElementById('clear-cache').addEventListener('click', this.clearCache);
    
    // Adiciona Font Awesome para ícones
    if (!document.getElementById('font-awesome')) {
      const fontAwesome = document.createElement('link');
      fontAwesome.id = 'font-awesome';
      fontAwesome.rel = 'stylesheet';
      fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
      document.head.appendChild(fontAwesome);
      
      // Adiciona estilos para os botões de ícone
      const style = document.createElement('style');
      style.textContent = `
        .game-controls {
          text-align: center;
          margin-bottom: 15px;
        }
        .icon-button {
          background-color: rgba(233, 69, 96, 0.2);
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin: 0 5px;
          cursor: pointer;
          transition: all 0.3s;
          color: white;
        }
        .icon-button:hover {
          background-color: var(--primary-color);
          transform: scale(1.1);
        }
        .icon-button.disabled {
          background-color: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.5);
        }
      `;
      document.head.appendChild(style);
    }
  }
  
  /**
   * Configura teclas de atalho para o jogo
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Previne manipulação em campos de entrada
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case ' ': // Espaço
        case 'Enter':
          if (!this.playButton.classList.contains('hidden') && !this.playButton.disabled) {
            e.preventDefault();
            this.playRound();
          } else if (!this.nextButton.classList.contains('hidden')) {
            e.preventDefault();
            this.showNextCards();
          } else if (!this.restartButton.classList.contains('hidden')) {
            e.preventDefault();
            this.restartGame();
          }
          break;
        case 'r':
        case 'R':
          if (!this.restartButton.classList.contains('hidden')) {
            e.preventDefault();
            this.restartGame();
          }
          break;
        case 'm':
        case 'M':
          this.toggleSound();
          break;
        case '1':
        case '2':
        case '3':
          // Seleciona atributos pelos números
          if (this.currentPlayerCard) {
            const attrIndex = parseInt(e.key) - 1;
            const attributes = ['strength', 'intelligence', 'speed'];
            if (attrIndex >= 0 && attrIndex < attributes.length) {
              this.selectAttribute(attributes[attrIndex]);
            }
          }
          break;
      }
    });
  }
  
  /**
   * Reproduz um som se estiver habilitado
   * @param {string} soundName - Nome do som a reproduzir
   */
  playSound(soundName) {
    if (this.soundEnabled && this.sounds[soundName]) {
      // Clona o som para permitir sobreposição
      const sound = this.sounds[soundName].cloneNode();
      sound.volume = this.sounds[soundName].volume;
      sound.play().catch(e => console.log('Erro ao reproduzir som:', e));
    }
  }
  
  /**
   * Alterna o estado de som (ligado/desligado)
   */
  toggleSound() {
    this.soundEnabled = !this.soundEnabled;
    const button = document.getElementById('sound-toggle');
    const icon = button.querySelector('i');
    
    if (this.soundEnabled) {
      icon.className = 'fas fa-volume-up';
      button.setAttribute('aria-label', 'Desativar som');
      button.classList.remove('disabled');
    } else {
      icon.className = 'fas fa-volume-mute';
      button.setAttribute('aria-label', 'Ativar som');
      button.classList.add('disabled');
    }
    
    // Efeito de feedback
    button.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.2)' },
      { transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'ease-in-out'
    });
    
    // Som de clique
    if (this.soundEnabled) {
      this.playSound('click');
    }
  }
  
  /**
   * Alterna o estado das animações (ligadas/desligadas)
   */
  toggleAnimations() {
    this.animationsEnabled = !this.animationsEnabled;
    const button = document.getElementById('animation-toggle');
    const icon = button.querySelector('i');
    
    if (this.animationsEnabled) {
      icon.className = 'fas fa-film';
      button.setAttribute('aria-label', 'Desativar animações');
      button.classList.remove('disabled');
      document.body.classList.remove('reduced-motion');
    } else {
      icon.className = 'fas fa-edit';
      button.setAttribute('aria-label', 'Ativar animações');
      button.classList.add('disabled');
      document.body.classList.add('reduced-motion');
    }
    
    // Efeito de feedback
    button.animate([
      { transform: 'scale(1)' },
      { transform: 'scale(1.2)' },
      { transform: 'scale(1)' }
    ], {
      duration: 300,
      easing: 'ease-in-out'
    });
    
    this.playSound('click');
  }
  
  /**
   * Limpa o cache do jogo
   */
  clearCache() {
    const success = CharacterService.clearCache();
    const button = document.getElementById('clear-cache');
    
    // Animação de rotação
    button.animate([
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(360deg)' }
    ], {
      duration: 500,
      easing: 'ease-in-out'
    });
    
    // Feedback visual
    if (success) {
      this.showTemporaryMessage('Cache limpo com sucesso!');
    } else {
      this.showTemporaryMessage('Erro ao limpar cache.', true);
    }
    
    this.playSound('click');
  }
  
  /**
   * Mostra uma mensagem temporária
   * @param {string} message - Mensagem a exibir
   * @param {boolean} isError - Se é uma mensagem de erro
   */
  showTemporaryMessage(message, isError = false) {
    const messageElement = document.createElement('div');
    messageElement.className = isError ? 'temporary-message error' : 'temporary-message success';
    messageElement.textContent = message;
    
    document.body.appendChild(messageElement);
    
    // Animação de entrada e saída
    messageElement.animate([
      { opacity: 0, transform: 'translateY(-20px)' },
      { opacity: 1, transform: 'translateY(0)' },
      { opacity: 1, transform: 'translateY(0)', offset: 0.8 },
      { opacity: 0, transform: 'translateY(-20px)' }
    ], {
      duration: 2000,
      easing: 'ease-in-out'
    }).onfinish = () => {
      messageElement.remove();
    };
  }
  
  /**
   * Inicializa o jogo
   */
  init() {
    // Adiciona estilo para mensagens temporárias
    if (!document.getElementById('temp-message-style')) {
      const style = document.createElement('style');
      style.id = 'temp-message-style';
      style.textContent = `
        .temporary-message {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          padding: 10px 20px;
          border-radius: 5px;
          z-index: 1000;
          color: white;
          font-weight: bold;
          box-shadow: 0 3px 6px rgba(0,0,0,0.2);
        }
        .temporary-message.success {
          background-color: rgba(46, 204, 113, 0.9);
        }
        .temporary-message.error {
          background-color: rgba(231, 76, 60, 0.9);
        }
        .reduced-motion * {
          animation-duration: 0.001ms !important;
          transition-duration: 0.001ms !important;
        }
      `;
      document.head.appendChild(style);
    }
    
    // Configuração para imagens que não carregam
    window.addEventListener('error', (e) => {
      if (e.target.tagName === 'IMG') {
        e.target.src = 'https://via.placeholder.com/200x300?text=Sem+Imagem';
      }
    }, true);
    
    this.showLoading(true);
    this.gameStatusElement.textContent = "Carregando jogo...";
    
    // Testa conexão com a API antes de iniciar
    CharacterService.testApiConnection(
      // Callback para quando a API está disponível
      () => {
        this.loadCharactersFromAPI();
      },
      // Callback para quando a API está indisponível
      (error) => {
        console.log("APIs indisponíveis, usando dados locais automaticamente");
        this.showErrorMessage('APIs do One Piece não estão acessíveis. Usando dados locais.');
        this.useFallbackDataAutomatically();
      }
    );
  }
  
  /**
   * Carrega os personagens da API
   */
  loadCharactersFromAPI() {
    CharacterService.fetchCharacters(
      // Callback para início do carregamento
      () => {
        this.showLoading(true);
        this.hideErrorMessage();
      },
      // Callback para erro
      (errorMessage) => {
        this.showErrorMessage(errorMessage);
        this.showFallbackButton();
        this.showLoading(false);
      },
      // Callback para sucesso
      (characters) => {
        if (characters && characters.length >= 10) {
          this.allCharacters = characters;
          this.startGame();
        } else {
          this.showErrorMessage('Poucos personagens retornados. Usando dados de backup.');
          this.useFallbackDataAutomatically();
        }
        this.showLoading(false);
      }
    );
  }
  
  /**
   * Usa os dados de backup em vez da API (com clique do usuário)
   */
  useFallbackData() {
    this.hideErrorMessage();
    this.hideFallbackButton();
    this.useFallbackDataAutomatically();
  }
  
  /**
   * Usa os dados de backup automaticamente
   */
  useFallbackDataAutomatically() {
    this.hideErrorMessage();
    this.hideFallbackButton();
    
    this.allCharacters = CharacterService.getBackupCharacters();
    this.startGame();
  }
  
  /**
   * Inicia o jogo
   */
  startGame() {
    // Certifique-se de que temos personagens suficientes
    if (!this.allCharacters || this.allCharacters.length < 4) {
      this.showErrorMessage('Não foi possível iniciar o jogo: poucos personagens disponíveis.');
      this.showFallbackButton();
      return;
    }
    
    this.showGameContent();
    
    // Resetar o estado do jogo
    this.playerScore = 0;
    this.computerScore = 0;
    this.gameOver = false;
    this.roundCount = 0;
    
    this.playerScoreElement.textContent = "0";
    this.computerScoreElement.textContent = "0";
    
    // Embaralha os personagens
    const shuffledCharacters = [...this.allCharacters].sort(() => 0.5 - Math.random());
    
    // Divide os personagens entre jogador e computador
    const halfLength = Math.floor(shuffledCharacters.length / 2);
    this.playerDeck = shuffledCharacters.slice(0, halfLength);
    this.computerDeck = shuffledCharacters.slice(halfLength);
    
    // Atualiza a contagem de cartas
    this.updateCardCount();
    
    // Mostra a primeira carta do jogador
    this.showNextCards();
    
    this.gameStatusElement.textContent = "Selecione um atributo para jogar!";
    this.playButton.disabled = true;
    
    // Certifique-se de que os botões estejam no estado correto
    this.playButton.classList.remove('hidden');
    this.nextButton.classList.add('hidden');
    this.restartButton.classList.add('hidden');
    
    // Anuncia o início do jogo para leitores de tela
    this.announceForScreenReaders('Jogo iniciado. Selecione um atributo para jogar.');
  }
  
  /**
   * Anuncia mensagens para leitores de tela
   * @param {string} message - Mensagem para anunciar
   */
  announceForScreenReaders(message) {
    // Cria ou atualiza o elemento de anúncio live
    let announcer = document.getElementById('screen-reader-announcer');
    if (!announcer) {
      announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcer';
      announcer.className = 'screen-reader-only';
      announcer.setAttribute('aria-live', 'polite');
      document.body.appendChild(announcer);
    }
    
    // Define a mensagem
    announcer.textContent = message;
  }
  
  /**
   * Mostra as próximas cartas
   */
  showNextCards() {
    this.roundCount++;
    
    if (this.playerDeck.length === 0 || this.computerDeck.length === 0) {
      this.endGame();
      return;
    }
    
    // Pega a primeira carta de cada deck
    this.currentPlayerCard = this.playerDeck[0];
    this.currentComputerCard = this.computerDeck[0];
    
    // Animação de entrada para as cartas
    if (this.animationsEnabled) {
      this.playerCardElement.style.opacity = '0';
      this.computerCardElement.style.opacity = '0';
      
      setTimeout(() => {
        // Mostra a carta do jogador
        this.renderCard(this.currentPlayerCard, this.playerCardElement, true);
        
        // Mostra o verso da carta do computador
        this.computerCardElement.innerHTML = '<div class="card-back">?</div>';
        
        // Anima a entrada
        this.playerCardElement.style.opacity = '1';
        this.computerCardElement.style.opacity = '1';
        
        this.playerCardElement.style.transform = 'translateY(0)';
        this.computerCardElement.style.transform = 'translateY(0)';
        
        this.playSound('cardFlip');
      }, 300);
      
      this.playerCardElement.style.transition = 'all 0.5s ease-out';
      this.computerCardElement.style.transition = 'all 0.5s ease-out';
      this.playerCardElement.style.transform = 'translateY(20px)';
      this.computerCardElement.style.transform = 'translateY(20px)';
    } else {
      // Sem animação, mostra diretamente
      this.renderCard(this.currentPlayerCard, this.playerCardElement, true);
      this.computerCardElement.innerHTML = '<div class="card-back">?</div>';
    }
    
    // Reseta a seleção de atributo
    this.selectedAttribute = null;
    this.playButton.disabled = true;
    
    // Mostra/esconde botões apropriados
    this.playButton.classList.remove('hidden');
    this.nextButton.classList.add('hidden');
    this.restartButton.classList.add('hidden');
    
    // Atualiza o status do jogo
    this.gameStatusElement.textContent = `Rodada ${this.roundCount} - Selecione um atributo para jogar!`;
    
    // Anuncia a nova rodada para leitores de tela
    this.announceForScreenReaders(`Rodada ${this.roundCount}. Seu personagem é ${this.currentPlayerCard.name}. Selecione um atributo para jogar.`);
  }
  
  /**
   * Renderiza um card
   * @param {Object} character - Personagem para renderizar
   * @param {HTMLElement} container - Elemento container onde renderizar
   * @param {boolean} isPlayerCard - Se é a carta do jogador
   */
  renderCard(character, container, isPlayerCard) {
    if (!character) {
      console.error('Personagem inválido para renderização');
      container.innerHTML = '<div class="error">Erro ao carregar carta</div>';
      return;
    }
    
    let html = `
      <img src="${character.image}" alt="${character.name}" onerror="this.onerror=null; this.src='https://via.placeholder.com/200x300?text=Sem+Imagem';">
      <h2>${character.name}</h2>
      <div class="attributes">
        <div class="attribute ${isPlayerCard ? 'clickable' : ''}" data-attribute="strength" tabindex="${isPlayerCard ? '0' : '-1'}" role="${isPlayerCard ? 'button' : 'presentation'}">
          <span class="attribute-name">Força</span>
          <span class="attribute-value">${character.strength}</span>
        </div>
        <div class="attribute ${isPlayerCard ? 'clickable' : ''}" data-attribute="intelligence" tabindex="${isPlayerCard ? '0' : '-1'}" role="${isPlayerCard ? 'button' : 'presentation'}">
          <span class="attribute-name">Inteligência</span>
          <span class="attribute-value">${character.intelligence}</span>
        </div>
        <div class="attribute ${isPlayerCard ? 'clickable' : ''}" data-attribute="speed" tabindex="${isPlayerCard ? '0' : '-1'}" role="${isPlayerCard ? 'button' : 'presentation'}">
          <span class="attribute-name">Velocidade</span>
          <span class="attribute-value">${character.speed}</span>
        </div>
        <div class="attribute" data-attribute="bounty">
          <span class="attribute-name">Recompensa</span>
          <span class="attribute-value">${character.bounty}</span>
        </div>
        <div class="attribute" data-attribute="devil_fruit">
          <span class="attribute-name">Fruta</span>
          <span class="attribute-value">${character.devil_fruit}</span>
        </div>
      </div>
    `;
    
    container.innerHTML = html;
    
    // Adiciona listeners para seleção de atributos apenas para o card do jogador
    if (isPlayerCard) {
      const attributes = container.querySelectorAll('.attribute.clickable');
      attributes.forEach((attr, index) => {
        // Adiciona tecla numérica como dica visual
        const keyHint = document.createElement('span');
        keyHint.className = 'key-hint';
        keyHint.textContent = `${index + 1}`;
        attr.appendChild(keyHint);
        
        // Adiciona listener de clique
        attr.addEventListener('click', () => {
          this.playSound('click');
          this.selectAttribute(attr.dataset.attribute);
        });
        
        // Adiciona suporte a teclado
        attr.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.playSound('click');
            this.selectAttribute(attr.dataset.attribute);
          }
        });
      });
    }
  }
  
  /**
   * Seleciona um atributo para jogar
   * @param {string} attribute - O atributo selecionado
   */
  selectAttribute(attribute) {
    // Remove a seleção anterior
    const attributes = this.playerCardElement.querySelectorAll('.attribute');
    attributes.forEach(attr => attr.classList.remove('selected-attribute'));
    
    // Seleciona o novo atributo
    const selectedElement = this.playerCardElement.querySelector(`.attribute[data-attribute="${attribute}"]`);
    selectedElement.classList.add('selected-attribute');
    
    // Armazena o atributo selecionado
    this.selectedAttribute = attribute;
    
    // Habilita o botão de jogar
    this.playButton.disabled = false;
    
    // Foco automático no botão de jogar para facilitar a jogabilidade
    this.playButton.focus();
    
    // Anuncia a seleção para leitores de tela
    this.announceForScreenReaders(`Atributo selecionado: ${this.getAttributeLabel(attribute)}`);
  }
  
  /**
   * Retorna o rótulo legível para um atributo
   * @param {string} attribute - O atributo
   * @returns {string} - Rótulo legível
   */
  getAttributeLabel(attribute) {
    const labels = {
      'strength': 'Força',
      'intelligence': 'Inteligência',
      'speed': 'Velocidade',
      'bounty': 'Recompensa',
      'devil_fruit': 'Fruta do Diabo'
    };
    return labels[attribute] || attribute;
  }
  
  /**
   * Joga uma rodada
   */
  playRound() {
    if (!this.selectedAttribute || this.gameOver) return;
    
    // Som de carta virando
    this.playSound('cardFlip');
    
    // Animação de revelar a carta do computador
    if (this.animationsEnabled) {
      this.computerCardElement.classList.add('flipped');
      
      setTimeout(() => {
        // Mostra a carta do computador
        this.renderCard(this.currentComputerCard, this.computerCardElement, false);
        this.computerCardElement.classList.remove('flipped');
        
        // Continua o processo após a animação
        this.evaluateRound();
      }, 500);
    } else {
      // Sem animação, mostra diretamente
      this.renderCard(this.currentComputerCard, this.computerCardElement, false);
      this.evaluateRound();
    }
  }
  
  /**
   * Avalia o resultado da rodada após a carta do computador ser revelada
   */
  evaluateRound() {
    // Compara os atributos
    const playerAttrValue = this.currentPlayerCard[this.selectedAttribute];
    const computerAttrValue = this.currentComputerCard[this.selectedAttribute];
    
    // Destaca os atributos comparados
    const playerAttrElement = this.playerCardElement.querySelector(`.attribute[data-attribute="${this.selectedAttribute}"]`);
    const computerAttrElement = this.computerCardElement.querySelector(`.attribute[data-attribute="${this.selectedAttribute}"]`);
    
    let result;
    if (this.selectedAttribute === 'devil_fruit') {
      // Para fruta do diabo, vamos considerar que ter uma fruta (diferente de 'Nenhuma') ganha
      if (this.currentPlayerCard.devil_fruit !== 'Nenhuma' && this.currentComputerCard.devil_fruit === 'Nenhuma') {
        result = 'player';
      } else if (this.currentPlayerCard.devil_fruit === 'Nenhuma' && this.currentComputerCard.devil_fruit !== 'Nenhuma') {
        result = 'computer';
      } else {
        result = 'draw';
      }
    } else if (this.selectedAttribute === 'bounty') {
      // Para recompensa, precisamos extrair os valores numéricos
      const playerBounty = this.extractNumericBounty(this.currentPlayerCard.bounty);
      const computerBounty = this.extractNumericBounty(this.currentComputerCard.bounty);
      
      if (playerBounty > computerBounty) {
        result = 'player';
      } else if (playerBounty < computerBounty) {
        result = 'computer';
      } else {
        result = 'draw';
      }
    } else {
      // Para os outros atributos, comparamos diretamente
      if (playerAttrValue > computerAttrValue) {
        result = 'player';
      } else if (playerAttrValue < computerAttrValue) {
        result = 'computer';
      } else {
        result = 'draw';
      }
    }
    
    // Aplica as classes CSS apropriadas e atualiza o jogo
    if (result === 'player') {
      playerAttrElement.classList.add('winner');
      computerAttrElement.classList.add('loser');
      this.playerScore++;
      this.gameStatusElement.textContent = "Você venceu esta rodada!";
      this.playSound('win');
      
      // Move as cartas para o deck do vencedor
      this.playerDeck.push(this.currentPlayerCard, this.currentComputerCard);
      this.playerDeck.shift();
      this.computerDeck.shift();
      
      // Anuncia o resultado para leitores de tela
      this.announceForScreenReaders(`Você venceu! ${this.getAttributeLabel(this.selectedAttribute)} do seu personagem (${playerAttrValue}) é maior que do oponente (${computerAttrValue}).`);
    } else if (result === 'computer') {
      playerAttrElement.classList.add('loser');
      computerAttrElement.classList.add('winner');
      this.computerScore++;
      this.gameStatusElement.textContent = "O computador venceu esta rodada!";
      this.playSound('lose');
      
      // Move as cartas para o deck do vencedor
      this.computerDeck.push(this.currentPlayerCard, this.currentComputerCard);
      this.playerDeck.shift();
      this.computerDeck.shift();
      
      // Anuncia o resultado para leitores de tela
      this.announceForScreenReaders(`O computador venceu. ${this.getAttributeLabel(this.selectedAttribute)} do seu personagem (${playerAttrValue}) é menor que do oponente (${computerAttrValue}).`);
    } else {
      this.gameStatusElement.textContent = "Empate! Ambos mantêm suas cartas.";
      this.playSound('draw');
      
      // Em caso de empate, cada jogador mantém sua carta, mas coloca no final do deck
      this.playerDeck.push(this.playerDeck.shift());
      this.computerDeck.push(this.computerDeck.shift());
      
      // Anuncia o resultado para leitores de tela
      this.announceForScreenReaders(`Empate! ${this.getAttributeLabel(this.selectedAttribute)} de ambos os personagens é ${playerAttrValue}.`);
    }
    
    // Atualiza a pontuação e contagem de cartas
    this.playerScoreElement.textContent = this.playerScore;
    this.computerScoreElement.textContent = this.computerScore;
    this.updateCardCount();
    
    // Verifica se o jogo acabou
    if (this.playerDeck.length === 0 || this.computerDeck.length === 0) {
      this.endGame();
    } else {
      // Esconde o botão de jogar e mostra o botão de próxima rodada
      this.playButton.classList.add('hidden');
      this.nextButton.classList.remove('hidden');
      this.nextButton.focus(); // Foco automático para facilitar
    }
  }
  
  /**
   * Extrai o valor numérico de uma recompensa
   * @param {string} bountyString - String da recompensa
   * @returns {number} - Valor numérico
   */
  extractNumericBounty(bountyString) {
    if (bountyString === 'Desconhecida') return 0;
    return parseInt(bountyString.replace(/[^\d]/g, '')) || 0;
  }
  
  /**
   * Atualiza a contagem de cartas
   */
  updateCardCount() {
    this.playerCardsCountElement.textContent = this.playerDeck.length;
    this.computerCardsCountElement.textContent = this.computerDeck.length;
  }
  
  /**
   * Finaliza o jogo
   */
  endGame() {
    this.gameOver = true;
    let message = '';
    let announceMessage = '';
    
    this.playSound('gameOver');
    
    if (this.playerDeck.length === 0) {
      message = "Fim de jogo! O computador venceu!";
      announceMessage = `Fim de jogo! O computador venceu por ${this.computerScore} a ${this.playerScore}!`;
    } else if (this.computerDeck.length === 0) {
      message = "Fim de jogo! Você venceu!";
      announceMessage = `Fim de jogo! Você venceu por ${this.playerScore} a ${this.computerScore}!`;
    } else if (this.playerScore > this.computerScore) {
      message = `Fim de jogo! Você venceu por ${this.playerScore} a ${this.computerScore}!`;
      announceMessage = message;
    } else if (this.playerScore < this.computerScore) {
      message = `Fim de jogo! O computador venceu por ${this.computerScore} a ${this.playerScore}!`;
      announceMessage = message;
    } else {
      message = `Fim de jogo! Empate: ${this.playerScore} a ${this.computerScore}!`;
      announceMessage = message;
    }
    
    this.gameStatusElement.textContent = message;
    
    // Animação de fim de jogo
    if (this.animationsEnabled) {
      this.gameStatusElement.animate([
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(1)' }
      ], {
        duration: 1000,
        iterations: 1
      });
    }
    
    this.playButton.classList.add('hidden');
    this.nextButton.classList.add('hidden');
    this.restartButton.classList.remove('hidden');
    this.restartButton.focus(); // Foco automático para facilitar
    
    // Anuncia o resultado final para leitores de tela
    this.announceForScreenReaders(announceMessage);
  }
  
  /**
   * Reinicia o jogo
   */
  restartGame() {
    this.playSound('click');
    
    this.playerScore = 0;
    this.computerScore = 0;
    this.gameOver = false;
    this.roundCount = 0;
    
    this.playerScoreElement.textContent = "0";
    this.computerScoreElement.textContent = "0";
    
    this.startGame();
  }
  
  // Funções de UI para gerenciar estados de carregamento e erro
  showLoading(show) {
    this.loadingElement.style.display = show ? 'block' : 'none';
  }
  
  showErrorMessage(message) {
    this.errorMessageElement.textContent = message;
    this.errorMessageElement.style.display = 'block';
  }
  
  hideErrorMessage() {
    this.errorMessageElement.style.display = 'none';
  }
  
  showFallbackButton() {
    this.loadFallbackElement.style.display = 'block';
  }
  
  hideFallbackButton() {
    this.loadFallbackElement.style.display = 'none';
  }
  
  showGameContent() {
    this.gameContentElement.style.display = 'block';
  }
}

// Inicializa o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  const game = new TrumpGame();
  game.init();
});