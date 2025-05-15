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

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Estilização e design responsivo
- **JavaScript Vanilla**: Toda a lógica do jogo sem dependências externas
- **APIs REST**: Integração com APIs de One Piece para obtenção de dados dos personagens:
  - API Jikan (MyAnimeList)
  - Sistema de fallback com dados locais quando as APIs estão indisponíveis
- **LocalStorage**: Para cache de dados e funcionamento offline
- **Áudio Web API**: Para reprodução de efeitos sonoros

## 🚀 Como Jogar

1. Quando o jogo inicia, as cartas são distribuídas aleatoriamente
2. Você recebe uma carta com um personagem de One Piece
3. Escolha um dos atributos do personagem (força, inteligência ou velocidade) clicando nele
4. Clique em "Jogar" para comparar com a carta do computador
5. Quem tiver o valor mais alto no atributo escolhido vence a rodada e ganha a carta do adversário
6. O jogo continua até que um dos jogadores fique sem cartas
7. Vence quem conseguir todas as cartas!

## 📋 Requisitos

- Navegador web moderno com suporte a JavaScript ES6+
- Conexão com a internet para o primeiro carregamento (depois funciona offline com cache)

## 🖥️ Instalação para Desenvolvimento

1. Clone o repositório
2. Abra o diretório do projeto
3. Abra o arquivo `index.html` em um navegador web

## 📝 Licença

[Licença MIT](LICENSE)


---

*Este jogo é um projeto de fã sem fins lucrativos. One Piece e todos os personagens são propriedade de Eiichiro Oda, Shueisha e Toei Animation.*