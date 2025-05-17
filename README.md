# Trunfo de One Piece

Um jogo de cartas de trunfo (trump cards) baseado nos personagens do anime/mangá One Piece. Compare os atributos dos personagens e vença suas cartas do computador!

## Descrição

Este jogo de cartas permite que você jogue contra o computador usando os personagens de One Piece. Cada personagem possui atributos como força, inteligência, velocidade e valor de recompensa. O jogador seleciona um atributo para comparar com a carta do computador - quem tiver o valor mais alto vence a rodada e ganha a carta do oponente.

## 🎮 Funcionalidades

- Jogo de cartas estilo "trunfo" onde você compete contra o computador
- Cartas com personagens de One Piece e seus atributos
- Interface responsiva e amigável
- Efeitos sonoros para uma experiência mais imersiva
- Animações durante o jogo
- Carregamento de dados a partir de APIs externas, com opções de fallback
- Sistema de cache para melhorar performance e permitir uso offline
- Configurações personalizáveis (número de cartas, sons, animações)

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilização e design responsivo com animações e gradientes
- **JavaScript Vanilla**: Toda a lógica do jogo sem dependências externas
- **API REST**: Integração com API personalizada hospedada na Vercel
- **LocalStorage**: Para cache de dados e configurações do usuário
- **Web Audio API**: Para reprodução de efeitos sonoros
- **Vercel**: Hospedagem da API de personagens
- **Fetch API**: Comunicação assíncrona com o backend

## ⚙️ Arquitetura da API

O jogo utiliza uma API personalizada hospedada na Vercel para obter os dados dos personagens:

- **Endpoint principal**: `https://onepiece-beta.vercel.app/api/characters-api`
- **Tecnologia backend**: Node.js com serverless functions da Vercel
- **Formato de dados**: JSON contendo informações detalhadas dos personagens
- **Sistema de fallback**: Caso a API esteja indisponível, o jogo carrega os dados de um arquivo local

### Como funciona o fluxo de dados:

1. Ao iniciar o jogo, a aplicação tenta buscar os dados dos personagens do endpoint na Vercel
2. A API processa a solicitação e retorna um JSON com todos os personagens e seus atributos
3. Os dados são processados e transformados no formato necessário para o jogo
4. Em caso de falha na conexão, um sistema de fallback carrega os dados localmente
5. O jogo armazena os dados em cache para uso futuro, reduzindo chamadas à API
6. Os personagens são então distribuídos aleatoriamente entre o jogador e o computador

## 🎯 Funcionamento do Jogo

O jogo de trunfo utiliza os dados da API da seguinte forma:

1. Os personagens obtidos são convertidos em cartas de jogo com seus respectivos atributos
2. Cada carta contém atributos como:
   - Força (Strength)
   - Inteligência (Intelligence)
   - Velocidade (Speed)
   - Recompensa (Bounty)
   - Fruta do Diabo (Devil Fruit)
3. As cartas são distribuídas aleatoriamente entre o jogador e o computador
4. O jogador escolhe um atributo da sua carta para comparar com a carta do computador
5. O sistema compara os valores e determina o vencedor da rodada
6. O vencedor recebe a carta do oponente, adicionando-a ao seu baralho
7. O jogo continua até que um dos jogadores tenha todas as cartas

## 🚀 Como Jogar

1. Quando o jogo inicia, as cartas são distribuídas aleatoriamente
2. Você recebe uma carta com um personagem de One Piece
3. Escolha um dos atributos do personagem (força, inteligência ou velocidade) clicando nele
4. Clique em "Jogar" para comparar com a carta do computador
5. Quem tiver o valor mais alto no atributo escolhido vence a rodada e ganha a carta do adversário
6. O jogo continua até que um dos jogadores fique sem cartas
7. Vence quem conseguir todas as cartas!

## ⚙️ Configurações Personalizáveis

O jogo permite personalizar diversas configurações através do menu de configurações:

- **Número de cartas**: 30, 40 ou 50 cartas (15, 20 ou 25 para cada jogador)
- **Sons**: Ativar ou desativar efeitos sonoros
- **Animações**: Ativar ou desativar animações do jogo
- **Cache**: Opção para limpar os dados em cache

## 📋 Requisitos

- Navegador web moderno com suporte a JavaScript ES6+
- Conexão com a internet para o primeiro carregamento (depois funciona offline com cache)

## 🖥️ Instalação para Desenvolvimento

1. Clone o repositório
2. Abra o diretório do projeto
3. Se desejar usar a API localmente, navegue até a pasta `/api` e execute o servidor
4. Abra o arquivo `index.html` em um navegador web ou use um servidor local

## 🧪 Testando a API

O jogo inclui uma funcionalidade oculta para testar a disponibilidade da API:

1. A aplicação tenta acessar primeiramente o endpoint na Vercel: `https://onepiece-beta.vercel.app/api/characters-api`
2. Caso falhe, tenta acessar o endpoint local: `api/characters-api`
3. Se ambos falharem, utiliza os dados de backup armazenados localmente

## 📈 Futuras Melhorias

- Modo multijogador online
- Mais personagens e atributos
- Animações e efeitos visuais aprimorados
- Modos de jogo adicionais
- Ranking de melhores jogadores

## 📝 Licença

[Licença MIT](LICENSE)

---

*Este jogo é um projeto de fã sem fins lucrativos. One Piece e todos os personagens são propriedade de Eiichiro Oda, Shueisha e Toei Animation.*