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
    this.cardsPerPlayer = 15; // Default: 15 cartas por jogador (30 no total)
    
    // Carregar configurações do localStorage
    this.loadSettings();
    
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
      cardFlip: new Audio('/onepiece/sounds/card-flip.mp3'),
      win: new Audio('/onepiece/sounds/win.mp3'),
      lose: new Audio('/onepiece/sounds/lose.mp3'),
      draw: new Audio('/onepiece/sounds/draw.mp3'),
      gameWin: new Audio('/onepiece/sounds/game-win.mp3'),
      gameLose: new Audio('/onepiece/sounds/game-lose.mp3'),
      click: new Audio('/onepiece/sounds/click.mp3')
    };
    
    // Pré-carrega os sons e define volume
    Object.values(this.sounds).forEach(sound => {
      sound.load();
      sound.volume = 0.5;
      
      // Adiciona tratamento de erro para sons com detalhes ampliados
      sound.addEventListener('error', (e) => {
        console.warn(`Erro ao carregar som: ${sound.src}`, e);
        // Tenta carregar com caminho relativo se o absoluto falhar
        if (sound.src.startsWith('http')) {
          const fileName = sound.src.split('/').pop();
          const relativePath = `./sounds/${fileName}`;
          console.log(`Tentando caminho alternativo: ${relativePath}`);
          sound.src = relativePath;
        }
      });
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
    this.nextRound = this.nextRound.bind(this);
    
    // Event listeners
    this.playButton.addEventListener('click', this.playRound);
    this.nextButton.addEventListener('click', this.showNextCards);
    this.restartButton.addEventListener('click', this.restartGame);
    this.loadFallbackButton.addEventListener('click', this.useFallbackData);
    
    // Adiciona event listeners para os botões de controle já existentes no HTML
    const soundToggleButton = document.getElementById('sound-toggle');
    const animationToggleButton = document.getElementById('animation-toggle');
    const clearCacheButton = document.getElementById('clear-cache');
    
    if (soundToggleButton) soundToggleButton.addEventListener('click', this.toggleSound);
    if (animationToggleButton) animationToggleButton.addEventListener('click', this.toggleAnimations);
    if (clearCacheButton) clearCacheButton.addEventListener('click', this.clearCache);
    
    // Inicializa teclas de atalho
    this.setupKeyboardShortcuts();
    this.setupAccessibility();
  }
  
  /**
   * Adiciona controles de jogo para som, animações e cache
   * Este método agora está desativado para evitar duplicação
   */
  addGameControls() {
    // Método desativado para evitar duplicação com os controles já existentes no HTML
    console.log('Usando controles de jogo existentes no HTML');
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
      try {
        // Verifica se o áudio está em estado válido
        if (this.sounds[soundName].error) {
          console.warn(`O som ${soundName} tem um erro: ${this.sounds[soundName].error.code}`);
          return;
        }
        
        // Clona o som para permitir sobreposição
        const sound = this.sounds[soundName].cloneNode();
        sound.volume = this.sounds[soundName].volume;
        
        // Promise para lidar com erros de reprodução
        const playPromise = sound.play();
        
        if (playPromise !== undefined) {
          playPromise.catch(e => {
            // Não registramos erros NotAllowedError no início do jogo, pois são esperados
            // até que o usuário interaja com a página
            if (e.name === 'NotAllowedError') {
              console.debug(`Som ${soundName} não reproduzido: necessária interação do usuário primeiro.`);
            } else {
              console.warn(`Erro ao reproduzir som ${soundName}: ${e.name} - ${e.message}`);
              // Tenta recarregar o som original
              this.sounds[soundName].load();
            }
          });
        }
      } catch (e) {
        console.warn(`Erro ao inicializar som ${soundName}: ${e}`);
      }
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
    // Configura os elementos do DOM
    this.setupGameElements();
    
    // Carrega os personagens
    this.loadCharactersFromAPI(); // Alterado de this.loadCharacters para this.loadCharactersFromAPI
    
    // Configura os eventos do mouse
    this.setupEvents();
    
    // Configura controles de teclado para acessibilidade
    this.setupKeyboardControls();
  }

  /**
   * Configura os elementos do jogo
   */
  setupGameElements() {
    // Seleciona o número de cartas correspondente nas configurações
    const cardOptions = document.querySelectorAll('input[name="cardCount"]');
    cardOptions.forEach(option => {
      if (parseInt(option.value) === this.cardsPerPlayer) {
        option.checked = true;
      }
    });
  }

  /**
   * Configura os eventos do jogo
   */
  setupEvents() {
    // Botão de jogar
    const playBtn = document.getElementById('play-btn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        this.sounds.click.play();
        this.playRound();
      });
    }

    // Botão de próxima rodada
    const nextBtn = document.getElementById('next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.sounds.click.play();
        this.nextRound();
      });
    }

    // Botão de reiniciar jogo
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.sounds.click.play();
        this.restart();
      });
    }

    // Botão de configurações
    const settingsToggle = document.getElementById('settings-toggle');
    if (settingsToggle) {
      settingsToggle.addEventListener('click', () => {
        this.sounds.click.play();
        document.getElementById('settings-modal').style.display = 'flex';
      });
    }

    // Botão de fechar modal
    const closeButton = document.querySelector('.close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.sounds.click.play();
        document.getElementById('settings-modal').style.display = 'none';
      });
    }

    // Botão de salvar configurações
    const saveSettingsBtn = document.getElementById('save-settings');
    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener('click', () => {
        // Obter as configurações selecionadas
        const soundCheckbox = document.getElementById('sound-enabled');
        const animationsCheckbox = document.getElementById('animations-enabled');
        const cardCountRadios = document.getElementsByName('card-count');
        
        if (soundCheckbox) {
          this.soundEnabled = soundCheckbox.checked;
        }
        
        if (animationsCheckbox) {
          this.animationsEnabled = animationsCheckbox.checked;
        }
        
        // Obter número de cartas selecionado
        for (const radio of cardCountRadios) {
          if (radio.checked) {
            // O valor no HTML já é o total de cartas, então dividimos por 2 para obter cartas por jogador
            this.cardsPerPlayer = parseInt(radio.value) / 2;
            console.log(`Configurando cardsPerPlayer para ${this.cardsPerPlayer} (${radio.value} total)`);
            break;
          }
        }
        
        // Salvar no localStorage
        this.saveSettings();
        
        // Atualizar a interface
        this.updateSettingsUI();
        
        // Som de feedback
        this.playSound('click');
        
        // Fechar o modal automaticamente
        document.getElementById('settings-modal').style.display = 'none';
        
        // Mostrar mensagem de confirmação
        this.showTemporaryMessage('Configurações salvas com sucesso!');
        
        // Reiniciar o jogo imediatamente para aplicar as novas configurações
        this.restartGame();
      });
    }

    // Botão de som
    const soundToggle = document.getElementById('sound-toggle');
    if (soundToggle) {
      soundToggle.addEventListener('click', () => {
        this.toggleSound();
      });
    }

    // Botão de animação
    const animationToggle = document.getElementById('animation-toggle');
    if (animationToggle) {
      animationToggle.addEventListener('click', () => {
        this.toggleAnimations();
      });
    }

    // Botão de limpar cache
    const clearCacheBtn = document.getElementById('clear-cache');
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => {
        this.clearCache();
      });
    }

    // Fechar o modal quando clicar fora dele
    window.addEventListener('click', (event) => {
      const modal = document.getElementById('settings-modal');
      if (modal && event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }

  /**
   * Abre o modal de configurações
   */
  openSettings() {
    // Atualiza o botão radio com o valor atual
    const radioOption = document.querySelector(`input[name="cardCount"][value="${this.cardsPerPlayer}"]`);
    if (radioOption) {
      radioOption.checked = true;
    }
    
    // Exibe o modal
    document.getElementById('settingsModal').style.display = 'flex';
    
    // Reproduz o som de clique
    this.sounds.click.play();
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
    
    // Garante que temos cartas suficientes e que o número é par para distribuição igual
    const totalCardsNeeded = this.cardsPerPlayer * 2;
    const availableCards = Math.min(totalCardsNeeded, shuffledCharacters.length);
    
    // Garante que cada jogador receba exatamente o mesmo número de cartas
    const cardsPerPlayerActual = Math.floor(availableCards / 2);
    
    console.log(`Distribuindo ${cardsPerPlayerActual} cartas para cada jogador (total: ${cardsPerPlayerActual * 2})`);
    
    // Seleciona o número exato de cartas necessárias
    const limitedCharacters = shuffledCharacters.slice(0, cardsPerPlayerActual * 2);
    
    // Divide as cartas igualmente
    this.playerDeck = limitedCharacters.slice(0, cardsPerPlayerActual);
    this.computerDeck = limitedCharacters.slice(cardsPerPlayerActual, cardsPerPlayerActual * 2);
    
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
   * @param {string} message - Mensagem a ser anunciada
   */
  announceForScreenReaders(message) {
    const announcement = document.getElementById('screen-reader-announcement');
    if (announcement) {
      announcement.textContent = message;
      
      // Adiciona um marcador de polite live region para leitores de tela
      if (!announcement.hasAttribute('aria-live')) {
        announcement.setAttribute('aria-live', 'polite');
      }
    }
  }
  
  /**
   * Limpa o estado das cartas para preparar para a próxima rodada
   */
  resetCardState() {
    // Remover classes e resetar estados
    this.playerCardElement.classList.remove('flipped', 'winner', 'loser');
    this.computerCardElement.classList.remove('flipped', 'winner', 'loser');
    
    // Resetar estilos de atributos
    ['strength-row', 'intelligence-row', 'speed-row'].forEach(className => {
      const playerRow = this.playerCardElement.querySelector(`.${className}`);
      const computerRow = this.computerCardElement.querySelector(`.${className}`);
      
      if (playerRow) playerRow.classList.remove('attribute-selected', 'attribute-winner', 'attribute-loser');
      if (computerRow) computerRow.classList.remove('attribute-selected', 'attribute-winner', 'attribute-loser');
    });
    
    // Desabilitar botão de jogar até que um atributo seja selecionado
    this.playButton.disabled = true;
    
    // Resetar o atributo selecionado
    this.selectedAttribute = null;
  }

  /**
   * Exibe as próximas cartas para o jogador e para o computador
   * @param {boolean} shouldIncrementRound - Se deve incrementar o contador de rodadas (padrão: true para compatibilidade)
   */
  showNextCards(shouldIncrementRound = true) {
    // Resetar o estado das cartas
    this.resetCardState();
    
    // Verificar se ainda há cartas no baralho
    if (this.playerDeck.length === 0) {
      this.endGame(this.computerScore > this.playerScore ? 'computer' : 'player');
      return;
    }
    
    // Obter as cartas da rodada atual
    this.currentPlayerCard = this.playerDeck.shift();
    this.currentComputerCard = this.computerDeck.shift();
    
    // Verificar se as cartas são válidas
    if (!this.currentPlayerCard || !this.currentComputerCard) {
      console.error('Carta inválida encontrada:', this.currentPlayerCard, this.currentComputerCard);
      this.endGame('error');
      return;
    }

    // DEBUG: Log para verificar se os valores dos atributos estão presentes nas cartas
    console.log("Cartas da nova rodada:", {
      player: {
        name: this.currentPlayerCard.name,
        strength: this.currentPlayerCard.strength,
        intelligence: this.currentPlayerCard.intelligence,
        speed: this.currentPlayerCard.speed
      },
      computer: {
        name: this.currentComputerCard.name,
        strength: this.currentComputerCard.strength,
        intelligence: this.currentComputerCard.intelligence,
        speed: this.currentComputerCard.speed
      }
    });
    
    // Atualizar os elementos de carta com as novas cartas
    this.updateCardContent(this.playerCardElement, this.currentPlayerCard, 'player');
    this.updateCardContent(this.computerCardElement, this.currentComputerCard, 'computer', true);
    
    // Virar a carta do jogador e manter a carta do computador oculta
    this.playerCardElement.classList.add('flipped');
    
    // Habilitar interação nos atributos da carta do jogador
    this.enableAttributeSelection();
    
    // Anunciar para leitores de tela
    this.announceForScreenReaders(`Nova rodada. Sua carta é ${this.currentPlayerCard.name}. Selecione um atributo para jogar: Força ${this.currentPlayerCard.strength}, Inteligência ${this.currentPlayerCard.intelligence} ou Velocidade ${this.currentPlayerCard.speed}.`);
    
    // Tocar som de puxar carta
    this.playSound('card-flip');
    
    // Atualizar o contador de cartas
    this.updateCardCount();
  }
  
  /**
   * Atualiza o conteúdo de uma carta
   * @param {HTMLElement} cardElement - O elemento da carta
   * @param {Object} cardData - Os dados da carta
   * @param {string} player - 'player' ou 'computer'
   */
  updateCardContent(cardElement, cardData, cardType, hideDetails = false) {
    if (!cardElement) {
      console.error(`updateCardContent called with null cardElement for cardType: ${cardType}`);
      return;
    }

    // Clear existing content first to ensure a clean slate
    cardElement.innerHTML = '';

    if (hideDetails) {
      // If details are meant to be hidden (e.g., computer's card initially),
      // set the card to show its back
      const backImg = document.createElement('img');
      backImg.className = 'card-image card-back';
      backImg.src = 'images/backcard.jpg';
      backImg.alt = 'Card Back';
      cardElement.appendChild(backImg);
      
      // Add a placeholder for the name
      const nameEl = document.createElement('div');
      nameEl.className = 'card-name';
      nameEl.textContent = '???';
      cardElement.appendChild(nameEl);
      
      // Add empty attributes list for consistent layout
      const attrsEl = document.createElement('ul');
      attrsEl.className = 'card-attributes';
      cardElement.appendChild(attrsEl);
      return;
    }

    // If we have card data, display it
    if (cardData) {
      // Create and append the image element
      const imageElement = document.createElement('img');
      imageElement.className = 'card-image';
      if (cardData.image && (cardData.image.startsWith('http://') || cardData.image.startsWith('https://'))) {
        imageElement.src = cardData.image;
      } else if (cardData.image) {
        imageElement.src = `images/characters/${cardData.image}`;
      } else {
        imageElement.src = 'images/backcard.jpg'; // Default image if no image provided
      }
      imageElement.alt = cardData.name || 'Character Image';
      cardElement.appendChild(imageElement);

      // Create and append name element
      const nameElement = document.createElement('div');
      nameElement.className = 'card-name';
      nameElement.textContent = cardData.name || 'Unknown Character';
      cardElement.appendChild(nameElement);

      // Create and append attributes list
      const attributesElement = document.createElement('ul');
      attributesElement.className = 'card-attributes';
      
      // Lista completa de atributos a serem mostrados em ambas as cartas
      const attributesToShow = [
        { key: 'strength', label: 'Força' },
        { key: 'intelligence', label: 'Inteligência' },
        { key: 'speed', label: 'Velocidade' },
        { key: 'bounty', label: 'Recompensa' },
        { key: 'devil_fruit', label: 'Fruta' }
      ];

      attributesToShow.forEach((attrInfo, index) => {
        const value = (cardData[attrInfo.key] !== undefined && cardData[attrInfo.key] !== null) 
          ? cardData[attrInfo.key] 
          : 'Desconhecida';
        
        const li = document.createElement('li');
        li.dataset.attribute = attrInfo.key;
        
        // Make player card attributes selectable (apenas os 3 primeiros são jogáveis)
        if (cardType === 'player' && index < 3) {
          li.classList.add('selectable');
          li.tabIndex = 0; // Make focusable for keyboard accessibility
          // Add key hint for keyboard shortcut
          const keyHint = document.createElement('span');
          keyHint.className = 'key-hint';
          keyHint.textContent = `${index + 1}`;
          li.appendChild(keyHint);
          
          // Add click handler to player card attributes
          li.onclick = () => this.selectAttribute(attrInfo.key);
          
          // Add keyboard handler
          li.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              this.selectAttribute(attrInfo.key);
            }
          });
        }

        // Set the content of the attribute
        li.innerHTML += `${attrInfo.label}: <span class="value">${value}</span>`;
        attributesElement.appendChild(li);
      });
      
      cardElement.appendChild(attributesElement);
    } else {
      // If no card data, show placeholder/back
      const backImg = document.createElement('img');
      backImg.className = 'card-image card-back';
      backImg.src = 'images/backcard.jpg';
      backImg.alt = 'No Card';
      cardElement.appendChild(backImg);
      
      const nameEl = document.createElement('div');
      nameEl.className = 'card-name';
      nameEl.textContent = 'No Card';
      cardElement.appendChild(nameEl);
      
      const attrsEl = document.createElement('ul');
      attrsEl.className = 'card-attributes';
      cardElement.appendChild(attrsEl);
    }
  }
  
  /**
   * Habilita a seleção de atributos na carta do jogador
   */
  enableAttributeSelection() {
    const attributeRows = this.playerCardElement.querySelectorAll('.attribute-row');
    attributeRows.forEach(row => {
      row.classList.add('selectable');
    });
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
   * @param {string} attribute - O atributo selecionado (strength, intelligence, speed)
   */
  selectAttribute(attribute) {
    // Verifica se o atributo é válido
    const validAttributes = ['strength', 'intelligence', 'speed'];
    if (!validAttributes.includes(attribute)) {
      console.error(`Atributo inválido: ${attribute}`);
      return;
    }
    
    // Limpa seleções anteriores - remove destaque de todos os atributos
    const allAttributeElements = this.playerCardElement.querySelectorAll('li[data-attribute]');
    allAttributeElements.forEach(element => {
      element.classList.remove('selected-attribute');
    });
    
    // Destaca o atributo selecionado - adiciona classe para destacar visualmente
    const selectedElement = this.playerCardElement.querySelector(`li[data-attribute="${attribute}"]`);
    if (selectedElement) {
      selectedElement.classList.add('selected-attribute');
    }
    
    // Define o atributo selecionado
    this.selectedAttribute = attribute;
    
    // Habilita o botão de jogar
    this.playButton.disabled = false;
    
    // Anuncia para leitores de tela
    const attributeNames = {
      'strength': 'Força',
      'intelligence': 'Inteligência',
      'speed': 'Velocidade'
    };
    
    const playerValue = this.currentPlayerCard[attribute];
    this.announceForScreenReaders(`Você selecionou o atributo ${attributeNames[attribute]} com valor ${playerValue}. Clique em Jogar para continuar.`);
    
    // Toca o som de clique
    this.playSound('click');
  }
  
  /**
   * Retorna o nome do atributo em português
   * @param {string} attribute - O atributo ('strength', 'intelligence' ou 'speed')
   * @returns {string} - Nome do atributo em português
   */
  getAttributeName(attribute) {
    const attributeNames = {
      'strength': 'Força',
      'intelligence': 'Inteligência',
      'speed': 'Velocidade'
    };
    
    return attributeNames[attribute] || attribute;
  }
  
  /**
   * Anuncia uma mensagem para leitores de tela
   * @param {string} message - A mensagem a ser anunciada
   */
  announceForScreenReaders(message) {
    const announcement = document.getElementById('screen-reader-announcement');
    if (announcement) {
      announcement.textContent = message;
      
      // Técnica para forçar leitores de tela a lerem a mensagem novamente
      // mesmo que o conteúdo seja semelhante ao anterior
      announcement.setAttribute('aria-live', 'off');
      setTimeout(() => {
        announcement.setAttribute('aria-live', 'assertive');
      }, 100);
    }
  }
  
  /**
   * Joga uma rodada
   */
  playRound() {
    if (!this.selectedAttribute || this.gameOver) return;
    
    // Prevenir chamadas duplas - um flag para garantir que avaliamos a rodada apenas uma vez
    if (this._evaluatingRound) return;
    this._evaluatingRound = true;
    
    // Som de carta virando
    this.playSound('cardFlip');
    
    // Fazemos cópias completas das cartas antes de qualquer operação
    const playerCardCopy = JSON.parse(JSON.stringify(this.currentPlayerCard));
    const computerCardCopy = JSON.parse(JSON.stringify(this.currentComputerCard));
    
    // Log para depuração
    console.log("[DEBUG] Início de playRound, atributo selecionado:", this.selectedAttribute);
    
    // Animação de revelar a carta do computador
    if (this.animationsEnabled) {
      this.computerCardElement.classList.add('flipped');
      
      setTimeout(() => {
        // Mostra a carta do computador usando a cópia local
        this.renderCard(computerCardCopy, this.computerCardElement, false);
        this.computerCardElement.classList.remove('flipped');
        
        // Continua o processo após a animação, passando as cópias das cartas
        this.evaluateRoundOnce(playerCardCopy, computerCardCopy);
        this._evaluatingRound = false; // Libera para próxima rodada
      }, 500);
    } else {
      // Sem animação, mostra diretamente
      this.renderCard(computerCardCopy, this.computerCardElement, false);
      this.evaluateRoundOnce(playerCardCopy, computerCardCopy);
      this._evaluatingRound = false; // Libera para próxima rodada
    }
  }
  
  /**
   * Avalia o resultado da rodada após a carta do computador ser revelada
   * Usando um novo método que garante execução única
   * @param {Object} playerCard - Cópia da carta do jogador
   * @param {Object} computerCard - Cópia da carta do computador
   */
  evaluateRoundOnce(playerCard, computerCard) {
    // Incrementa o contador de rodadas
    this.roundCount++;
    
    // Extrair valores dos atributos das cópias passadas por parâmetro
    let playerAttrValue = 0;
    let computerAttrValue = 0;
    
    // Para atributos numéricos, tentamos várias abordagens para extrair o valor
    if (this.selectedAttribute === 'strength' || this.selectedAttribute === 'intelligence' || this.selectedAttribute === 'speed') {
      // Se o valor não for undefined e for um número válido
      if (playerCard && playerCard[this.selectedAttribute] !== undefined) {
        // Primeiro tenta converter para número - ignora não-números
        playerAttrValue = parseInt(playerCard[this.selectedAttribute]);
        // Se falhar, tenta novamente usando parseFloat
        if (isNaN(playerAttrValue)) {
          playerAttrValue = parseFloat(playerCard[this.selectedAttribute]);
        }
        // Se ainda falhar, tenta extrair apenas os dígitos
        if (isNaN(playerAttrValue)) {
          const matches = String(playerCard[this.selectedAttribute]).match(/\d+/);
          playerAttrValue = matches ? parseInt(matches[0]) : 0;
        }
      }
      
      // Mesmo processo para a carta do computador
      if (computerCard && computerCard[this.selectedAttribute] !== undefined) {
        computerAttrValue = parseInt(computerCard[this.selectedAttribute]);
        if (isNaN(computerAttrValue)) {
          computerAttrValue = parseFloat(computerCard[this.selectedAttribute]);
        }
        if (isNaN(computerAttrValue)) {
          const matches = String(computerCard[this.selectedAttribute]).match(/\d+/);
          computerAttrValue = matches ? parseInt(matches[0]) : 0;
        }
      }
    }
    
    // Log para depuração da comparação
    console.log(`Comparando ${this.selectedAttribute}: Jogador ${playerAttrValue} vs Computador ${computerAttrValue}`);
    
    // Destaca os atributos comparados 
    const playerAttrElement = this.playerCardElement.querySelector(`li[data-attribute="${this.selectedAttribute}"], .attribute[data-attribute="${this.selectedAttribute}"]`);
    const computerAttrElement = this.computerCardElement.querySelector(`li[data-attribute="${this.selectedAttribute}"], .attribute[data-attribute="${this.selectedAttribute}"]`);
    
    // Limpa classes anteriores
    if (playerAttrElement) {
      playerAttrElement.classList.remove('winner', 'loser');
    }
    if (computerAttrElement) {
      computerAttrElement.classList.remove('winner', 'loser');
    }
    
    // Determina o vencedor da rodada
    let result;
    
    // Comparação baseada no tipo de atributo
    if (this.selectedAttribute === 'strength' || this.selectedAttribute === 'intelligence' || this.selectedAttribute === 'speed') {
      // Para atributos numéricos diretos - Garantimos o uso de comparação numérica
      if (playerAttrValue > computerAttrValue) {
        result = 'player';
      } else if (playerAttrValue < computerAttrValue) {
        result = 'computer';
      } else {
        result = 'draw';
      }
    } else if (this.selectedAttribute === 'bounty') {
      // Para recompensa, precisamos extrair os valores numéricos
      const playerBounty = this.extractNumericBounty(playerCard.bounty);
      const computerBounty = this.extractNumericBounty(computerCard.bounty);
      
      if (playerBounty > computerBounty) {
        result = 'player';
      } else if (playerBounty < computerBounty) {
        result = 'computer';
      } else {
        result = 'draw';
      }
    } else if (this.selectedAttribute === 'devil_fruit') {
      // Para fruta do diabo
      if (playerCard.devil_fruit !== 'Nenhuma' && computerCard.devil_fruit === 'Nenhuma') {
        result = 'player';
      } else if (playerCard.devil_fruit === 'Nenhuma' && computerCard.devil_fruit !== 'Nenhuma') {
        result = 'computer';
      } else {
        result = 'draw';
      }
    } else {
      result = 'draw'; // Fallback em caso de atributo não reconhecido
    }
    
    // Log do resultado da comparação
    console.log(`Resultado da comparação: ${result}`);

    // IMPORTANTE: Armazenamos o número de cartas antes da transferência para cálculos corretos
    const playerDeckSizeBefore = this.playerDeck.length;
    const computerDeckSizeBefore = this.computerDeck.length;
    
    // CORREÇÃO: Processamento do resultado e aplicação de efeitos visuais
    if (result === 'player') {
      // Aplica efeitos visuais
      if (playerAttrElement) playerAttrElement.classList.add('winner');
      if (computerAttrElement) computerAttrElement.classList.add('loser');
      
      // Incrementa a pontuação
      this.playerScore++;
      
      // Atualiza a interface
      this.gameStatusElement.textContent = "Você venceu esta rodada!";
      this.playSound('win');
      
      // CORREÇÃO: Adiciona as cartas aos baralhos corretos
      this.playerDeck.push(playerCard);      // Adiciona a carta do jogador de volta ao seu deck
      this.playerDeck.push(computerCard);    // Adiciona a carta do computador ao deck do jogador
      
      // Feedback para acessibilidade
      this.announceForScreenReaders(`Você venceu! ${this.getAttributeLabel(this.selectedAttribute)} do seu personagem (${playerAttrValue}) é maior que do oponente (${computerAttrValue}).`);
    } else if (result === 'computer') {
      // Aplica efeitos visuais
      if (playerAttrElement) playerAttrElement.classList.add('loser');
      if (computerAttrElement) computerAttrElement.classList.add('winner');
      
      // Incrementa a pontuação
      this.computerScore++;
      
      // Atualiza a interface
      this.gameStatusElement.textContent = "O computador venceu esta rodada!";
      this.playSound('lose');
      
      // CORREÇÃO: Adiciona as cartas aos baralhos corretos
      this.computerDeck.push(playerCard);    // Adiciona a carta do jogador ao deck do computador
      this.computerDeck.push(computerCard);  // Adiciona a carta do computador de volta ao seu deck
      
      // Feedback para acessibilidade
      this.announceForScreenReaders(`O computador venceu. ${this.getAttributeLabel(this.selectedAttribute)} do seu personagem (${playerAttrValue}) é menor que do oponente (${computerAttrValue}).`);
    } else { // Empate
      this.gameStatusElement.textContent = "Empate! Ambos mantêm suas cartas.";
      this.playSound('draw');
      
      // Em caso de empate, cada jogador mantém sua carta
      this.playerDeck.push(playerCard);
      this.computerDeck.push(computerCard);
      
      // Feedback para acessibilidade
      this.announceForScreenReaders(`Empate! ${this.getAttributeLabel(this.selectedAttribute)} de ambos os personagens é ${playerAttrValue}.`);
    }

    // Log detalhado de movimentação de cartas
    console.log("Movimentação de cartas:", {
      resultado: result,
      jogadorAntes: playerDeckSizeBefore,
      jogadorDepois: this.playerDeck.length,
      computadorAntes: computerDeckSizeBefore,
      computadorDepois: this.computerDeck.length
    });
    
    // Limpa as referências às cartas atuais, pois elas já foram transferidas
    this.currentPlayerCard = null;
    this.currentComputerCard = null;
    
    // CRUCIAL: Atualizamos diretamente o texto do placar
    this.playerScoreElement.textContent = this.playerScore.toString();
    this.computerScoreElement.textContent = this.computerScore.toString();
    
    // Atualiza a contagem de cartas
    this.updateCardCount();
    
    // Log de debug para verificar a pontuação
    console.log(`Rodada ${this.roundCount}: Jogador ${this.playerScore} x ${this.computerScore} Computador`);
    
    // Verifica se o jogo acabou
    if (this.playerDeck.length === 0 || this.computerDeck.length === 0) {
      this.endGame();
    } else {
      // Esconde o botão de jogar e mostra o botão de próxima rodada
      this.playButton.classList.add('hidden');
      this.nextButton.classList.remove('hidden');
      this.nextButton.focus();
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
    // DEBUG: Log para verificar o estado atual dos baralhos
    console.log("Atualizando contagem de cartas:", {
      playerDeck: this.playerDeck.length,
      computerDeck: this.computerDeck.length,
      currentPlayerCard: this.currentPlayerCard ? "Sim" : "Não",
      currentComputerCard: this.currentComputerCard ? "Sim" : "Não"
    });

    // CORREÇÃO: Calculamos o número EXATO de cartas
    // Apenas as cartas no baralho (deck) + cartas atuais (se houver)
    let playerCardCount = this.playerDeck.length;
    let computerCardCount = this.computerDeck.length;
    
    // Adicionamos +1 apenas se tiver uma carta em jogo
    if (this.currentPlayerCard !== null) {
      playerCardCount += 1;
    }
    
    if (this.currentComputerCard !== null) {
      computerCardCount += 1;
    }
    
    // Atualiza o texto na interface
    this.playerCardsCountElement.textContent = playerCardCount;
    this.computerCardsCountElement.textContent = computerCardCount;
  }
  
  /**
   * Finaliza o jogo e mostra a pontuação final
   */
  endGame() {
    this.gameActive = false;
    
    // Atualiza a interface
    this.updateUI();
    
    // Reproduz o som de fim de jogo baseado no resultado
    if (this.playerScore > this.computerScore) {
      this.playSound('gameWin');
    } else if (this.computerScore > this.playerScore) {
      this.playSound('gameLose');
    } else {
      this.playSound('draw'); // Som de empate (se existir)
    }
    
    // Salva estatísticas do jogo
    this.saveGameStats();
    
    // Exibe modal com o resultado final
    const resultModal = document.getElementById('resultModal');
    const resultMessage = document.getElementById('resultMessage');
    const playerFinalScore = document.getElementById('playerFinalScore');
    const computerFinalScore = document.getElementById('computerFinalScore');
    
    // Define a mensagem de acordo com o resultado
    if (this.playerScore > this.computerScore) {
      resultMessage.textContent = 'Você venceu!';
      resultMessage.className = 'win-message';
    } else if (this.computerScore > this.playerScore) {
      resultMessage.textContent = 'Você perdeu!';
      resultMessage.className = 'lose-message';
    } else {
      resultMessage.textContent = 'Empate!';
      resultMessage.className = 'draw-message';
    }
    
    // Atualiza as pontuações
    playerFinalScore.textContent = this.playerScore;
    computerFinalScore.textContent = this.computerScore;
    
    // Exibe o modal
    resultModal.style.display = 'flex';
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

  /**
   * Carrega as configurações do localStorage
   */
  loadSettings() {
    try {
      const settings = JSON.parse(localStorage.getItem('onepieceTrumpSettings')) || {};
      
      // Carrega som habilitado (padrão: true)
      this.soundEnabled = settings.soundEnabled !== undefined ? settings.soundEnabled : true;
      
      // Carrega animações habilitadas (padrão: true)
      this.animationsEnabled = settings.animationsEnabled !== undefined ? settings.animationsEnabled : true;
      
      // Carrega número de cartas por jogador (padrão: 15)
      this.cardsPerPlayer = settings.cardsPerPlayer || 15;
      
      console.log('Configurações carregadas:', settings);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Em caso de erro, usa os valores padrão
      this.soundEnabled = true;
      this.animationsEnabled = true;
      this.cardsPerPlayer = 15;
    }
  }
  
  /**
   * Salva as configurações no localStorage
   */
  saveSettings() {
    try {
      const settings = {
        soundEnabled: this.soundEnabled,
        animationsEnabled: this.animationsEnabled,
        cardsPerPlayer: this.cardsPerPlayer
      };
      
      localStorage.setItem('onepieceTrumpSettings', JSON.stringify(settings));
      console.log('Configurações salvas:', settings);
      
      // Mostra mensagem de sucesso
      this.showTemporaryMessage('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      this.showTemporaryMessage('Erro ao salvar configurações.', true);
    }
  }
  
  /**
   * Salva estatísticas do jogo
   */
  saveGameStats() {
    try {
      // Obtém estatísticas anteriores ou inicializa
      const stats = JSON.parse(localStorage.getItem('onepieceTrumpStats')) || {
        gamesPlayed: 0,
        playerWins: 0,
        computerWins: 0,
        draws: 0
      };
      
      // Incrementa contadores
      stats.gamesPlayed++;
      
      if (this.playerScore > this.computerScore) {
        stats.playerWins++;
      } else if (this.computerScore > this.playerScore) {
        stats.computerWins++;
      } else {
        stats.draws++;
      }
      
      // Salva estatísticas atualizadas
      localStorage.setItem('onepieceTrumpStats', JSON.stringify(stats));
    } catch (error) {
      console.error('Erro ao salvar estatísticas:', error);
    }
  }
  
  /**
   * Configura o modal de configurações
   */
  setupSettingsModal() {
    // Referências para o modal
    const modal = document.getElementById('settings-modal');
    const settingsToggle = document.getElementById('settings-toggle');
    const closeBtn = modal.querySelector('.close');
    const saveBtn = document.getElementById('save-settings');
    
    // Configura o estado inicial dos controles
    const soundCheckbox = document.getElementById('sound-enabled');
    const animationsCheckbox = document.getElementById('animations-enabled');
    const cardCountRadios = document.getElementsByName('card-count');
    const clearCacheBtn = document.getElementById('clear-cache-btn');
    
    // Define os valores iniciais baseados nas configurações
    soundCheckbox.checked = this.soundEnabled;
    animationsCheckbox.checked = this.animationsEnabled;
    
    // Seleciona o botão de rádio correto para número de cartas
    // Calcula o total de cartas (2x o número de cartas por jogador)
    let totalCards = this.cardsPerPlayer * 2;
    
    // Procura e seleciona o botão de rádio correspondente
    for (const radio of cardCountRadios) {
      if (parseInt(radio.value) === totalCards) {
        radio.checked = true;
        console.log(`Selecionando botão de rádio para ${totalCards} cartas totais (${this.cardsPerPlayer} por jogador)`);
        break;
      }
    }
    
    // Abre o modal
    settingsToggle.addEventListener('click', () => {
      // Atualiza o estado dos botões de rádio de acordo com a configuração atual
      for (const radio of cardCountRadios) {
        radio.checked = (parseInt(radio.value) === this.cardsPerPlayer * 2);
      }
      modal.style.display = 'block';
      this.playSound('click');
    });
    
    // Fecha o modal (X)
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
      this.playSound('click');
    });
    
    // Fecha o modal clicando fora
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
    
    // Limpa o cache do jogo
    clearCacheBtn.addEventListener('click', this.clearCache.bind(this));
    
    // Salva as configurações
    saveBtn.addEventListener('click', () => {
      // Obter as configurações atualizadas
      this.soundEnabled = soundCheckbox.checked;
      this.animationsEnabled = animationsCheckbox.checked;
      
      // Obter número de cartas selecionado
      for (const radio of cardCountRadios) {
        if (radio.checked) {
          // O valor no HTML já é o total de cartas, então dividimos por 2 para obter cartas por jogador
          this.cardsPerPlayer = parseInt(radio.value) / 2;
          console.log(`Configurando cardsPerPlayer para ${this.cardsPerPlayer} (${radio.value} total)`);
          break;
        }
      }
      
      // Salvar no localStorage
      this.saveSettings();
      
      // Atualizar a interface
      this.updateSettingsUI();
      
      // Fechar o modal
      modal.style.display = 'none';
      
      // Som de feedback
      this.playSound('click');
      
      // Perguntar se deseja reiniciar o jogo com as novas configurações
      if (!this.gameOver && this.allCharacters.length > 0) {
        if (confirm('Deseja reiniciar o jogo com as novas configurações?')) {
          this.restartGame();
        }
      }
    });
  }
  
  /**
   * Atualiza a interface de acordo com as configurações
   */
  updateSettingsUI() {
    // Atualiza os botões de controle
    const soundButton = document.getElementById('sound-toggle');
    const animationButton = document.getElementById('animation-toggle');
    
    if (soundButton) {
      const iconSound = soundButton.querySelector('i');
      iconSound.className = this.soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
      soundButton.classList.toggle('disabled', !this.soundEnabled);
    }
    
    if (animationButton) {
      const iconAnim = animationButton.querySelector('i');
      iconAnim.className = this.animationsEnabled ? 'fas fa-film' : 'fas fa-edit';
      animationButton.classList.toggle('disabled', !this.animationsEnabled);
      document.body.classList.toggle('reduced-motion', !this.animationsEnabled);
    }
  }

  /**
   * Carrega as configurações do jogo do localStorage
   */
  loadSettings() {
    const savedSettings = localStorage.getItem('onepieceGameSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.cardsPerPlayer = settings.cardsPerPlayer || 30;
      
      // Atualiza o botão radio correspondente no modal
      const radioOption = document.querySelector(`input[name="cardCount"][value="${this.cardsPerPlayer}"]`);
      if (radioOption) {
        radioOption.checked = true;
      }
    }
  }

  /**
   * Salva as configurações do jogo no localStorage
   */
  saveSettings() {
    const settings = {
      cardsPerPlayer: this.cardsPerPlayer
    };
    localStorage.setItem('onepieceGameSettings', JSON.stringify(settings));
  }

  /**
   * Aplica as configurações selecionadas no modal
   */
  applySettings() {
    const selectedCardCount = document.querySelector('input[name="cardCount"]:checked');
    if (selectedCardCount) {
      this.cardsPerPlayer = parseInt(selectedCardCount.value, 10);
    }
    
    // Salva as configurações
    this.saveSettings();
    
    // Fecha o modal
    const settingsModal = document.getElementById('settingsModal');
    settingsModal.style.display = 'none';
    
    // Reinicia o jogo com as novas configurações
    this.restart();
  }

  /**
   * Carrega as configurações salvas do localStorage
   */
  loadSettings() {
    const savedSettings = localStorage.getItem('onePieceGameSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        if (settings.cardsPerPlayer) {
          this.cardsPerPlayer = parseInt(settings.cardsPerPlayer);
        }
      } catch (e) {
        console.error('Erro ao carregar configurações:', e);
      }
    }
  }

  /**
   * Salva as configurações no localStorage
   */
  saveSettings() {
    const settings = {
      cardsPerPlayer: this.cardsPerPlayer
    };
    localStorage.setItem('onePieceGameSettings', JSON.stringify(settings));
  }

  /**
   * Aplica as configurações selecionadas no modal
   */
  applySettings() {
    const selectedCardCount = document.querySelector('input[name="cardCount"]:checked');
    if (selectedCardCount) {
      this.cardsPerPlayer = parseInt(selectedCardCount.value);
      this.saveSettings();
    }
    
    // Fecha o modal
    document.getElementById('settingsModal').style.display = 'none';
    
    // Reproduz o som de clique
    this.sounds.click.play();
    
    // Se o jogo não começou, inicia com as novas configurações
    if (!this.gameStarted) {
      this.restart();
    } else {
      // Informa ao jogador que as novas configurações serão aplicadas no próximo jogo
      this.showMessage('As novas configurações serão aplicadas no próximo jogo', 2000);
    }
  }

  /**
   * Salva as configurações atuais no localStorage
   */
  saveSettings() {
    const settings = {
      cardsPerPlayer: this.cardsPerPlayer
    };
    localStorage.setItem('onepieceGameSettings', JSON.stringify(settings));
  }

  /**
   * Carrega as configurações do localStorage
   */
  loadSettings() {
    const savedSettings = localStorage.getItem('onepieceGameSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.cardsPerPlayer = settings.cardsPerPlayer || 30;
    }
  }

  /**
   * Aplica as configurações definidas no modal
   */
  applySettings() {
    const selectedOption = document.querySelector('input[name="cardCount"]:checked');
    if (selectedOption) {
      this.cardsPerPlayer = parseInt(selectedOption.value);
      this.saveSettings();
      
      // Fecha o modal
      document.getElementById('settingsModal').style.display = 'none';
      
      // Reinicia o jogo com as novas configurações
      this.restart();
      
      // Toca o som de confirmação
      this.playSound('click');
    }
  }

  /**
   * Configura os controles de teclado e acessibilidade
   */
  setupKeyboardControls() {
    document.addEventListener('keydown', (e) => {
      // Evitar processamento de teclas quando elementos de formulário estão em foco
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
        return;
      }
      
      switch (e.key) {
        case '1': case 'a': // Selecionar primeiro atributo
          this.selectAttributeByIndex(0);
          break;
        case '2': case 's': // Selecionar segundo atributo
          this.selectAttributeByIndex(1);
          break;
        case '3': case 'd': // Selecionar terceiro atributo
          this.selectAttributeByIndex(2);
          break;
        case '4': case 'f': // Selecionar quarto atributo
          this.selectAttributeByIndex(3);
          break;
        case '5': case 'g': // Selecionar quinto atributo (se existir)
          this.selectAttributeByIndex(4);
          break;
        case 'Enter': // Jogar carta com o atributo selecionado
          if (!this.playButton.disabled && !this.playButton.classList.contains('hidden')) {
            this.playRound();
          }
          break;
        case ' ': // Espaço para avançar para a próxima carta
          if (!this.nextButton.classList.contains('hidden')) {
            this.showNextCards();
          }
          break;
        case 'r': // Reiniciar jogo
          if (!this.restartButton.classList.contains('hidden')) {
            this.restart();
          }
          break;
      }
    });
  }
  
  /**
   * Seleciona um atributo pelo índice
   * @param {number} index - O índice do atributo a ser selecionado
   */
  selectAttributeByIndex(index) {
    const attributeElements = this.playerCardElement.querySelectorAll('.attribute.clickable');
    if (index >= 0 && index < attributeElements.length) {
      // Simula um clique no atributo
      attributeElements[index].click();
    }
  }

  /**
   * Configura os controles de teclado e acessibilidade
   */
  setupAccessibility() {
    // Cria um elemento de anúncio para leitores de tela se ainda não existir
    if (!document.getElementById('screen-reader-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'screen-reader-announcer';
      announcer.className = 'sr-only';
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      document.body.appendChild(announcer);
    }

    // Adiciona instruções de acessibilidade ao jogo
    const accessibilityInstructions = document.createElement('div');
    accessibilityInstructions.id = 'accessibility-instructions';
    accessibilityInstructions.className = 'sr-only';
    accessibilityInstructions.innerHTML = `
      <h2>Instruções de acessibilidade</h2>
      <p>Use as teclas numéricas 1, 2 e 3 para selecionar um atributo.</p>
      <p>Pressione Enter para jogar com o atributo selecionado.</p>
      <p>Pressione Espaço para avançar para a próxima carta.</p>
      <p>Pressione R para reiniciar o jogo.</p>
      <p>Pressione M para ativar ou desativar o som.</p>
    `;
    document.body.appendChild(accessibilityInstructions);

    // Adiciona link de acessibilidade no rodapé
    const footer = document.querySelector('footer');
    if (footer) {
      const accessibilityLink = document.createElement('button');
      accessibilityLink.className = 'accessibility-button';
      accessibilityLink.innerHTML = '<i class="fas fa-universal-access"></i> Acessibilidade';
      accessibilityLink.setAttribute('aria-label', 'Instruções de acessibilidade');
      accessibilityLink.addEventListener('click', () => {
        this.showAccessibilityInstructions();
        this.playSound('click');
      });
      footer.appendChild(accessibilityLink);
    }
  }

  /**
   * Exibe instruções de acessibilidade em um modal
   */
  showAccessibilityInstructions() {
    // Cria o modal se não existir
    let modal = document.getElementById('accessibility-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'accessibility-modal';
      modal.className = 'modal';
      modal.innerHTML = `
        <div class="modal-content">
          <span class="close" tabindex="0" aria-label="Fechar instruções de acessibilidade">&times;</span>
          <h2>Instruções de Acessibilidade</h2>
          <ul>
            <li><strong>Teclas 1, 2, 3:</strong> Selecionar atributos (Força, Inteligência, Velocidade)</li>
            <li><strong>Enter:</strong> Jogar com o atributo selecionado</li>
            <li><strong>Espaço:</strong> Avançar para a próxima carta</li>
            <li><strong>R:</strong> Reiniciar o jogo</li>
            <li><strong>M:</strong> Ativar/desativar som</li>
          </ul>
          <p>Este jogo tem suporte para leitores de tela. As informações relevantes são anunciadas automaticamente.</p>
        </div>
      `;
      document.body.appendChild(modal);
      
      // Adiciona evento para fechar o modal
      const closeButton = modal.querySelector('.close');
      closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
        this.playSound('click');
      });
      
      // Fecha o modal ao clicar fora dele
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.style.display = 'none';
        }
      });
      
      // Suporte a teclado para fechar
      closeButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          modal.style.display = 'none';
          this.playSound('click');
        }
      });
    }
    
    // Exibe o modal
    modal.style.display = 'flex';
    
    // Anuncia para leitores de tela
    this.announceForScreenReaders('Instruções de acessibilidade abertas');
    
    // Foca no botão de fechar para acessibilidade
    setTimeout(() => {
      modal.querySelector('.close').focus();
    }, 100);
  }

  /**
   * Retorna o rótulo do atributo com base no nome do atributo.
   * @param {string} attribute - Nome do atributo (e.g., 'strength', 'intelligence', 'speed').
   * @returns {string} - Rótulo do atributo em português.
   */
  getAttributeLabel(attribute) {
    const labels = {
      strength: 'Força',
      intelligence: 'Inteligência',
      speed: 'Velocidade',
      bounty: 'Recompensa',
      devil_fruit: 'Fruta do Diabo'
    };
    return labels[attribute] || attribute;
  }

  /**
   * Avança para a próxima rodada do jogo.
   */
  nextRound() {
    // DEBUG: Registrar o estado antes de limpar
    console.log("Estado antes de avançar para a próxima rodada:", {
      roundCount: this.roundCount,
      playerScore: this.playerScore,
      computerScore: this.computerScore,
      playerDeckSize: this.playerDeck.length,
      computerDeckSize: this.computerDeck.length
    });
    
    // Reseta o estado das cartas para a próxima rodada
    this.resetCardState();

    // Mostra as próximas cartas para o jogador e o computador
    // NÃO incrementa o contador de rodadas aqui, pois já é incrementado em evaluateRound()
    this.showNextCards(false); // Passa false para não incrementar o contador novamente

    // Atualiza o status do jogo
    this.gameStatusElement.textContent = "Selecione um atributo para jogar!";

    // Esconde o botão de próxima rodada e mostra o botão de jogar
    this.nextButton.classList.add('hidden');
    this.playButton.classList.remove('hidden');
    this.playButton.focus(); // Foco automático para acessibilidade
  }
}

// Inicializa o jogo quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
  const game = new TrumpGame();
  game.init();
});