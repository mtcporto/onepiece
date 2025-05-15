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

// URLs de APIs do One Piece - tentaremos em sequência
const apiUrls = [
  'https://api.api-onepiece.com/v2/characters/en',
  'https://api.jikan.moe/v4/anime/21/characters', // API Jikan (MyAnimeList) para One Piece
  'https://anime-facts-rest-api.herokuapp.com/api/v1/one_piece' // API de fatos sobre One Piece
];

// Dados de backup garantidos com URLs de imagens corrigidas
const fallbackCharacters = [
  {
    id: 1,
    name: "Monkey D. Luffy",
    image: "https://i.imgur.com/V5lEOHo.jpg",
    strength: 95,
    intelligence: 70,
    speed: 90,
    bounty: "3.000.000.000 Berries",
    devil_fruit: "Gomu Gomu no Mi"
  },
  {
    id: 2,
    name: "Roronoa Zoro",
    image: "https://i.imgur.com/TIrPHnz.jpg",
    strength: 93,
    intelligence: 75,
    speed: 85,
    bounty: "1.111.000.000 Berries",
    devil_fruit: "Nenhuma"
  },
  {
    id: 3,
    name: "Nami",
    image: "https://i.imgur.com/Tzh2k2X.jpg",
    strength: 65,
    intelligence: 95,
    speed: 80,
    bounty: "366.000.000 Berries",
    devil_fruit: "Nenhuma"
  },
  {
    id: 4,
    name: "Usopp",
    image: "https://i.imgur.com/4a1n3RN.jpg",
    strength: 70,
    intelligence: 85,
    speed: 75,
    bounty: "500.000.000 Berries",
    devil_fruit: "Nenhuma"
  },
  {
    id: 5,
    name: "Sanji",
    image: "https://i.imgur.com/kAJgcCA.jpg",
    strength: 90,
    intelligence: 85,
    speed: 92,
    bounty: "1.032.000.000 Berries",
    devil_fruit: "Nenhuma"
  },
  {
    id: 6,
    name: "Tony Tony Chopper",
    image: "https://i.imgur.com/OcLghbX.jpg",
    strength: 75,
    intelligence: 95,
    speed: 80,
    bounty: "1.000 Berries",
    devil_fruit: "Hito Hito no Mi"
  },
  {
    id: 7,
    name: "Nico Robin",
    image: "https://i.imgur.com/xnVYVBm.jpg",
    strength: 75,
    intelligence: 98,
    speed: 80,
    bounty: "930.000.000 Berries",
    devil_fruit: "Hana Hana no Mi"
  },
  {
    id: 8,
    name: "Franky",
    image: "https://i.imgur.com/7RDZvw1.jpg",
    strength: 88,
    intelligence: 90,
    speed: 75,
    bounty: "394.000.000 Berries",
    devil_fruit: "Nenhuma"
  },
  {
    id: 9,
    name: "Brook",
    image: "https://i.imgur.com/q5MWJ3c.jpg",
    strength: 80,
    intelligence: 83,
    speed: 90,
    bounty: "383.000.000 Berries",
    devil_fruit: "Yomi Yomi no Mi"
  },
  {
    id: 10,
    name: "Jinbe",
    image: "https://i.imgur.com/iINQzwl.jpg",
    strength: 92,
    intelligence: 90,
    speed: 85,
    bounty: "1.100.000.000 Berries",
    devil_fruit: "Nenhuma"
  },
  {
    id: 11,
    name: "Trafalgar D. Water Law",
    image: "https://i.imgur.com/WwQ3f04.jpg",
    strength: 90,
    intelligence: 97,
    speed: 88,
    bounty: "3.000.000.000 Berries",
    devil_fruit: "Ope Ope no Mi"
  },
  {
    id: 12,
    name: "Boa Hancock",
    image: "https://i.imgur.com/5VHwo8e.jpg",
    strength: 90,
    intelligence: 85,
    speed: 87,
    bounty: "1.659.000.000 Berries",
    devil_fruit: "Mero Mero no Mi"
  },
  {
    id: 13,
    name: "Marshall D. Teach",
    image: "https://i.imgur.com/T7m3gkK.jpg",
    strength: 96,
    intelligence: 90,
    speed: 75,
    bounty: "3.996.000.000 Berries",
    devil_fruit: "Yami Yami no Mi, Gura Gura no Mi"
  },
  {
    id: 14,
    name: "Monkey D. Garp",
    image: "https://i.imgur.com/JonuHiQ.jpg",
    strength: 95,
    intelligence: 85,
    speed: 85,
    bounty: "Desconhecida",
    devil_fruit: "Nenhuma"
  },
  {
    id: 15,
    name: "Portgas D. Ace",
    image: "https://i.imgur.com/tjSXuxC.jpg",
    strength: 93,
    intelligence: 88,
    speed: 94,
    bounty: "550.000.000 Berries",
    devil_fruit: "Mera Mera no Mi"
  },
  {
    id: 16,
    name: "Shanks",
    image: "https://i.imgur.com/XzTaHSc.jpg",
    strength: 99,
    intelligence: 95,
    speed: 94,
    bounty: "4.048.900.000 Berries",
    devil_fruit: "Nenhuma"
  },
  {
    id: 17,
    name: "Charlotte Katakuri",
    image: "https://i.imgur.com/OGVQ5gX.jpg",
    strength: 93,
    intelligence: 90,
    speed: 93,
    bounty: "1.057.000.000 Berries",
    devil_fruit: "Mochi Mochi no Mi"
  },
  {
    id: 18,
    name: "Silvers Rayleigh",
    image: "https://i.imgur.com/DQi6TS0.jpg",
    strength: 97,
    intelligence: 96,
    speed: 92,
    bounty: "Desconhecida",
    devil_fruit: "Nenhuma"
  },
  {
    id: 19,
    name: "Dracule Mihawk",
    image: "https://i.imgur.com/cqq6Ajc.jpg",
    strength: 98,
    intelligence: 94,
    speed: 90,
    bounty: "Desconhecida",
    devil_fruit: "Nenhuma"
  },
  {
    id: 20,
    name: "Kaido",
    image: "https://i.imgur.com/F2hsMoB.jpg",
    strength: 100,
    intelligence: 85,
    speed: 85,
    bounty: "4.611.100.000 Berries",
    devil_fruit: "Uo Uo no Mi, Modelo Seiryu"
  }
];

// Estrutura adaptadora para diferentes formatos de API
const apiAdapters = {
  // Adaptador para a API original
  'api-onepiece': function(data) {
    return data.filter(char => 
      char.image && 
      !char.image.includes('default') &&
      char.name
    ).map(char => ({
      id: char.id,
      name: char.name,
      image: char.image,
      strength: calculateAttribute(char.bounty, 1, 100),
      intelligence: calculateAttribute(char.position, 1, 100),
      speed: Math.floor(Math.random() * 100) + 1,
      bounty: formatBounty(char.bounty || 0),
      devil_fruit: char.devil_fruit || 'Nenhuma'
    }));
  },
  
  // Adaptador para a API Jikan (MyAnimeList)
  'jikan': function(data) {
    if (!data.data) return [];
    
    return data.data.map((char, index) => ({
      id: index + 1,
      name: char.character.name,
      image: char.character.images.jpg.image_url,
      strength: Math.floor(Math.random() * 100) + 1,
      intelligence: Math.floor(Math.random() * 100) + 1,
      speed: Math.floor(Math.random() * 100) + 1,
      bounty: formatBounty(Math.floor(Math.random() * 5000000000)),
      devil_fruit: 'Desconhecida'
    }));
  },
  
  // Adaptador para a API de fatos do One Piece
  'anime-facts': function(data) {
    if (!data.data || !Array.isArray(data.data)) return [];
    
    // Esta API não retorna personagens, então usamos os dados de backup
    // mas com imagens diferentes se disponíveis
    return fallbackCharacters.map((char, index) => ({
      ...char,
      // Só para combinar alguns dados da API, se existirem
      id: index + 1
    }));
  }
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
 * Busca os personagens de todas as APIs disponíveis em sequência até encontrar uma que funcione
 * @param {function} onStartLoading - Callback para início do carregamento
 * @param {function} onError - Callback para erro
 * @param {function} onComplete - Callback para sucesso com os personagens
 */
async function fetchCharacters(onStartLoading, onError, onComplete) {
  try {
    if (onStartLoading) onStartLoading();
    
    // Primeiro tenta carregar do cache
    const cachedCharacters = loadFromCache();
    if (cachedCharacters) {
      if (onComplete) onComplete(cachedCharacters);
      return;
    }
    
    // Se não tiver cache, tenta cada API em sequência
    for (let i = 0; i < apiUrls.length; i++) {
      const url = apiUrls[i];
      console.log(`Tentando API ${i+1}/${apiUrls.length}: ${url}`);
      
      const startTime = performance.now();
      const data = await fetchWithTimeout(url);
      const endTime = performance.now();
      console.log(`Tempo para buscar dados: ${Math.round(endTime - startTime)}ms`);
      
      if (!data) continue; // Se falhar, tenta a próxima API
      
      // Sanitiza os dados recebidos
      const sanitizedData = sanitizeData(data);
      
      // Identifica qual adaptador usar
      let adapter;
      if (url.includes('jikan')) {
        adapter = apiAdapters.jikan;
      } else if (url.includes('anime-facts')) {
        adapter = apiAdapters['anime-facts'];
      } else {
        adapter = apiAdapters['api-onepiece'];
      }
      
      // Processa os dados usando o adaptador apropriado
      const characters = adapter(sanitizedData);
      
      // Verifica se temos personagens suficientes
      if (characters.length >= CONFIG.MIN_CHARACTERS) {
        // Salva no cache para uso futuro
        saveToCache(characters);
        
        if (onComplete) onComplete(characters);
        return;
      }
      
      console.log(`API ${i+1} retornou apenas ${characters.length} personagens, tentando próxima...`);
    }
    
    // Se chegou aqui, nenhuma API funcionou adequadamente
    throw new Error('Nenhuma das APIs retornou dados suficientes');
    
  } catch (error) {
    console.error('Erro ao buscar personagens:', error);
    
    if (onError) {
      onError(`Erro ao carregar personagens: ${error.message}`);
    }
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
 * Retorna os personagens de backup
 * @returns {Array} - Array de personagens de backup
 */
function getBackupCharacters() {
  return [...fallbackCharacters];
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
  getBackupCharacters,
  calculateAttribute,
  formatBounty,
  clearCache
};