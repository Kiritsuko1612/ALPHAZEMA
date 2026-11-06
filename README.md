## Atualização: composição e exportação

- Fontaine A–Z agora usa os contornos traçados da tabela enviada, em vez de misturar estilos. Os arquivos originais continuam disponíveis.
- Carta simples usa apenas um texto; carta com tradução permite português ↔ inglês, revisão e seleção da versão.
- Vertical (800 × 1132), horizontal (1132 × 800) e dimensões personalizadas. A prévia pode ser redimensionada pelo canto inferior direito; largura e altura mínima também são editáveis.
- PNG, SVG e PDF compartilham a mesma composição. Palavras são mantidas inteiras quando cabem na linha; palavras excepcionalmente longas são divididas. Textos longos aumentam a altura da carta.
- O texto legível é medido com sua própria fonte. O PDF incorpora a carta como imagem, preservando o visual sem instalar fontes; seu texto não é selecionável. O SVG mantém as runas como vetores.
- Rodapé em inglês: “May the wind carry your words”.
- A tradução online depende do MyMemory e mantém o limite de 500 bytes por requisição; a edição e a transcrição funcionam offline.

Validação: `python verify_font_extensions.py` e `node verify.mjs`.

# ALPHAZEMA · Cartas de Teyvat

## Abrir localmente

Abra `dist/index.html` no Chrome ou Edge. Todas as fontes estão incorporadas: não é necessário instalá-las. O editor, os alfabetos, a transcrição manual, as cartas reversíveis e a geração de imagens/figurinhas funcionam offline. A tradução português ↔ inglês depende do serviço externo MyMemory.

Opcional: abra um terminal na pasta `dist`, execute `python -m http.server 8000` e acesse http://localhost:8000.

## Escritas incluídas

| Opção | Arquivo da fonte | Letras ausentes |
| --- | --- | --- |
| Teyvat · escrita comum | TeyvatBlack-Regular.ttf | Nenhuma |
| Inazuma | InazumaBrush-Regular.ttf | Nenhuma |
| Sumeru · floresta | CartasSumeruReference-Regular.ttf | Nenhuma; X completado pela referência |
| Deshret · deserto | DeshretInscription-Regular.ttf | Nenhuma |
| Fontaine | CartasFontaineReference-Regular.ttf | Nenhuma; A–Z traçado da tabela de referência |
| Khaenri’ah | KhaenriahSun-Regular.ttf | Nenhuma |
| Khaenri’ah · variante do Despenhadeiro | KhaenriahSun-Chasm.ttf | Nenhuma |

O seletor acima das abas controla editor, prévia, alfabetos, teclado de transcrição, cartas PNG/SVG/PDF e figurinhas. Ao trocar de escrita, gere novamente as figurinhas: o site descarta os arquivos preparados com a escrita anterior.

As sete opções agora cobrem A–Z. Os contornos de X em Sumeru e das 26 letras de Fontaine foram traçados diretamente das imagens fornecidas pelo usuário. Essas adições são reconstruções locais identificadas nos metadados, não lançamentos oficiais do HoYo-Glyphs. Nenhum dos glifos já existentes nas fontes originais foi alterado. Números e sinais usam os desenhos existentes em cada fonte: a comum tem 0–4; Fontaine tem 0–9; Khaenri’ah e a variante do Despenhadeiro têm `! , . ?`; Inazuma inclui `|`. Os demais símbolos ficam em escrita comum. O modo inscrição contínua mantém apenas A–Z.

São sistemas de escrita. Escolher Inazuma não traduz para japonês romanizado; Khaenri’ah não traduz para latim; Deshret não traduz para egípcio. As palavras continuam no idioma original ou na tradução português/inglês escolhida. Não se afirma fidelidade absoluta a todas as variantes artísticas do jogo.

## Recursos

- Textos de até 2.000 caracteres, com acentos simplificados visualmente.
- Tradução MyMemory com até 500 bytes por consulta; resultado editável. Não há garantia de preservação de toda nuance.
- PNG, SVG e PDF da carta; o SVG contém contornos vetoriais e não precisa da fonte instalada.
- Cartas TYVT2 reversíveis com os dois textos exatos, acentos, emojis e identificador da escrita. TYVT1/TYVT2 antigos sem escrita usam Teyvat comum. Não é criptografia.
- Aba Alfabeto com cobertura e indicação das lacunas, sinais disponíveis, download da tabela PNG e da fonte TTF selecionada.
- Teclado de transcrição manual em Decifrar, incluindo sinais disponíveis. Não faz OCR automático.
- Figurinhas com fundo transparente, cor escolhida e contorno branco opcional. Mensagens longas são divididas em páginas de até seis linhas.
- PNG 512 × 512 para selecionar no criador do WhatsApp e WebP 512 × 512 validado até 100 KB. A qualidade é ajustada se necessário; quando o navegador não codifica WebP, mantém o PNG.
- Compartilhamento de arquivo pelo menu do sistema somente quando o navegador suporta; download sempre disponível após gerar.

## Usar a figurinha no WhatsApp

1. Gere a figurinha e baixe o PNG transparente.
2. No celular, salve em Fotos/Galeria se o arquivo estiver apenas em Downloads.
3. Abra uma conversa no WhatsApp, entre em Figurinhas → Criar e selecione a imagem. Os botões variam conforme a versão.
4. Confira que a prévia/recorte mantém todas as letras antes de enviar. Adicione aos favoritos para reutilizar.

Baixar ou compartilhar o arquivo não instala automaticamente a figurinha. Nenhum contato recebe mensagens automaticamente. A importação final em um celular não foi testada neste ambiente.

Guia oficial: https://faq.whatsapp.com/1056840314992666

## Procedência e licença

Fontes e contornos: https://github.com/SpeedyOrc-C/HoYo-Glyphs

Pacote de lançamento: `20250529` (o lançamento mais recente retornado pela API na consulta desta implementação).
Arquivos Glyphs e licença conferidos no commit `ad0c03ce9792d623c6a6161e5582a01903bd5d97`.

Em `dist/assets` estão as sete fontes originais TTF, duas fontes derivadas completas, os seis arquivos-fonte Glyphs, `reference-glyph-traces.json` e `scripts-manifest.json`, com versões, SHA-256, cobertura e procedência. Os glifos originais são extraídos sem redesenho e normalizados para uma mesma unidade tipográfica para exportar vetores; X de Sumeru e todo o A–Z de Fontaine usam os contornos traçados das tabelas. As fontes derivadas receberam nomes próprios e o código-fonte das modificações acompanha o projeto. Não são fontes oficiais da HoYoverse. Consulte a licença original `LICENSE-HoYo-Glyphs.txt`: uso não comercial, atribuição e demais condições.

O projeto upstream não inclui Liyue nem Ishine (Tsurumi); o pacote consultado não contém fonte de Snezhnaya/Nod-Krai. Não foram adicionadas escritas de Star Rail ou ZZZ, pois esta versão trata de Genshin.

## Desenvolvimento e verificação

- `python build.py`: monta o HTML com o registro de fontes já preparado, sem dependências Python extras.
- `python generate_fonts.py`: regenera o registro a partir das fontes locais; exige fontTools.
- `python patch_missing_glyphs.py`: reconstrói as duas fontes derivadas usando os contornos JSON; exige fontTools.
- `python trace_reference_glyphs.py`: repete a extração de contornos das tabelas originais em references; exige Pillow, NumPy, matplotlib e fontTools.
- `python verify_font_extensions.py`: verifica cobertura A–Z, preservação binária dos glifos originais e comparação raster dos 27 caracteres traçados com as referências, com tolerância de 2 pixels para antialiasing.
- `node verify.mjs`: testa Unicode, envelopes antigos/novos, cobertura das sete escritas, validação de códigos e identificadores, distinção das variantes de Khaenri’ah, pontuação/algarismos, escape XML e mensagens com 2.000 letras sem perda.

Teste real no Chrome: carregamento e seleção das fontes, tabela de Inazuma e indicação da lacuna X em Sumeru, geração de PNG/WebP nas sete escritas, 512 × 512; cada WebP observado ficou abaixo de 100 KB. A tradução pt→en, a preservação de acentos/emojis e os downloads transparentes também foram verificados nas versões anteriores.

A fonte anterior de fantasia e as runas nórdicas não são utilizadas. O código do site está neste repositório. A hospedagem do site é uma configuração separada.


## Referências fornecidas nesta atualização

As quatro tabelas originais estão em `references/` (Inazuma, Sumeru, Deshret e Fontaine). Foram fornecidas pelo usuário a partir de https://genshin-impact.fandom.com/wiki/Language#articleComments e, para Inazuma, https://www.bilibili.com/opus/549462944370341593. As páginas não puderam ser abertas neste ambiente; a conferência e os traçados usam as imagens anexadas, preservadas sem alteração. As interpretações comunitárias não se tornam oficiais por terem sido incorporadas ao site.

Inazuma e Deshret já tinham todas as 26 letras. A tabela de Inazuma marca L, Q, V e X com notas de correspondência alternativa, um possível S/Z alternativo e uma barra possivelmente separadora ou outra forma de I. Esses casos não foram convertidos em novas correspondências certas: a fonte de origem e suas associações foram mantidas. Não há glifos novos de pontuação nessas quatro tabelas.

Sumeru X e Fontaine A–Z foram isolados pela cor da tinta das tabelas; seus contornos foram convertidos em desenhos nativos de fonte, incluindo os vazios internos. Escala e alinhamento são calibrados com as letras já existentes da mesma fonte. `reference-glyph-traces.json` guarda coordenadas, hash da imagem e informações da extração; os códigos de reconstrução e verificação são abertos. O preview e as exportações usam os mesmos contornos do TTF, e não imagens sobrepostas a letras latinas.
