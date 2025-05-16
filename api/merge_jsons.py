import json
import re # Para expressões regulares, útil na normalização

def normalize_name(name):
    """Normaliza o nome do personagem para facilitar a correspondência."""
    if not name:
        return ""
    # Converte para minúsculas
    name = name.lower()
    # Remove pontuações comuns (vírgula, ponto)
    name = name.replace(",", "")
    name = name.replace(".", "")
    # Remove múltiplos espaços e espaços no início/fim
    name = ' '.join(name.split())
    return name

def merge_character_data(jikan_file_path, detailed_file_path, output_file_path):
    """
    Combina dados de personagens de dois arquivos JSON.

    Args:
        jikan_file_path (str): Caminho para o arquivo JSON da API Jikan (com imagens).
        detailed_file_path (str): Caminho para o arquivo JSON com dados detalhados.
        output_file_path (str): Caminho para salvar o arquivo JSON combinado.
    """
    try:
        with open(jikan_file_path, 'r', encoding='utf-8') as f:
            jikan_data_list = json.load(f) # Espera uma lista de objetos {"character": {...}}
        print(f"Dados de '{jikan_file_path}' carregados com sucesso.")
    except FileNotFoundError:
        print(f"Erro: Arquivo '{jikan_file_path}' não encontrado.")
        return
    except json.JSONDecodeError:
        print(f"Erro: Falha ao decodificar JSON de '{jikan_file_path}'.")
        return

    try:
        with open(detailed_file_path, 'r', encoding='utf-8') as f:
            # Assumindo que detailed_file_path contém uma lista de personagens diretamente
            # Se for um objeto com uma chave "data" contendo a lista, ajuste aqui.
            # Ex: detailed_data_list = json.load(f)['data']
            detailed_data_list = json.load(f)
        print(f"Dados de '{detailed_file_path}' carregados com sucesso.")
    except FileNotFoundError:
        print(f"Erro: Arquivo '{detailed_file_path}' não encontrado.")
        return
    except json.JSONDecodeError:
        print(f"Erro: Falha ao decodificar JSON de '{detailed_file_path}'.")
        return

    # 1. Criar um dicionário de busca a partir dos dados da Jikan API
    jikan_images_map = {}
    for item in jikan_data_list:
        if "character" in item and "name" in item["character"] and "images" in item["character"]:
            char_name = item["character"]["name"]
            normalized = normalize_name(char_name)
            if normalized not in jikan_images_map: # Evita sobrescrever se houver nomes duplicados (pega o primeiro)
                jikan_images_map[normalized] = item["character"]["images"]
            else:
                print(f"Aviso: Nome normalizado duplicado encontrado nos dados Jikan: '{normalized}' para '{char_name}'. Usando a primeira ocorrência.")
        else:
            print(f"Aviso: Item nos dados Jikan ignorado por falta de 'character', 'name' ou 'images': {item}")

    print(f"{len(jikan_images_map)} personagens mapeados a partir de dados Jikan.")

    # 2. Iterar sobre os dados detalhados e adicionar as imagens
    merged_data = []
    characters_matched_count = 0
    characters_not_matched_count = 0

    for detailed_char in detailed_data_list:
        if "name" in detailed_char:
            detailed_name = detailed_char["name"]
            normalized_detailed_name = normalize_name(detailed_name)

            if normalized_detailed_name in jikan_images_map:
                # Adiciona o campo 'images' do arquivo Jikan ao personagem detalhado
                detailed_char["images"] = jikan_images_map[normalized_detailed_name]
                characters_matched_count +=1
            else:
                print(f"Aviso: Nenhuma correspondência de imagem encontrada para '{detailed_name}' (normalizado: '{normalized_detailed_name}')")
                # Opcional: adicionar um campo 'images': null ou um objeto vazio
                # detailed_char["images"] = None
                characters_not_matched_count += 1
            merged_data.append(detailed_char)
        else:
            print(f"Aviso: Personagem nos dados detalhados ignorado por falta de 'name': {detailed_char}")
            merged_data.append(detailed_char) # Adiciona mesmo assim ou decide pular

    print(f"Total de personagens nos dados detalhados: {len(detailed_data_list)}")
    print(f"Personagens com imagens correspondentes: {characters_matched_count}")
    print(f"Personagens sem imagens correspondentes: {characters_not_matched_count}")

    # 3. Salvar o resultado
    try:
        with open(output_file_path, 'w', encoding='utf-8') as f:
            json.dump(merged_data, f, indent=2, ensure_ascii=False)
        print(f"Dados combinados salvos com sucesso em '{output_file_path}'.")
    except IOError:
        print(f"Erro: Falha ao escrever o arquivo de saída '{output_file_path}'.")

# --- CONFIGURAÇÃO ---
# Substitua pelos nomes reais dos seus arquivos
arquivo_jikan = "personagens_one_piece.json" # Seu arquivo com o formato da Jikan API
arquivo_detalhado = "personagens_detalhados.json" # Seu arquivo com o segundo formato
arquivo_saida_combinado = "personagens_completos.json"

if __name__ == "__main__":
    # Crie arquivos de exemplo para testar, se ainda não os tiver
    # Exemplo de personagens_one_piece.json:
    exemplo_jikan_data = [
        {
            "character": {
                "mal_id": 40,
                "url": "https://myanimelist.net/character/40/Luffy_Monkey_D",
                "images": {
                    "jpg": {"image_url": "https://cdn.myanimelist.net/images/characters/9/310307.jpg"},
                    "webp": {"image_url": "https://cdn.myanimelist.net/images/characters/9/310307.webp"}
                },
                "name": "Monkey D., Luffy"
            }
        },
        {
            "character": {
                "mal_id": 62,
                "url": "https://myanimelist.net/character/62/Roronoa_Zoro",
                "images": {
                    "jpg": {"image_url": "https://cdn.myanimelist.net/images/characters/example_zoro.jpg"},
                    "webp": {"image_url": "https://cdn.myanimelist.net/images/characters/example_zoro.webp"}
                },
                "name": "Roronoa Zoro"
            }
        }
    ]
    # with open(arquivo_jikan, 'w', encoding='utf-8') as f:
    #     json.dump(exemplo_jikan_data, f, indent=2)

    # Exemplo de personagens_detalhados.json:
    exemplo_detalhado_data = [
        {
            "id": 1,
            "name": "Monkey D Luffy", # Nome ligeiramente diferente
            "size": "174cm",
            "bounty": "3.000.000.000"
        },
        {
            "id": 2,
            "name": "Roronoa Zoro",
            "size": "181cm",
            "bounty": "1.111.000.000"
        },
        {
            "id": 3,
            "name": "Nami", # Personagem sem correspondência no exemplo Jikan
            "size": "170cm",
            "bounty": "366.000.000"
        }
    ]
    # with open(arquivo_detalhado, 'w', encoding='utf-8') as f:
    #     json.dump(exemplo_detalhado_data, f, indent=2)

    # Chamar a função principal
    merge_character_data(arquivo_jikan, arquivo_detalhado, arquivo_saida_combinado)