// Importa o arquivo JSON dos personagens
const characters = require('./characters.json');

// Handler da função serverless
module.exports = (req, res) => {
  // Configurar CORS para permitir acesso de qualquer origem
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  
  // Se for um request OPTIONS (preflight), retorna apenas os headers
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Para GET, retorna o JSON
  if (req.method === 'GET') {
    return res.status(200).json(characters);
  }
  
  // Método não permitido
  return res.status(405).json({ error: 'Method not allowed' });
};