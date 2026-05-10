export const CATEGORIES = [
  'suspense',
  'romance',
  'ciencia',
  'fantasia',
  'historia',
  'autoajuda',
  'biografia',
  'ficcao-cientifica',
] as const;

export type Category = typeof CATEGORIES[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  'suspense': 'Suspense',
  'romance': 'Romance',
  'ciencia': 'Ciência',
  'fantasia': 'Fantasia',
  'historia': 'História',
  'autoajuda': 'Autoajuda',
  'biografia': 'Biografia',
  'ficcao-cientifica': 'Ficção Científica',
};

export const CATEGORY_QUERIES: Record<Category, string> = {
  'suspense': 'subject:thriller',
  'romance': 'subject:romance',
  'ciencia': 'subject:science',
  'fantasia': 'subject:fantasy',
  'historia': 'subject:history',
  'autoajuda': 'subject:self-help',
  'biografia': 'subject:biography',
  'ficcao-cientifica': 'subject:science+fiction',
};

export const CATEGORY_DESCRIPTIONS: Record<Category, string> = {
  suspense: 'Os melhores livros de suspense e thriller em português para comprar na Amazon Brasil. Agatha Christie, Gillian Flynn, Harlan Coben e muito mais.',
  romance: 'Os melhores livros de romance em português. Encontre clássicos e lançamentos do gênero com links diretos para a Amazon Brasil.',
  ciencia: 'Os melhores livros de ciência em português. De física quântica à biologia evolutiva, explore as obras essenciais da divulgação científica.',
  fantasia: 'Os melhores livros de fantasia em português. J.R.R. Tolkien, Brandon Sanderson, Patrick Rothfuss e os grandes nomes do gênero.',
  historia: 'Os melhores livros de história em português. Do Brasil colonial às guerras mundiais, encontre as obras essenciais da historiografia.',
  autoajuda: 'Os melhores livros de autoajuda em português. Desenvolvimento pessoal, produtividade, finanças e bem-estar com as obras mais bem avaliadas.',
  biografia: 'Os melhores livros de biografia em português. Vidas de líderes, artistas, cientistas e personalidades contadas por grandes autores.',
  'ficcao-cientifica': 'Os melhores livros de ficção científica em português. Isaac Asimov, Philip K. Dick, Ursula K. Le Guin e os clássicos do gênero.',
};

export const CATEGORY_INTROS: Record<Category, string> = {
  suspense: 'O suspense e o thriller são os gêneros que mais prendem o leitor. Autores como Agatha Christie, criadora de Hercule Poirot e Miss Marple, e Gillian Flynn, autora de Garota Exemplar, definiram o gênero no século XX e XXI. No Brasil, obras de Harlan Coben, Stieg Larsson (Trilogia Millennium) e Lee Child (Jack Reacher) chegam com tradução publicada por Intrínseca, Record e Planeta. O gênero abrange thriller psicológico, policial, espionagem, suspense jurídico e terror. Todos os títulos abaixo estão disponíveis em português e com link direto para compra na Amazon Brasil.',
  romance: 'O romance literário é um dos gêneros mais lidos no Brasil. Clássicos como Orgulho e Preconceito de Jane Austen e Romeu e Julieta de Shakespeare convivem com contemporâneos como Nicholas Sparks e Colleen Hoover, que conquistaram milhões de leitores. Editoras como Nova Fronteira, Record e Intrínseca publicam os maiores nomes do gênero em português. Os títulos abaixo foram selecionados entre as edições portuguesas mais bem avaliadas e estão disponíveis na Amazon Brasil.',
  ciencia: 'A divulgação científica nunca foi tão acessível. Livros como Sapiens de Yuval Noah Harari, Uma Breve História do Tempo de Stephen Hawking e O Gene de Siddhartha Mukherjee tornaram conceitos complexos compreensíveis para o público geral. No Brasil, as editoras Companhia das Letras, Zahar e Objetiva publicam os principais títulos de física, biologia, astronomia, neurociência e matemática. A seleção abaixo reúne os livros de ciência mais recomendados em língua portuguesa.',
  fantasia: 'A fantasia é o gênero da imaginação sem limites. J.R.R. Tolkien estabeleceu as bases com O Senhor dos Anéis, e autores como Brandon Sanderson (Mistborn, A Caminho das Lâminas), Patrick Rothfuss (O Nome do Vento) e George R.R. Martin (As Crônicas de Gelo e Fogo) expandiram o gênero. No Brasil, a Leya, WMF Martins Fontes e Darkside publicam as principais sagas. Os títulos abaixo incluem fantasias épicas, urban fantasy e high fantasy disponíveis em edição portuguesa.',
  historia: 'Os livros de história em português permitem ao leitor entender o passado para interpretar o presente. Autores como Laurentino Gomes (1808, 1822, 1889) e Boris Fausto (História do Brasil) são referências para a história nacional. No campo da história mundial, Yuval Noah Harari (Sapiens), Ian Morris e Eric Hobsbawm estão disponíveis em tradução pela Companhia das Letras e Record. Os títulos abaixo cobrem história do Brasil, história geral, história política e social — todos com edição em português.',
  autoajuda: 'Os livros de autoajuda e desenvolvimento pessoal estão entre os mais vendidos no Brasil. Obras como O Poder do Hábito de Charles Duhigg, Pai Rico Pai Pobre de Robert Kiyosaki, O Homem em Busca de Sentido de Viktor Frankl e Mindset de Carol Dweck transformaram a vida de milhões de leitores. As editoras Sextante, Objetiva e Alta Books publicam os principais títulos do gênero em português. A seleção abaixo reúne livros sobre produtividade, mentalidade, finanças pessoais e bem-estar.',
  biografia: 'As biografias revelam os bastidores de vidas extraordinárias. Steve Jobs de Walter Isaacson, Elon Musk de Walter Isaacson, O Diário de Anne Frank e Nelson Mandela: Uma Longa Caminhada até a Liberdade estão entre as mais lidas no Brasil. A Companhia das Letras, Record e Intrínseca publicam as principais biografias em português. A seleção abaixo inclui autobiografias, memórias e biografias autorizadas de líderes, artistas e cientistas.',
  'ficcao-cientifica': 'A ficção científica explora os limites da tecnologia e da condição humana. Isaac Asimov (Fundação, Eu, Robô), Philip K. Dick (O Homem do Castelo Alto), Ursula K. Le Guin (A Mão Esquerda da Escuridão) e Andy Weir (Perdido em Marte) são alguns dos autores com obras publicadas em português. A Aleph, DarkSide e Suma de Letras são as principais editoras do gênero no Brasil. Os títulos abaixo incluem space opera, distopia, cyberpunk e hard sci-fi disponíveis em edição portuguesa.',
};

export const CATEGORY_FAQS: Record<Category, Array<{ q: string; a: string }>> = {
  suspense: [
    { q: 'Quais são os melhores livros de suspense em português?', a: 'Entre os mais bem avaliados estão Garota Exemplar (Gillian Flynn), Os Homens que Não Amavam as Mulheres (Stieg Larsson), O Silêncio dos Inocentes (Thomas Harris) e qualquer título da série Jack Reacher, de Lee Child. Todos estão disponíveis em edição brasileira.' },
    { q: 'Qual a diferença entre suspense e thriller?', a: 'O suspense constrói tensão gradual, mantendo o leitor em dúvida sobre o que vai acontecer. O thriller tem ritmo mais acelerado e frequentemente envolve perigo iminente ao protagonista. Na prática, os dois termos são usados de forma intercambiável no mercado editorial brasileiro.' },
    { q: 'Onde comprar livros de suspense em português?', a: 'Todos os títulos da lista acima têm link direto para a Amazon Brasil, onde é possível encontrar edições físicas e digitais (Kindle). A Amazon oferece entrega para todo o Brasil e frequentemente tem promoções no gênero.' },
  ],
  romance: [
    { q: 'Quais são os melhores livros de romance para ler em português?', a: 'Clássicos como Orgulho e Preconceito (Jane Austen) e contemporâneos como A Barraca do Beijo (Nicholas Sparks) e Ugly Love (Colleen Hoover) estão entre os mais lidos. Para romance nacional, autores como Marçal Aquino e Ana Paula Maia são referências.' },
    { q: 'Romance literário e romance de entretenimento são a mesma coisa?', a: 'Não. O romance literário prioriza a linguagem, a psicologia dos personagens e questões existenciais. O romance de entretenimento (ou popular) foca na história e no relacionamento entre os personagens. Ambos são válidos e têm públicos fiéis no Brasil.' },
    { q: 'Tem livros de romance em português para ler de graça?', a: 'Clássicos como Orgulho e Preconceito e outros livros com direitos autorais vencidos estão disponíveis gratuitamente no Domínio Público e no Project Gutenberg em português. Para lançamentos, o Kindle Unlimited da Amazon oferece acesso a centenas de títulos por assinatura mensal.' },
  ],
  ciencia: [
    { q: 'Qual é o melhor livro de ciência para quem não é cientista?', a: 'Sapiens, de Yuval Noah Harari, é o ponto de entrada mais recomendado: acessível, abrangente e fascinante. Outros ótimos começos são Cosmos (Carl Sagan), O Gene (Siddhartha Mukherjee) e Uma Breve História do Tempo (Stephen Hawking). Todos têm edição em português.' },
    { q: 'Quais livros de ciência estão disponíveis em português no Brasil?', a: 'A maioria dos grandes títulos de divulgação científica tem edição brasileira. As editoras Companhia das Letras, Zahar, Objetiva e Intrínseca publicam regularmente os principais lançamentos de física, biologia, neurociência, astronomia e matemática.' },
    { q: 'Livros de ciência são difíceis de ler?', a: 'Depende do livro. Títulos de divulgação científica, como os de Stephen Hawking, Carl Sagan e Neil deGrasse Tyson, são escritos para o público geral e não exigem conhecimento técnico prévio. Os livros acadêmicos, sim, têm linguagem mais especializada.' },
  ],
  fantasia: [
    { q: 'Por onde começar no gênero fantasia?', a: 'O Hobbit de J.R.R. Tolkien é o ponto de entrada clássico, sendo mais curto e acessível que O Senhor dos Anéis. Para fantasia mais moderna, O Nome do Vento (Patrick Rothfuss) e O Caminho dos Reis (Brandon Sanderson) são excelentes inícios. Todos têm edição em português.' },
    { q: 'Qual a diferença entre fantasia épica e high fantasy?', a: 'High fantasy se passa em um mundo completamente inventado (como a Terra Média de Tolkien). Fantasia épica geralmente tem uma jornada heroica central com conflito de proporções mundiais. Os termos se sobrepõem bastante e muitas obras pertencem a ambas as categorias.' },
    { q: 'Tem saga de fantasia completa em português?', a: 'Sim. A trilogia O Senhor dos Anéis, As Crônicas de Nárnia, A Trilogia do Mil e Um Dias e Mistborn (Brandon Sanderson) estão completamente publicadas em português. Séries como As Crônicas de Gelo e Fogo ainda estão em andamento, mas todos os volumes publicados têm tradução brasileira.' },
  ],
  historia: [
    { q: 'Quais são os melhores livros de história do Brasil?', a: 'A trilogia de Laurentino Gomes (1808, 1822, 1889) é a leitura mais acessível e bem-escrita sobre o período imperial. Para uma visão geral, História do Brasil de Boris Fausto é a referência acadêmica mais adotada. Casa-Grande & Senzala de Gilberto Freyre é leitura obrigatória para entender a formação social do país.' },
    { q: 'Qual livro de história mundial ler primeiro?', a: 'Sapiens: Uma Breve História da Humanidade, de Yuval Noah Harari, é o ponto de partida mais recomendado globalmente. Com linguagem acessível, cobre 70 mil anos de história humana em menos de 500 páginas. Está disponível em português pela Companhia das Letras.' },
    { q: 'Livros de história são confiáveis como fontes?', a: 'Depende do autor e do tipo de obra. Historiadores acadêmicos (como Boris Fausto, Evaldo Cabral de Mello) têm rigor científico e citam fontes primárias. Obras de divulgação histórica (como Laurentino Gomes) são bem pesquisadas mas escritas para o grande público. Ambos são fontes legítimas com propósitos diferentes.' },
  ],
  autoajuda: [
    { q: 'Quais são os livros de autoajuda mais transformadores?', a: 'Os mais recomendados por leitores e especialistas são: O Poder do Hábito (Charles Duhigg), Mindset (Carol Dweck), O Homem em Busca de Sentido (Viktor Frankl), Os 7 Hábitos das Pessoas Altamente Eficazes (Stephen Covey) e Essencialismo (Greg McKeown). Todos estão disponíveis em português.' },
    { q: 'Livros de autoajuda realmente funcionam?', a: 'Os melhores livros do gênero são baseados em pesquisas em psicologia, neurociência e comportamento humano. Obras como Mindset (Carol Dweck) e O Poder do Hábito (Charles Duhigg) têm base científica sólida. O impacto depende da disposição do leitor em aplicar o que aprende.' },
    { q: 'Qual a diferença entre autoajuda e desenvolvimento pessoal?', a: 'Desenvolvimento pessoal é um termo mais amplo que inclui habilidades profissionais, liderança e produtividade. Autoajuda foca mais no bem-estar emocional e mudança de comportamento. No mercado editorial brasileiro, os dois termos são frequentemente usados como sinônimos.' },
  ],
  biografia: [
    { q: 'Quais são as melhores biografias em português?', a: 'Steve Jobs (Walter Isaacson), Elon Musk (Walter Isaacson), O Diário de Anne Frank, A Longa Caminhada até a Liberdade (Nelson Mandela) e Becoming (Michelle Obama) estão entre as mais lidas e bem avaliadas. Todos têm edição brasileira amplamente disponível.' },
    { q: 'Qual a diferença entre biografia e autobiografia?', a: 'A biografia é escrita por outra pessoa sobre a vida do biografado, geralmente com pesquisa e entrevistas. A autobiografia é escrita pela própria pessoa sobre sua vida. As memórias são mais seletivas — o autor narra episódios específicos, sem a intenção de cobrir toda a vida.' },
    { q: 'Tem boas biografias de brasileiros em português?', a: 'Sim. Entre as mais lidas estão Getúlio (Lira Neto, trilogia), JK (Clarice Lispector), O Presidente segundo o Sociológo (Fernando Henrique Cardoso entrevistado) e as biografias de Ayrton Senna. A Companhia das Letras e Record são as principais editoras do gênero no Brasil.' },
  ],
  'ficcao-cientifica': [
    { q: 'Por onde começar na ficção científica?', a: 'Para iniciantes, Perdido em Marte (Andy Weir) e A Falha em Nossas Estrelas são acessíveis. Para os clássicos, Fundação (Isaac Asimov) e Duna (Frank Herbert) são leituras obrigatórias. Todos estão disponíveis em português no Brasil.' },
    { q: 'Quais são os clássicos da ficção científica em português?', a: 'Os incontornáveis são: Fundação (Isaac Asimov), Duna (Frank Herbert), 1984 (George Orwell), Admirável Mundo Novo (Aldous Huxley), Fahrenheit 451 (Ray Bradbury) e Neuromancer (William Gibson). Todos têm edição brasileira.' },
    { q: 'Ficção científica e fantasia são o mesmo gênero?', a: 'Não. A ficção científica especula sobre o futuro com base em ciência e tecnologia (mesmo que especulativa). A fantasia usa elementos mágicos e sobrenaturais sem base científica. Na prática, algumas obras misturam os dois — como Star Wars, considerada space opera com elementos de fantasia.' },
  ],
};

export const CATEGORY_RELATED: Record<Category, Category[]> = {
  suspense: ['biografia', 'historia', 'ficcao-cientifica'],
  romance: ['autoajuda', 'biografia', 'historia'],
  ciencia: ['historia', 'biografia', 'ficcao-cientifica'],
  fantasia: ['ficcao-cientifica', 'historia', 'romance'],
  historia: ['biografia', 'ciencia', 'romance'],
  autoajuda: ['biografia', 'ciencia', 'romance'],
  biografia: ['historia', 'autoajuda', 'ciencia'],
  'ficcao-cientifica': ['fantasia', 'ciencia', 'suspense'],
};
