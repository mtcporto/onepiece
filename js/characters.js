/**
 * Módulo para carregamento e processamento dos personagens de One Piece
 */

// Configurações globais
const CONFIG = {
  API_TIMEOUT: 8000,
  CACHE_DURATION: 24 * 60 * 60 * 1000, // 24 horas em milissegundos
  MIN_CHARACTERS: 10,
  ENABLE_CACHE: true,
  CACHE_KEY: 'one_piece_trump_characters'
};

// URLs da API centralizada do One Piece - múltiplas opções para funcionar em diferentes ambientes
const apiUrls = [
  'https://onepiece-beta.vercel.app/api/characters-api', // Endpoint online (funcionando)
  'api/characters-api',                                  // Endpoint local serverless
  '/api/characters-api',                                 // Endpoint local com barra inicial
  './api/characters-api',                                // Endpoint local com caminho relativo
  'api/characters.json',                                 // Arquivo JSON estático (fallback)
  '/api/characters.json',                                // Arquivo JSON estático com barra inicial
  './api/characters.json'                                // Arquivo JSON estático com caminho relativo
];
 
// Estrutura adaptadora para diferentes formatos de API
const apiAdapters = {
  'api-onepiece': data => data
    .filter(char => 
      // Filtra apenas personagens que possuem imagem
      (char.images?.jpg?.image_url || char.images?.webp?.image_url)
    )
    .map(char => ({
      id: char.id,
      name: char.name,
      image: char.images?.jpg?.image_url || char.images?.webp?.image_url || '', // Use full-size images only
      strength: calculateAttribute(char.bounty, 1, 100),
      intelligence: calculateAttribute(char.age, 1, 100),
      speed: Math.floor(Math.random() * 100) + 1,
      bounty: char.bounty ? formatBounty(parseInt(String(char.bounty).replace(/\D/g, ''), 10)) : 'Desconhecida',
      devil_fruit: char.fruit?.roman_name || 'Nenhuma'
    }))
};

/**
 * Sanitiza dados recebidos da API para evitar injeções e outros problemas de segurança
 * @param {Object} data - Dados a serem sanitizados
 * @returns {Object} - Dados sanitizados
 */
function sanitizeData(data) {
  if (!data) return data;
  
  if (typeof data === 'string') {
    // Sanitiza strings
    return data
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/`/g, '&#96;')
      .replace(/\(/g, '&#40;')
      .replace(/\)/g, '&#41;');
  }
  
  if (Array.isArray(data)) {
    // Sanitiza arrays recursivamente
    return data.map(item => sanitizeData(item));
  }
  
  if (typeof data === 'object' && data !== null) {
    // Sanitiza objetos recursivamente
    const sanitizedData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sanitizedData[key] = sanitizeData(data[key]);
      }
    }
    return sanitizedData;
  }
  
  // Valores primitivos são retornados como estão
  return data;
}

/**
 * Calcula um atributo baseado em dados existentes ou gera aleatoriamente
 * @param {any} value - Valor base para cálculo do atributo
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {number} - Valor do atributo calculado
 */
function calculateAttribute(value, min, max) {
  if (!value) return Math.floor(Math.random() * max) + min;
  
  if (typeof value === 'string' && value.includes('Berries')) {
    const numericValue = parseInt(value.replace(/[^\d]/g, ''));
    if (numericValue > 0) {
      // Normaliza o valor da recompensa para um número entre min e max
      return Math.min(max, Math.max(min, Math.floor(numericValue / 10000000) + 50));
    }
  }
  
  return Math.floor(Math.random() * max) + min;
}

/**
 * Formata o valor da recompensa
 * @param {number|string} bounty - Valor da recompensa
 * @returns {string} - Recompensa formatada
 */
function formatBounty(bounty) {
  if (!bounty || bounty === 0) return 'Desconhecida';
  
  // Se já for uma string formatada
  if (typeof bounty === 'string' && bounty.includes('Berries')) {
    return bounty;
  }
  
  // Formata o número
  return new Intl.NumberFormat('pt-BR').format(bounty) + ' Berries';
}

/**
 * Salva dados no cache local
 * @param {Array} characters - Array de personagens para salvar no cache
 */
function saveToCache(characters) {
  if (!CONFIG.ENABLE_CACHE || !characters || characters.length < CONFIG.MIN_CHARACTERS) return;
  
  try {
    const cacheData = {
      timestamp: Date.now(),
      characters: characters
    };
    
    localStorage.setItem(CONFIG.CACHE_KEY, JSON.stringify(cacheData));
    console.log('Dados salvos no cache local');
  } catch (error) {
    console.warn('Erro ao salvar no cache:', error);
  }
}

/**
 * Carrega dados do cache local se estiverem disponíveis e válidos
 * @returns {Array|null} - Array de personagens do cache ou null se não disponível/válido
 */
function loadFromCache() {
  if (!CONFIG.ENABLE_CACHE) return null;
  
  try {
    const cacheDataString = localStorage.getItem(CONFIG.CACHE_KEY);
    if (!cacheDataString) return null;
    
    const cacheData = JSON.parse(cacheDataString);
    const now = Date.now();
    
    // Verifica se o cache está expirado
    if (now - cacheData.timestamp > CONFIG.CACHE_DURATION) {
      console.log('Cache expirado');
      return null;
    }
    
    if (!cacheData.characters || cacheData.characters.length < CONFIG.MIN_CHARACTERS) {
      return null;
    }
    
    console.log('Dados carregados do cache local');
    return cacheData.characters;
  } catch (error) {
    console.warn('Erro ao carregar do cache:', error);
    return null;
  }
}

/**
 * Tenta buscar dados de uma API com tratamento de erros e timeout
 * @param {string} url - URL da API
 * @param {number} timeoutMs - Tempo limite em milissegundos
 * @returns {Promise<Object>} - Dados da API ou null em caso de falha
 */
async function fetchWithTimeout(url, timeoutMs = CONFIG.API_TIMEOUT) {
  // Implementa mecanismo de retry para lidar com falhas temporárias
  const maxRetries = 2;
  let lastError = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      console.log(`Tentativa ${attempt} de ${maxRetries} para ${url}`);
      // Espera progressivamente mais entre tentativas
      await new Promise(resolve => setTimeout(resolve, attempt * 1000));
    }
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, { 
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Erro na tentativa ${attempt + 1}/${maxRetries + 1} para ${url}:`, error);
      lastError = error;
      // Continua para a próxima tentativa se não for o último
      if (attempt === maxRetries) {
        return null;
      }
    }
  }
  
  return null;
}

/**
 * Busca os personagens do arquivo local
 */
async function fetchCharacters(onStartLoading, onError, onComplete) {
  try {
    if (onStartLoading) onStartLoading();

    // Tenta carregar do cache
    const cached = loadFromCache();
    if (cached) {
      if (onComplete) onComplete(cached);
      return;
    }

    // Tenta cada URL da API em sequência
    let success = false;
    let data = null;
    let lastError = null;

    for (const apiUrl of apiUrls) {
      try {
        console.log(`Tentando carregar personagens de: ${apiUrl}`);
        const response = await fetch(apiUrl, { 
          headers: { 
            'Accept': 'application/json', 
            'Cache-Control': 'no-cache' 
          } 
        });
        
        if (!response.ok) {
          console.log(`Falha ao carregar de ${apiUrl}: ${response.status}`);
          continue; // Tenta a próxima URL
        }
        
        data = await response.json();
        success = true;
        console.log(`Personagens carregados com sucesso de: ${apiUrl}`);
        break; // Sai do loop se conseguiu carregar
      } catch (err) {
        console.log(`Erro ao carregar de ${apiUrl}:`, err);
        lastError = err;
        // Continua tentando a próxima URL
      }
    }

    if (!success) {
      throw lastError || new Error('Todas as URLs de API falharam');
    }

    // Adapta os dados e salva no cache
    const characters = apiAdapters['api-onepiece'](data);
    if (characters.length < CONFIG.MIN_CHARACTERS) throw new Error('Poucos personagens no arquivo local');
    saveToCache(characters);

    if (onComplete) onComplete(characters);
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
    if (onError) onError(`Erro ao carregar personagens: ${error.message}`);
  }
}

/**
 * Testa a conexão com as APIs
 * @param {function} onApiAvailable - Callback para quando uma API está disponível
 * @param {function} onApiError - Callback para quando todas as APIs estão indisponíveis
 */
async function testApiConnection(onApiAvailable, onApiError) {
  try {
    // Primeiro verifica se temos cache válido
    const cachedCharacters = loadFromCache();
    if (cachedCharacters) {
      console.log('Cache válido encontrado, pulando teste de API');
      if (onApiAvailable) onApiAvailable();
      return;
    }
    
    // Testa cada API em sequência
    for (let i = 0; i < apiUrls.length; i++) {
      const url = apiUrls[i];
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        
        const response = await fetch(url, { 
          method: 'HEAD', 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          console.log(`API disponível: ${url}`);
          if (onApiAvailable) onApiAvailable();
          return;
        }
      } catch (err) {
        console.log(`API ${url} indisponível:`, err.message);
        // Continua tentando a próxima API
      }
    }
    
    // Se chegou aqui, nenhuma API está disponível
    throw new Error('Todas as APIs estão indisponíveis');
    
  } catch (error) {
    console.error('Erro ao testar conexão com APIs:', error);
    if (onApiError) onApiError(error);
  }
}

/**
 * Limpa o cache de personagens
 */
function clearCache() {
  try {
    localStorage.removeItem(CONFIG.CACHE_KEY);
    console.log('Cache limpo com sucesso');
    return true;
  } catch (error) {
    console.error('Erro ao limpar cache:', error);
    return false;
  }
}

// Exporta as funções para uso externo
window.CharacterService = {
  fetchCharacters,
  testApiConnection,
  calculateAttribute,
  formatBounty,
  clearCache,
  getBackupCharacters: () => {
    console.log("Using backup character data.");
    // Provide a small, predefined list of characters as a fallback
    return [
      { id: 'backup1', name: 'Monkey D. Luffy (Backup)', image: 'https://cdn.myanimelist.net/images/characters/9/310307.webp', strength: 95, intelligence: 70, speed: 90, bounty: '3,000,000,000', devil_fruit: 'Gomu Gomu no Mi' },
      { id: 'backup2', name: 'Roronoa Zoro (Backup)', image: 'https://cdn.myanimelist.net/images/characters/3/100534.webp', strength: 92, intelligence: 65, speed: 85, bounty: '1,101,000,000', devil_fruit: 'N/A' },
      { id: 'backup3', name: 'Nami (Backup)', image: 'https://cdn.myanimelist.net/images/characters/2/263249.webp', strength: 60, intelligence: 85, speed: 70, bounty: '366,000,000', devil_fruit: 'N/A' },
      { id: 'backup4', name: 'Usopp (Backup)', image: 'https://cdn.myanimelist.net/images/characters/16/188076.webp', strength: 65, intelligence: 75, speed: 70, bounty: '500,000,000', devil_fruit: 'N/A' },
      { id: 'backup5', name: 'Sanji (Backup)', image: 'https://cdn.myanimelist.net/images/characters/5/136769.webp', strength: 90, intelligence: 75, speed: 88, bounty: '1,032,000,000', devil_fruit: 'N/A' },
      { id: 'backup6', name: 'Tony Tony Chopper (Backup)', image: 'https://cdn.myanimelist.net/images/characters/9/100533.webp', strength: 50, intelligence: 90, speed: 60, bounty: '1,000', devil_fruit: 'Hito Hito no Mi' },
      { id: 'backup7', name: 'Nico Robin (Backup)', image: 'https://cdn.myanimelist.net/images/characters/16/363700.webp', strength: 70, intelligence: 95, speed: 70, bounty: '930,000,000', devil_fruit: 'Hana Hana no Mi' },
      { id: 'backup8', name: 'Franky (Backup)', image: 'https://cdn.myanimelist.net/images/characters/13/210053.webp', strength: 85, intelligence: 60, speed: 65, bounty: '394,000,000', devil_fruit: 'N/A' },
      { id: 'backup9', name: 'Brook (Backup)', image: 'https://cdn.myanimelist.net/images/characters/10/100532.webp', strength: 75, intelligence: 70, speed: 80, bounty: '383,000,000', devil_fruit: 'Yomi Yomi no Mi' },
      { id: 'backup10', name: 'Jinbe (Backup)', image: 'https://cdn.myanimelist.net/images/characters/3/483148.webp', strength: 93, intelligence: 80, speed: 70, bounty: '1,100,000,000', devil_fruit: 'N/A' }
    ];
  }
};