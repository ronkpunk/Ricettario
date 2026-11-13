// Sorgente dei dati: trascrizione del PDF "Ricettario".
// Ogni ingrediente è una riga "quantità unità nome|nota". Il parser (build-data.mjs)
// la trasforma in {q, q2, u, n, note} così da poter scalare le dosi.
// Le righe senza quantità numerica (q.b., "un pizzico"...) restano testo fisso.

export const CATEGORIES = [
  { id: 'dolci', name: 'Dolci', emoji: '🍰', color: '#ff6b81' },
  { id: 'lievitati', name: 'Lievitati', emoji: '🥐', color: '#ffa94d' },
  { id: 'colazione', name: 'Colazione e merenda', emoji: '🥞', color: '#ffd43b' },
  { id: 'primi', name: 'Primi', emoji: '🍝', color: '#ff8787' },
  { id: 'secondi', name: 'Secondi', emoji: '🍗', color: '#69db7c' },
  { id: 'contorni', name: 'Contorni', emoji: '🫑', color: '#38d9a9' },
  { id: 'basi', name: 'Basi e preparazioni', emoji: '🥣', color: '#74c0fc' },
];

const G = (title, items) => ({ title, items });

export const RECIPES = [
  {
    num: 1, title: 'Torta di amaretti', cat: 'dolci', emoji: '🥧', servings: 8, guess: true,
    ingredients: [G(null, [
      '250 g amaretti', '200 g burro', '250 g zucchero', '300 g fecola', '6 uova',
      '1 bustina lievito', '1 rotolo pasta sfoglia', 'Vanillina', 'Liquore|Disaronno o essenza',
    ])],
    steps: [G(null, [
      'Lavorare il burro con lo zucchero poi aggiungere i tuorli, gli amaretti tritati fini, la fecola e il lievito. Montare gli albumi a neve ferma e aggiungerli mescolando piano dal basso verso l’alto.',
      'Foderare uno stampo a bordi alti con carta da forno e appoggiarvi la pasta sfoglia. Riempire con l’impasto e rivoltarvi sopra il bordo della pasta sfoglia, che sarà poi spennellato di latte.',
      'Cuocere a 180° per un’ora circa: è pronta quando, controllando con uno stuzzicadenti, l’interno dell’impasto è asciutto.',
    ])],
  },
  {
    num: 2, title: 'Torta di rose 1 (Rosanna)', cat: 'lievitati', emoji: '🌹', servings: 8, guess: true,
    ingredients: [
      G('Impasto', [
        '750 g farina|500 g in inverno', '90 g zucchero', '2 uova', '60 g burro morbido',
        '25 g lievito di birra fresco|7 g se secco', '1 tazza latte', '1 bustina vanillina',
        '½ limone grattugiato', '½ cucchiaino sale',
      ]),
      G('Farcitura', ['40 g zucchero|di canna, a velo e cannella', '40 g burro morbido']),
    ],
    steps: [G(null, [
      'Per aumentare l’elasticità si può iniziare con il roux: 3 cucchiai di farina e una tazza di latte caldo, mescolando in continuazione, cuocere a fuoco lento evitando la formazione di grumi, eventualmente aggiungere latte. Coprire con una pellicola e lasciar riposare un paio d’ore in frigorifero, meglio tutta la notte.',
      'In una terrina media mettere tre cucchiai di farina, un cucchiaino di zucchero, il lievito e mescolare, continuando a mescolare aggiungere a filo un bicchiere di latte tiepido; lasciar lievitare per circa ½ ora, quando si è alzato mescolare e lasciar lievitare ancora poi iniziare l’impasto.',
      'Mettere farina, zucchero, limone grattugiato e iniziare a mescolare, aggiungere il roux se è stato fatto e le uova (NON il burro), impastare veloce per 10’. Ammorbidire il burro e aggiungerlo poco per volta, mescolando veloce fino ad ottenere un impasto poco appiccicoso, se necessario aggiungere uno o due cucchiai di farina.',
      'Mettere a lievitare al coperto, in una busta di plastica, in base alla temperatura posso bastare 2 o 3 ore, in inverno anche 4. Quando ha lievitato (raddoppiato il volume) tagliare in due e tirare delle sfoglie tonde alte mezzo centimetro.',
      'Sciogliere un po’ di margarina (o burro) per ungere lo stampo e la pasta, su cui va spolverato un po’ di zucchero. Arrotolare e tagliare a pezzi da 4/5 cm che vanno disposti sullo stampo distanti tra loro, mettere le estremità al centro. Mettere le teglie in una busta di plastica e lasciar lievitare per altre 2 o 3 ore, finché non si sono gonfiate.',
      'Cospargere di burro e zucchero (va bene anche quello di canna eventualmente con aggiunta di cannella), nella parte alta si può spalmare una gelatina di zucchero a velo e poca acqua. Mettere in forno preriscaldato a 200°, su una griglia nella parte bassa; cuocere per circa 20 minuti, fino a quando hanno una bella doratura.',
    ])],
  },
  {
    num: 3, title: 'Krapfen', cat: 'colazione', emoji: '🍩', servings: 6,
    note: 'La quantità di farina non era indicata: regolala a occhio fino a ottenere una pasta morbida, e controlla tempi e cottura.',
    ingredients: [G(null, ['50 g lievito di birra', '7 uova', '150 g zucchero', '120 g burro', 'Farina q.b.|quantità non indicata', 'Acqua tiepida q.b.', 'Un pizzico sale'])],
    steps: [G(null, [
      'Sciogliere il lievito nell’acqua tiepida, aggiungere un cucchiaino di zucchero e 2-3 cucchiai di farina fino ad ottenere una cremina; coprire e lasciar lievitare per mezz’ora in un luogo tiepido, fino a quando diventa spumoso.',
      'Aggiungere le uova, il burro fuso e sbattere bene, aggiungendo poi lo zucchero e la farina, mescolando per ottenere una pasta morbida. Aggiungere il sale, lasciando poi riposare per circa 2 ore coprendo e in un posto tiepido.',
      'Stendere l’impasto, ritagliare i krapfen, adagiarli in una teglia e lasciar riposare per un’altra mezz’ora.',
      'Infornare in forno preriscaldato a 200° e cuocere per mezz’ora.',
    ])],
  },
  {
    num: 4, title: 'Chiacchere e Favin', cat: 'dolci', emoji: '🎉', servings: 4,
    link: { url: 'https://www.youtube.com/watch?v=l41-DjQLBhc&t=2s', label: 'Guarda il video' },
    ingredients: [
      G('Chiacchere (per 4 persone)', [
        '500 g farina', '4 uova', '100 g zucchero', '1 pezzetto burro|o un cucchiaio di olio di arachide',
        '3 cucchiai grappa|rum, cognac o anice', '1 bustina vanillina', '1 limone grattugiato',
      ]),
      G('Favin (per 4 persone)', [
        '350 g farina', '2 uova', '110 g zucchero', '1 sorso cognac|grappa o anice',
        '1 bustina lievito', '1 limone grattugiato', '1 pizzico sale',
      ]),
    ],
    steps: [
      G('Chiacchere', [
        'Sbattere le uova con la scorza di limone, zucchero, grappa poi mettere nell’impastatrice con metà farina e la vanillina. Continuare ad impastare con il resto della farina e il cucchiaio di olio, alla fine impastare duro a mano aggiungendo farina se necessario. Lasciare riposare in frigo per un paio d’ore e tirare sottile, la pasta deve essere quasi trasparente.',
        'Tagliare dei rettangoli da 5 x 10 cm, fare due incisioni all’interno (senza tagliare), prendere una striscia e inserirla nell’altra (o agitarla con un bastoncino) e friggere con strutto (olio di semi) per pochi secondi.',
      ]),
      G('Favin', [
        'Sbattere le uova con la scorza di limone, lo zucchero, il cognac e il sale, poi unire la farina e il lievito e impastare fino a ottenere un impasto sodo, aggiungendo farina se necessario. Lasciare riposare in frigo per un paio d’ore.',
        'Fare un rotolino da circa 2 cm e tagliare ogni 2 cm ruotando l’impasto ogni volta. Friggere con strutto (olio di semi) per pochi secondi.',
      ]),
    ],
  },
  {
    num: 5, title: 'Pan dei morti', cat: 'dolci', emoji: '🍪', servings: 10,
    ingredients: [G(null, [
      '500 g farina', '500 g zucchero', '100 g cacao', '250 ml vino nero',
      'Droghe q.b.', 'Uvetta q.b.', 'Lievito q.b.', 'Pinoli q.b.', 'Zucchero a velo q.b.',
    ])],
    steps: [G(null, [
      'Scaldare il vino, mettere lo zucchero, poi cacao, uvetta e le droghe. Impastare sul marmo con la farina, aggiungere lo lievito. Ungersi le mani e fare delle formine mettendo i pinoli.',
      'Cuocere a temperatura moderata per 15 minuti e poi cospargere di zucchero a velo.',
    ])],
  },
  {
    num: 6, title: 'Pasta per strudel', cat: 'basi', emoji: '🥨', servings: 6,
    ingredients: [G(null, ['2 uova intere', '1 cucchiaio zucchero', '1 noce burro', '1 cucchiaino aceto', 'Sale', 'Farina q.b.'])],
    steps: [G(null, ['Impastare, lasciar riposare e tirare molto sottile, aggiungendo acqua se troppo dura.'])],
  },
  {
    num: 7, title: 'Panpepato', cat: 'dolci', emoji: '🍫', servings: 20, guess: true,
    ingredients: [G(null, [
      '1 kg farina', '1 kg zucchero', '200 g cacao puro', '500 g mandorle',
      '200 g pinoli', '300 g cedrini', '25 g droghe', '500 ml vino nero',
      'Cioccolato per copertura', '2 bustine lievito',
    ])],
    steps: [G(null, [
      'Scaldare il vino, aggiungere lo zucchero, cacao e cioccolato.',
      'Quando è tutto amalgamato togliere dal fuoco e impastare con la farina e gli altri ingredienti. Deve risultare molto duro.',
      'Ungersi le mani e formare delle cupole da 10-15 cm.',
      'Mettere distanziati 3-4 cm su carta da forno, cuocere a fuoco moderato per 45 minuti.',
      'Lasciar stagionare 15-20 giorni in sacchetti di plastica chiusi all’esterno.',
    ])],
  },
  {
    num: 8, title: 'Ciambella', cat: 'dolci', emoji: '🍩', servings: 6,
    ingredients: [G(null, ['4 uova', '100 g burro', '200 g zucchero', '200 g farina', '½ bicchiere latte', '1 limone grattugiato', '1 bustina lievito'])],
    steps: [G(null, ['Ammorbidire il burro e lavorarlo con i tuorli e lo zucchero, aggiungere farina, latte, lievito e limone, alla fine gli albumi montati a neve.'])],
  },
  {
    num: 9, title: 'Pasta frolla', cat: 'basi', emoji: '🍪', servings: 6,
    ingredients: [
      G('Versione base', ['2 uova|solo tuorli', '200 g burro', '200 g zucchero', '400 g farina']),
      G('Alternativa', ['2 uova|solo tuorli', '1 uovo', '200 g burro', '100 g zucchero', '300 g farina', '1 bustina vanillina', '1 bicchierino liquore']),
    ],
    steps: [G(null, ['Procedimento non annotato nel ricettario.'])],
  },
  {
    num: 10, title: 'Pesche ripiene', cat: 'dolci', emoji: '🍑', servings: 6,
    ingredients: [G(null, ['1 sacchetto amaretti', '3 cucchiai zucchero', '1 o 2 uova', '10 o 12 pesche'])],
    steps: [G(null, [
      'Preparare il ripieno frantumando gli amaretti e mescolandoli con lo zucchero e le uova.',
      'Mettere sul fondo della pentola vino bianco o marsala, poi le pesche scavate e riempite con il ripieno.',
      'Infornare a caldo.',
      'Servire con zabaione.',
    ])],
  },
  {
    num: 11, title: 'Pasta e ceci', cat: 'primi', emoji: '🍲', servings: 6,
    ingredients: [G(null, ['½ kg ceci', '1 spicchio aglio', '4 cucchiai olio', '200 g lardo', 'Prezzemolo', '1 dado'])],
    steps: [G(null, [
      'Mettere a bagno i ceci in acqua tiepida e bicarbonato per una notte, al mattino lessarli in due litri d’acqua.',
      'A parte soffriggere olio, aglio, prezzemolo e lardo, versare il soffritto nella pentola dei ceci.',
      'A fine cottura aggiungere il dado, salare e pepare, quando bolle aggiungere la pasta.',
    ])],
  },
  {
    num: 12, title: 'Gnocchi alla romana', cat: 'primi', emoji: '🥘', servings: 4, guess: true,
    ingredients: [G(null, ['1 l latte', '250 g semolino di grano', '50 g burro', '2 uova intere', '100 g formaggio grattugiato', 'Noce moscata', 'Sale', 'Pepe'])],
    steps: [G(null, [
      'Scaldare il latte con la noce moscata, sale e pepe. Quando inizia a bollire aggiungere il semolino a pioggia mescolando con la frusta, cuocere mescolando per pochi minuti.',
      'Togliere dal fuoco e unire le uova, il burro e il formaggio grattugiato impastando a mano.',
      'Versare sul tavolo bagnato, stendere a 1 – 1,5 cm di altezza, tagliare a tondini continuando a riutilizzare lo scarto. Man mano disporre nella pentola leggermente sovrapposti e aggiungere qualche fiocchetto di burro e parmigiano.',
      'Cuocere a forno ben caldo.',
    ])],
  },
  {
    num: 13, title: 'Budino mantovano', cat: 'dolci', emoji: '🍮', servings: 6, guess: true,
    ingredients: [G(null, ['100 g burro', '100 g farina', '100 g zucchero', '100 g cacao amaro', '1 l latte', 'Vaniglia', 'Un pizzico Suk', '½ tavoletta cioccolato'])],
    steps: [G(null, [
      'Scaldare il latte a parte con una scorza di limone.',
      'Sciogliere il burro in una pentola dove poter mettere tutti gli ingredienti, aggiungere lentamente la farina spolverandola e, sempre mescolando con la frusta, lasciare cuocere per ad ottenere una leggera tostatura.',
      'Aggiungere il latte preriscaldato a filo, sempre mescolando per evitare i grumi, vaniglia, Suk e lo zucchero, alla fine il cacao spolverato e il cioccolato.',
    ]), G('Variante Zina', [
      'Scaldare il latte a parte con una scorza di limone.',
      'Sciogliere il burro in una pentola dove poter mettere tutti gli ingredienti, aggiungere lentamente la farina spolverandola e, sempre mescolando con la frusta, lasciare cuocere fino ad ottenere una leggera tostatura.',
      'Aggiungere lo zucchero prima del latte, poi il latte preriscaldato a filo, sempre mescolando per evitare i grumi, la vaniglia e il Suk; alla fine il cacao spolverato e il cioccolato.',
    ])],
  },
  {
    num: 14, title: 'Passatelli', cat: 'primi', emoji: '🍜', servings: 6, guess: true,
    ingredients: [G(null, [
      '3 uova intere', '200 g pane grattugiato|150 ?', '100 g grana grattugiato|150 ?', '1 noce burro',
      'Scorza di ½ limone grattugiata', 'Sale', 'Noce moscata', '1 l brodo|½ pollo e ½ carne',
    ])],
    steps: [G(null, [
      'Mescolare pane e formaggio, mescolare con le uova e aggiungere gli altri ingredienti fino ad ottenere un impasto solido, eventualmente correggere con brodo per ammorbidire o pane per indurire. Lavorare l’impasto per una decina di minuti per amalgamarlo bene e poi lasciare riposare per almeno 1 ora.',
      'Metterli nel brodo usando lo schiacciapatate con il filtro largo.',
    ])],
  },
  {
    num: 15, title: 'Crème caramel', cat: 'dolci', emoji: '🍮', servings: 6, guess: true,
    ingredients: [G(null, ['5 uova intere', '5 o 6 cucchiai zucchero', '400 g panna', '400 g latte', '1 busta vanillina'])],
    steps: [G(null, [
      'Sbattere tutto con la frusta.',
      'Mettere caramello nello scodello e poi il composto, coprire con il coperchio.',
      'Cuocere in pentola a bagnomaria pressione 25 - 30 minuti circa.',
    ])],
  },
  {
    num: 16, title: 'Impasto per spara-biscotti', cat: 'basi', emoji: '🍪', servings: 4, guess: true,
    ingredients: [G(null, ['90 g zucchero', '170 g burro', '1 uovo', '270 g farina', '1 bustina vanillina'])],
    steps: [G(null, [
      'Versare lo zucchero in una ciotola con il burro appena scaldato, mescolare fino ad avere un morbido impasto. Aggiungere l’uovo e mescolarlo insieme alla vanillina. Con l’impasto aggiungere un po’ alla volta la farina setacciandola e mescolare fino ad avere un impasto spumoso.',
      'Riempire la spara-biscotti.',
      'Direttamente sulla teglia senza carta forno, “sparare” i biscotti con la pistola.',
      'A forno caldo a 180 gradi aspettare la doratura (circa 10 minuti) poi togliere.',
    ])],
  },
  {
    num: 17, title: 'Polpette di carne cruda', cat: 'secondi', emoji: '🧆', servings: 2, guess: true,
    ingredients: [G(null, [
      '250 g carne trita scelta di vitellone', '50 g pane bianco ammollato nel latte|o una patata lessata', '1 uovo',
      '2 cucchiai grana grattugiato', '1 cucchiaino erbe aromatiche tritate', 'Olio extra vergine di oliva',
      'Pangrattato', 'Salsa di pomodoro|facoltativa', 'Sale, pepe, noce moscata',
    ])],
    steps: [G(null, [
      'Mescolare la carne trita con un terzo del suo peso di pane bianco ammollato nel latte e strizzato, formaggio grattugiato, sale, pepe, erbe aromatiche, poca cipolla o aglio o scalogno tritato e ancora altro a piacere.',
      'Compattare bene il composto e far riposare in frigorifero per un paio di ore.',
      'Formare tante polpette del peso e della forma preferita, tonda, ovoidale o appiattita.',
      'Passarle nel pangrattato e rosolarle in padella con un filo d’olio per qualche minuto, oppure tuffarle nella salsa di pomodoro ben calda oppure cuocerle in forno ventilato a 200°C, per circa 10 minuti, appena unte di olio e adagiate su teglia, preferibilmente fornita di carta da forno, sino a renderle ben dorate.',
    ])],
  },
  {
    num: 18, title: 'Dado di carne', cat: 'basi', emoji: '🧊', servings: 1, label: 'dose',
    ingredients: [G(null, ['½ kg manzo magro', '½ kg carote', '400 g sedano', '400 g cipolle bianche', '150 g sale grosso'])],
    steps: [G(null, [
      'Tagliare a dadini ogni ingrediente e mettere tutto nella pentola a pressione per 1,5 ore.',
      'Frullare ed eventualmente condensare sul fuoco.',
      'Mettere nella vaschetta per cubetti giaccio.',
      'La verdura può essere cambiata, non usare patate.',
    ])],
  },
  {
    num: 19, title: 'Crema catalana', cat: 'dolci', emoji: '🔥', servings: 4, guess: true,
    ingredients: [G(null, ['4 tuorli', '5 cucchiai zucchero', '25 g amido di mais|maizena', '500 ml latte', '1 stecca cannella', 'Scorza di limone', 'Zucchero di canna e noce moscata|per la caramellatura'])],
    steps: [G(null, [
      'Per preparare la crema catalana, rompete le uova e dividete i tuorli dagli albumi. Montate i rossi delle uova con lo zucchero: ottenere una crema soffice e spumosa.',
      'In un’altra ciotola mettete l’amido di mais setacciato e scioglietelo con due cucchiai di latte.',
      'Mettere il restante latte e la buccia del limone in un pentolino e far bollire, aggiungere un pizzico di cannella. Toglietelo dalla fiamma e far raffreddare leggermente, versare il latte nella ciotola con le uova e lo zucchero, filtrando per eliminare le scorze di limone.',
      'Mescolare con cura il composto, rimettere nel pentolino e portare nuovamente a ebollizione per qualche minuto, mescolando continuamente con un cucchiaio di legno. Versare la crema nelle coppette per servire.',
      'Far raffreddare a temperatura ambiente, e poi in frigo per circa 4 ore, durante questo tempo la crema catalana si solidificherà. Prima di servire cospargere la superficie di zucchero di canna mescolato con un pizzico di noce moscata: con una piccola fiamma caramellate lo zucchero che dovrà diventare marrone ma non dovrà bruciare.',
    ])],
  },
  {
    num: 20, title: 'Pollo alla Marengo', cat: 'secondi', emoji: '🍗', servings: 4, guess: true,
    ingredients: [
      G(null, ['500 g petti di pollo', '500 ml vino bianco', '500 g pomodori pelati', '1 spicchio aglio', '1 limone', '1 ciuffo prezzemolo', 'Olio di oliva', 'Farina q.b.']),
      G('Per la guarnizione (quantità non indicate)', ['Fette di pane q.b.', 'Uova q.b.']),
    ],
    steps: [G(null, [
      'Passate il pollo nella farina; poi sbucciate lo spicchio d’aglio e tritate finemente il ciuffo di prezzemolo.',
      'In una padella scaldate un filo d’olio con lo spicchio d’aglio sbucciato, aggiungere i pezzi di pollo e far rosolare. Salare e pepare a piacere, quando il pollo sarà ben rosolato versare 100 ml di vino bianco.',
      'Far evaporare prima di versare la i pomodori pelati, cuocere per circa 40 minuti con il coperchio. Aggiungere il succo di limone, mescolate per pochi minuti prima di spegnere il fuoco, aggiungete il prezzemolo tritato.',
      'In una padella versate 3 cucchiai d’olio, fate tostare le fette di pane mentre in un’altra padella friggete per pochi minuti le uova con altri due cucchiai d’olio salandoli.',
    ])],
  },
  {
    num: 21, title: 'Verdure ripiene', cat: 'secondi', emoji: '🫑', servings: 4, guess: true,
    ingredients: [G(null, ['500 g carne tritata', '2 o 3 uova intere', '100 g formaggio grattugiato', 'Pane grattugiato', 'Sale e pepe', 'Noce moscata', 'Prezzemolo', 'Zucchine e peperoni'])],
    steps: [G(null, [
      'In una terrina mescolare, a freddo con le mani, la carne con le uova, mettere il formaggio insaporire con sale, pepe, noce moscata e prezzemolo; alla fine usare il pane grattugiato per avere un impasto asciutto e consistente.',
      'Svuotare le verdure, tenendo l’interno delle zucchine. Riempire le verdure e metterle in una pentola (meglio a pressione) con due dita di olio, acqua, salsa di pomodoro e l’interno delle zucchine. Cuocere con coperchio per circa 30’ (15’ nella pentola a pressione), aggiungere acqua se necessario.',
      'Mettere tutto in una pirofila e cuocere a 180° nel forno per altri 30’, fino a quando l’acqua si è asciugata.',
    ])],
  },
  {
    num: 22, title: 'Torta di rose (Manitoba)', cat: 'lievitati', emoji: '🌹', servings: 10, guess: true,
    note: 'Nel PDF questa ricetta è corredata di foto passo-passo. Stampo: tortiera da 28 cm.',
    ingredients: [
      G('Impasto e crema di burro', ['500 g farina Manitoba', '3 uova medie', '1 cucchiaino miele', '7 g sale fine', '200 ml latte', '10 g lievito di birra', 'Scorza d’arancia', '25 g estratto di vaniglia', '80 g zucchero', '100 g burro']),
      G('Farcitura e finitura (quantità non indicate)', ['Burro ammorbidito q.b.', 'Farina di mandorle q.b.', 'Panna q.b.', 'Marmellata di arance q.b.', '1 tuorlo', 'Lamelle di mandorle q.b.', 'Zucchero a velo q.b.']),
    ],
    steps: [G(null, [
      'Sbriciolate il lievito dentro ad una ciotolina e aggiungete poco latte tiepido e un cucchiaino di miele, quindi mescolate per disciogliere il tutto.',
      'Mettete nella ciotola di una planetaria munita di foglia la farina, aggiungete il composto di lievito, il restante latte e la scorza grattugiata dell’arancia azionando la macchina su una velocità minima, quindi unite le uova a temperatura ambiente precedentemente sbattute con una forchetta, lo zucchero, l’estratto di vaniglia e in ultimo il sale. Lasciate lavorare per almeno 10-15 minuti.',
      'Poi unite, un pezzetto alla volta, il burro ammorbidito: non aggiungete un nuovo pezzetto se prima non è stato ben assorbito il precedente (per far assorbire tutto il burro ci vorranno almeno 10 minuti di lavorazione che potete effettuare utilizzando il gancio). Quando l’impasto sarà liscio, elastico e si staccherà dai lati della ciotola, rovesciatelo su una spianatoia, lavoratelo qualche secondo per dargli la forma di una palla e poi riponetelo in una ciotola spennellata con del burro, e copritela con della pellicola trasparente.',
      'Mettetelo a lievitare per almeno 2 ore nel forno spento ma con la luce accesa fino a che non duplichi il volume.',
      'Mettete il burro ammorbidito dentro alla ciotola di una planetaria munita di frusta, unite lo zucchero e montate il tutto fino a ottenere un composto bianco e molto spumoso, al quale unirete la farina di mandorle e la panna a temperatura ambiente.',
      'Prendete l’impasto lievitato e stendetelo col matterello su di una spianatoia infarinata, ottenendo un rettangolo formato da una sfoglia spessa 2 mm avente un lato di circa 60 cm e l’altro di 40-45 cm. Lavorate la marmellata di arance con un cucchiaio fino a renderla morbida e poi spalmatela sulla sfoglia.',
      'Spalmate la crema di burro sulla sfoglia e poi arrotolatela sulla sua parte più lunga. Tagliate il rotolo ottenuto in 12 pezzi dello spessore di 4-5 cm l’uno.',
      'Imburrate e infarinate una tortiera del diametro di 28 cm e ponete all’interno di essa, cominciando dal perimetro, le rose di pasta, lasciando qualche cm di spazio tra di esse. Terminate ponendo anche al centro 3-4 rose di pasta e poi mettetele a lievitare per almeno 1 ora nel forno spento ma con la luce accesa.',
      'Quando le rose avranno raddoppiato il loro volume e si saranno attaccate, spennellatele con il tuorlo sbattuto assieme alla panna, cospargete con delle lamelle di mandorle e poi infornate in forno statico già caldo a 180° per circa 45-50 minuti (se utilizzate quello ventilato abbassate a 160° la temperatura del forno). Fate la prova stecchino per verificare l’avvenuta cottura.',
      'Sfornate la torta delle rose, lasciatela intiepidire e poi sformatela. Volendo potete spolverizzarla di zucchero a velo.',
    ])],
  },
  {
    num: 23, title: 'Danubio dolce', cat: 'lievitati', emoji: '🍞', servings: 10, guess: true,
    note: 'Nel PDF questa ricetta è corredata di foto passo-passo. Stampo: tortiera da 28 cm.',
    ingredients: [
      G('Impasto', ['530 g farina Manitoba', '30 g zucchero', '50 g burro', '230 ml latte intero', '4 g lievito di birra secco|oppure 12 g di fresco', '1 uovo medio', 'Scorza di limone|non trattato', '1 baccello vaniglia', '10 g sale fine', '50 ml acqua']),
      G('Crema pasticcera (quantità non indicate)', ['Latte q.b.', 'Panna q.b.', 'Scorza di 1 limone', 'Semi di 1 bacca di vaniglia', 'Tuorli q.b.', 'Zucchero q.b.', 'Amido di mais q.b.|o fecola di patate']),
      G('Per finire', ['1 uovo', '1 cucchiaio latte', 'Zucchero a velo q.b.']),
    ],
    steps: [
      G('Impasto', [
        'Fate fondere il burro (al microonde o a bagnomaria). Versate nella planetaria munita di foglia la farina setacciata, grattugiate la scorza di 1 limone non trattato, unite lo zucchero, i semi di una bacca di vaniglia e il lievito di birra disidratato.',
        'Azionate la planetaria per miscelare gli ingredienti, poi versate il latte a temperatura ambiente, l’uovo medio, proseguite con il burro fuso e quando gli ingredienti si saranno raccolti attorno alla foglia, arrestate la planetaria e sostituite la foglia con il gancio, quindi aggiungete il sale (potete discioglierlo in 50 ml di acqua a temperatura ambiente o aggiungere quest’ultima da sola dopo il burro fuso); continuate ad impastare fino a quando l’impasto non si sarà incordato e sarà divenuto morbido e omogeneo.',
        'Trasferitelo su un piano di lavoro leggermente imburrato e maneggiatelo per dare una forma sferica; ponetelo in una ciotola leggermente imburrata e copritelo con pellicola trasparente; lasciate lievitare per 2 ore in forno spento con luce accesa (oppure coprendo la ciotola con una copertina di lana).',
      ]),
      G('Crema pasticcera', [
        'In un tegame versate il latte e la panna e scaldate a fuoco lento insieme alla scorza grattugiata di 1 limone non trattato e ai semi di 1 bacca di vaniglia (per un aroma più intenso potete mettere in infusione anche la bacca di vaniglia incisa e toglierla successivamente).',
        'In un altro tegame, versate i tuorli (con gli albumi potete realizzare delle meringhe o le lingue di gatto), unite lo zucchero. Lavorate i tuorli con lo zucchero con una frusta, poi setacciate l’amido di mais (potete anche utilizzare la fecola di patate, mentre la farina tende a rendere la crema opaca). Mescolate ancora e poi versate a filo il latte scaldato in precedenza e aromatizzato (abbiate cura di togliere la bacca di vaniglia prima di versare il latte se l’avete utilizzata). Portate tutto su fuoco lento e mescolate fino a quando la crema non avrà raggiunto la consistenza ideale addensandosi.',
        'A quel punto spegnete il fuoco e trasferite la crema in una pirofila bassa e ampia: coprite con pellicola trasparente a contatto, perché freddandosi non si formi la fastidiosa pellicina in superficie. Quindi fatela raffreddare a temperatura ambiente e poi in frigorifero.',
      ]),
      G('Formatura e cottura', [
        'Quando l’impasto avrà raddoppiato il suo volume, prendetelo e stendetelo formando un filoncino su un piano di lavoro leggermente infarinato (o oleato). Ricavate con il tarocco (o un coltello dalla lama ben affilata) 30 pezzetti da 30 g l’uno; stendete ciascun pezzetto con il mattarello e farcitelo con un cucchiaio di crema pasticcera oramai fredda e rassodata.',
        'Richiudete ciascun dischetto pizzicando e sigillando bene i lembi perché il ripieno non fuoriesca e proseguite per tutte le palline. A mano a mano che realizzate il Danubio, potete adagiare le palline su una tortiera di 28 cm di diametro foderata con carta da forno, disponendole a raggiera a partire dal perimetro più esterno, fino ad arrivare al centro.',
        'Coprite con pellicola trasparente il Danubio così formato e fate lievitare ancora per 1 ora in forno spento con luce accesa. Dopodiché spennellate la superficie con l’uovo sbattuto con 1 cucchiaio di latte, quindi cuocete in forno statico preriscaldato a 180° per 30 minuti (se forno ventilato a 160° per circa 20 minuti). Una volta cotto, sfornatelo e lasciatelo intiepidire; spolverizzatelo con lo zucchero a velo.',
        'Servite il Danubio dolce direttamente nella teglia e invitate gli ospiti a staccare ciascuna pallina con le mani!',
      ]),
    ],
    tips: [
      { title: 'Conservazione', text: 'Conservate il Danubio dolce sotto una campana di vetro per alcune ore e in frigorifero coperto con pellicola per 1-2 giorni. Si può congelare se avete utilizzato tutti ingredienti freschi non decongelati.' },
      { title: 'Consiglio', text: 'Potete farcire il Danubio dolce con delle confetture, crema alla nocciola o crema pasticcera al cioccolato e per distinguere i ripieni potete decorare le palline con codette colorate o zuccherini dopo aver spennellato il Danubio e prima di infornare!' },
    ],
  },
  {
    num: 24, title: 'Ripieno tortellini originale', cat: 'basi', emoji: '🥟', servings: 1, label: 'dose',
    intro: 'Il vero tortellino. Ricetta del ripieno dei tortellini, depositata il 7 dicembre 1974 con atto notarile alla Camera di Commercio di Bologna dalla dotta Confraternita del Tortellino e dall’Academia Italiana della Cucina.',
    ingredients: [G(null, ['100 g lombo di maiale', '100 g prosciutto crudo', '100 g mortadella', '150 g parmigiano reggiano|stagionato almeno 3 anni; di più se più giovane', '1 uovo', 'Noce moscata', 'Sale, pepe, rosmarino, aglio', 'Un po’ di burro'])],
    steps: [G(null, [
      'La preparazione deve essere molto accurata: il lombo (100 grammi) deve essere tenuto a riposo per due giorni con sopra un battuto composto di sale, pepe, rosmarino ed aglio, quindi va cotto a fuoco lento con un po’ di burro e poi tolto dal tegame e ripulito dal suo battuto.',
      'Infine con il battilardo si trita molto finemente il lombo, il prosciutto crudo (100 gr) e la mortadella (100 gr) e si impasta tutto con il parmigiano reggiano (150 gr se stagionato da almeno 3 anni, in maggiore quantità se più giovane), e un uovo, aggiungendo noce moscata.',
      'L’impasto si deve mescolare a lungo fintanto che risulti bene amalgamato. Lo si lasci riposare per almeno 24 ore prima di riempire i tortellini.',
      'Per gustare un buon tortellino, indispensabile disporre di un ottimo brodo, fatto con carne di cappone ruspante (non allevato con i mangimi) e carne di manzo (punta di petto, doppione, falata).',
    ])],
  },
  {
    num: 25, title: 'Peperonata', cat: 'contorni', emoji: '🫑', servings: 6, guess: true,
    ingredients: [G(null, ['1 kg peperoni gialli, rossi e verdi', '400 g cipolla di Tropea', '400 g passata di pomodoro', '40 ml olio extra vergine', '2 spicchi aglio', 'Sale, pepe, peperoncino, zucchero q.b.'])],
    steps: [G(null, [
      'Per preparare la peperonata, lavate e asciugate i peperoni, quindi affettateli per lungo, tutto attorno al torsolo, togliete i filamenti bianchi e riduceteli a falde sottili. Mondate e affettate anche le cipolle.',
      'In un tegame capiente versate un filo d’olio e gli spicchi d’aglio mondati ma interi, fate scaldare quindi unite le cipolle.',
      'Fate stufare le cipolle a fuoco medio-basso per circa 15 minuti mescolando di tanto in tanto, se necessario aggiungendo un po’ d’acqua, fino quando saranno ammorbidite e avranno rilasciato la loro acqua.',
      'Versate i peperoni, aggiustate di sale e pepe, aggiungere un pizzico di peperoncino quindi mescolate e coprite con un coperchio.',
      'Cuocete i peperoni per altri 15 minuti circa a fuoco medio, passato questo tempo i peperoni saranno ammorbiditi, eliminate gli spicchi d’aglio, versate la passata di pomodoro mescolate e cuocete ancora per 15 minuti sempre con il coperchio, se necessario mettere un cucchiaino o due di zucchero per togliere l’acidità del pomodoro.',
      'Terminata la cottura la vostra peperonata è pronta per essere gustata calda, tiepida o anche fredda per accompagnare secondi di carne, pesce, formaggi o anche per condire la pasta.',
    ])],
  },
  {
    num: 26, title: 'Torta di rose 2 (Carla)', cat: 'lievitati', emoji: '🌹', servings: 8, guess: true,
    ingredients: [G(null, ['500 g farina', '25 g lievito di birra', '2 tazzine acqua|50-60 g', '3 cucchiai zucchero', '50 g margarina', '1 uovo', '1 pizzico sale', '1 bustina vaniglia', '100 g uvetta|facoltativa'])],
    steps: [G(null, [
      'Sciogliere lo lievito nell’acqua tiepida, aggiungere un cucchiaino di zucchero e 2-3 cucchiaia di farina fino ad ottenere una cremina; coprire e lasciar lievitare per mezz’ora in un luogo tiepido, fino a quando diventa spumoso.',
      'Aggiungere l’uovo, la margarina fusa e sbattere bene, aggiungendo poi tre cucchiai di zucchero e la farina, mescolando per ottenere una pasta morbida. Aggiungere il sale e vaniglia, lasciando poi riposare per circa 2 ore coprendo e in un posto tiepido.',
      'Stendere l’impasto, ungere con il burro (o margarina ammorbidita in acqua). Arrotolare e tagliare le brioches, adagiare in una teglia e lasciar riposare per un’altra mezz’ora.',
      'Infornare in forno preriscaldato a 200° e cuocere per mezz’ora.',
    ])],
  },
  {
    num: 27, title: 'Cappellacci con la zucca', cat: 'primi', emoji: '🎃', servings: 4, guess: true,
    ingredients: [G(null, ['1 kg zucca violina', '300 g parmigiano grattugiato', '1 uovo', 'Sale e pepe', '10 g noce moscata', '150 g amaretti|per la mantovana'])],
    steps: [
      G('Ferrarese', [
        'Tagliate la zucca a pezzi, eliminare i semi ed i filamenti e cuocere al forno. Servendovi di un cucchiaio togliere la parte più tenera della polpa lontano dalla buccia, passarla al setaccio e amalgamarla con gli altri ingredienti.',
        'Aggiungere pane grattato o formaggio per ottenere un impasto non troppo molle e umido.',
      ]),
      G('Mantovana', ['Tritare molto fine gli amaretti e unirli all’impasto, la ricetta originale prevede anche un pezzetto di mostarda piccante di mele o pere.']),
    ],
  },
  {
    num: 28, title: 'Pasticcio di maccheroni', cat: 'primi', emoji: '🥧', servings: 6, guess: true,
    ingredients: [G(null, ['300 g tacchino per ragù|oppure pollo, maiale…', '1 l besciamella', '10 g funghi secchi', '250 g pasta|pennette o simili', '1 pasta frolla|oppure sfoglia', 'Grana, burro, sale q.b.', 'Burro o olio al tartufo|a piacere'])],
    steps: [G(null, [
      'Con la carne preparare il ragù bianco (come al solito ma senza pomodoro). Mettere a mollo i funghi secchi.',
      'Preparare la besciamella, cuocere le pennette al dente e mescolare tutto con il ragù e abbondante grana grattugiato.',
      'Foderare una teglia con la pasta frolla, versare il composto, coprire il tutto con pasta frolla chiudendo i bordi.',
      'Mettere in forno a 180° per circa mezz’ora.',
    ])],
  },
  {
    num: 29, title: 'Gaufres / Waffle', cat: 'colazione', emoji: '🧇', servings: 4, label: 'porzioni', guess: true,
    link: { url: 'https://www.dailymotion.com/video/x8q3j93', label: 'Video della ricetta alternativa' },
    ingredients: [
      G('Ricetta di Liegi', ['225 g farina 00', '80 g burro', '125 g zucchero|perlato o anche di canna', 'Qualche goccia estratto di vaniglia', '70 g uova', '5 g lievito di birra fresco', '65 g latte', 'Un pizzico sale', '0,5 g cannella']),
      G('Alternativa', ['500 g farina 00', '30 g zucchero|50 di canna', '15 g lievito di birra fresco', '2 uova', '220 ml latte', '200 g burro', '250 g zucchero perlato', '0,5 g cannella', 'Qualche goccia estratto di vaniglia']),
    ],
    steps: [
      G('Preparazione 1 (ricetta di Liegi)', [
        'Intiepidire il latte e fare sciogliere il lievito, poi aggiungere la farina. Quando l’impasto è uniforme aggiungere le uova sbattute il sale e la vaniglia. Continuare ad impastare e lasciar lievitare per mezz’ora.',
        'Ammorbidire il burro e aggiungerlo poco alla volta continuando ad impastare fino a quando il burro sarà tutto incorporato.',
        'Aggiungere lo zucchero e impastare a bassa velocità o a mano.',
        'Fare lievitare per 3 o 4 ore (2 se fa caldo). Dividere l’impasto in 7 (circa 80 gr cad.).',
        'Cuocere per circa 3’ e servire tiepide con abbondante zucchero a velo.',
      ]),
      G('Preparazione 2', [
        'Sbattere le uova fino a renderle schiumose, aggiungere zucchero, zucchero vanigliato e continuare a mescolare.',
        'Mettere nella ciotola dell’impastatrice la farina lo lievito, 100 gr zucchero e 100 ml di latte, spolverare di farina, lasciar riposare in un luogo caldo fino a quando la farina si screpola.',
        'Aggiungere il burro o margarina sciolti, continuando a mescolare con la frusta ad alta velocità aggiungere gli altri ingredienti e, poco per volta, il latte e la farina, in modo da ottenere un impasto omogeneo.',
        'Lasciar riposare in un luogo caldo per un’ora e cuocere a 3/4 di potenza per 4 o 5 minuti.',
      ]),
      G('Preparazione 3 (alternativa)', [
        'Mettere la farina, zucchero e lievito nell’impastatrice e mescolare, continuando ad impastare a velocità 3 aggiungere uova, latte cannella e vaniglia, impastare per circa 4’.',
        'Ammorbidire il burro e aggiungerlo poco per volta impastando veloce per 10’.',
        'Lasciar riposare in frigo per 2 ore, poi aggiungere lo zucchero perlato e mescolare piano per incorporarlo nell’impasto.',
        'Dividere in parti da circa 90 gr e cuocere per 4’ circa. Servire con abbondante zucchero a velo.',
      ]),
    ],
  },
  {
    num: 30, title: 'Pancake', cat: 'colazione', emoji: '🥞', servings: 4, guess: true,
    ingredients: [G(null, [
      '200 g farina', '250 g latte', '250 g panna|+ farina q.b.', '2 uova', '30 g zucchero|semolato o di canna',
      '30 g olio di semi|oppure 30 g di burro fuso', '1 bustina lievito per dolci|in alternativa 1 cucchiaino di bicarbonato e un cucchiaio di succo di limone',
      'Estratto di vaniglia', '1 pizzico sale', 'Una noce di burro per la cottura',
    ])],
    steps: [G(null, [
      'Mescolare in una ciotola uova, olio, latte e limone con una frusta a mano, per ultima aggiungere la panna.',
      'A parte setacciate farina, lievito, bicarbonato e mescolare insieme a zucchero e sale, poi unire gli ingredienti secchi a quelli liquidi e mescolare piano. L’impasto dei pancakes deve presentarsi morbido, fluido, corposo e non eccessivamente liquido, eventualmente aggiungere farina.',
      'Il segreto per non bruciare i pancake è cuocere a fuoco lento. Usare una padella antiaderente, meglio se piccola, passare il burro in padella con un fazzoletto.',
      'Una volta scaldata la padella, aggiungere un mestolo di impasto senza schiacciare, lasciar cuocere qualche secondo, quando compaiono le bollicine girarli con una paletta e cuocere ancora max 20 – 25”.',
      'Metterli a raffreddare senza impilarli per evitare di schiacciarli.',
    ])],
  },
  {
    num: 31, title: 'Frittelle di mele', cat: 'colazione', emoji: '🍎', servings: 6, guess: true,
    ingredients: [G(null, ['500 g farina', '150 g zucchero', '½ bustina lievito', '3 uova', '5 mele', 'Pizzico di sale', 'Latte q.b.'])],
    steps: [G(null, [
      'Sbucciare le mele e tagliarle a fette rotonde.',
      'Impastare tutti gli ingredienti con il latte fino ad ottenere un impasto omogeneo.',
      'Mettere le fette di mela nell’impasto e cuocerle nell’olio bollente.',
    ])],
  },
  {
    num: 32, title: 'Pasta con speck, zucchine e pancetta', cat: 'primi', emoji: '🍝', servings: 4, guess: true,
    note: 'Nel ricettario manca l’elenco ingredienti: è ricavato dal procedimento, quantità a piacere.',
    ingredients: [G('Ingredienti (quantità non indicate)', ['Pasta q.b.', 'Speck a listarelle q.b.', 'Pancetta q.b.', 'Zucchine q.b.', 'Panna q.b.', 'Olio q.b.', 'Sale q.b.'])],
    steps: [G(null, [
      'Tagliare a listarelle lo speck, lavare e mondate le zucchine, poi tagliatele alla julienne con una grattugia a fori larghi.',
      'In una padella antiaderente scaldare l’olio, poi rosolare lo speck per qualche minuto, aggiungere le zucchine e proseguite la cottura.',
      'Fate cuocere la pasta in acqua leggermente salata, scolare quando al dente.',
      'Versare in padella la panna, aggiungere un goccio di acqua di cottura della pasta e mescolare per amalgamare. Scolare la pasta e trasferitela direttamente nella padella con il sugo.',
    ])],
  },
  {
    num: 33, title: 'Torta di cioccolato e pere', cat: 'dolci', emoji: '🍐', servings: 8, guess: true,
    ingredients: [G(null, ['3 uova', '3 cucchiai zucchero', '100 g cioccolato fondente', '200 g ricotta', '4 o 5 cucchiai farina bianca', '1 bustina lievito', '1 rotolo pasta frolla', '4 pere'])],
    steps: [G(null, [
      'Montare i tuorli con lo zucchero, aggiungere gli albumi montati a neve, il cioccolato liquefatto, ricotta, farina e lievito mescolando con la frusta. Poi incorporare le pere a fettine sottili.',
      'Foderare una tortiera con carta forno e stendervi la pasta frolla, riempire con l’impasto.',
      'Cuocere a 180° per un’ora circa.',
    ])],
  },
  {
    num: 34, title: 'Pancake dolci con albumi', cat: 'colazione', emoji: '🥞', servings: 4, guess: true,
    ingredients: [G(null, ['250 g farina', '250 ml latte', '2 albumi', 'Zucchero semolato', 'Lievito in polvere per dolci', 'Estratto di vaniglia', 'Olio di semi', 'Sale'])],
    steps: [G(null, [
      'Montare gli albumi a neve con un pizzico di sale; a parte unire la farina e un cucchiaio di lievito e setacciare il composto con un cucchiaio di zucchero, aggiungere il latte, un cucchiaio di olio e un cucchiaio di estratto di vaniglia, mescolando per ottenere un impasto omogeneo.',
      'Incorporare gli albumi mescolando dal basso verso l’alto. Volendo si può aggiungere una banana molto matura ben schiacciata.',
      'Ungere con poco olio (burro?) una padella antiaderente e scaldarla su fuoco vivace, abbassare il fuoco e mettere un mestolo di composto e cuocere per un paio di minuti, quindi voltare e cuocere per altri due minuti, finché non si formano le bollicine in superficie e i bordi appariranno ben cotti. Continuare fino alla fine del composto.',
      'Servire i pancake caldi unendo marmellata, sciroppo d’acero o simili.',
    ])],
  },
  {
    num: 35, title: 'Shokupan', subtitle: 'pane soffice giapponese', cat: 'lievitati', emoji: '🍞', servings: 1, label: 'pagnotta',
    note: 'Tre ricette a confronto: scegli la tua! Le dosi si scalano per tutte insieme.',
    ingredients: [
      G('Ricetta 1 · water roux', ['30 g farina Manitoba', '100 ml acqua']),
      G('Ricetta 1 · impasto', ['350 g farina Manitoba', '100 ml latte', '60 g zucchero', '5 g lievito di birra secco', '7 g sale', '1 uovo intero', '50 g burro ammorbidito']),
      G('Ricetta 2 · water roux (tang zhong)', ['15 g farina 00', '90 ml latte intero']),
      G('Ricetta 2 · impasto', ['300 g farina 00', '4 g lievito SAF Gold', '100 ml latte', '1 uovo']),
      G('Ricetta 2 · da aggiungere alla fine', ['30 g zucchero', 'Un pizzico sale', '40 g burro ammorbidito']),
      G('Ricetta 3 · roux', ['25 g farina 00', '125 ml latte intero']),
      G('Ricetta 3 · impasto', ['350 g farina 0', '7 g lievito SAF Gold|o cubetto di lievito di birra', '180 ml latte freddo', '1 cucchiaio miele di acacia', '1 uovo']),
      G('Ricetta 3 · da aggiungere alla fine', ['40 g zucchero', '8 g sale', '50 g burro ammorbidito']),
    ],
    steps: [
      G('Ricetta 1 · water roux', ['Mettere la farina Manitoba in una ciotola, aggiungere l’acqua tiepida e mescolare. Una volta ottenuto un composto liscio e compatto, trasferire in un pentolino e scaldare a circa 70°. Versare in una piccola ciotola, coprire con pellicola e lasciarlo raffreddare e poi mettere in frigorifero a riposare per almeno 6 ore (meglio se tutta la notte).']),
      G('Ricetta 1 · impasto', [
        'In un’altra ciotola, mescolare il latte tiepido, lo zucchero e il lievito. Aggiungi l’uovo, poi incorporare la farina, il water roux e il sale. Mescolare bene, unire il burro morbido e continuare a impastare.',
        'Coprire l’impasto e lasciarlo lievitare per circa 2 ore in un luogo asciutto.',
        'Dividere l’impasto in 3 porzioni, formare delle palline e lasciar riposare per altri 30 minuti.',
        'Prendi le palline una per una, infarinare leggermente la superficie, appiattiscile con le mani e poi stendile con un mattarello. Piega prima i bordi laterali verso il centro, poi piega la parte inferiore verso l’alto arrotolando l’impasto, lasciando sotto la parte terminale.',
        'Disponi i rotolini nello stampo da forno (es: quelli per pancake) già imburrato, coprire e lasciali lievitare per altri 30 minuti, fino a quando arrivano al bordo. Spennellare la superficie dell’impasto con la panna.',
        'Cuocere in forno statico preriscaldato a 180° per 50’, a metà cottura coprire con carta stagnola. Lasciar raffreddare prima di toglierlo dallo stampo.',
        'Si può tagliare a fette da 3 cm, eventualmente tostate e coperte con marmellata, nutella o fare dei panini con prosciutto o altro. Si può conservare lo shokupan per 1 settimana in un sacchetto per alimenti ben chiuso.',
      ]),
      G('Ricetta 2 · water roux (tang zhong)', ['Mettete il latte in un pentolino e spolverare con la farina 00 continuando a mescolare per evitare che faccia grumi. Cuocete il composto a fuoco medio-basso fino a quando non diventa una crema densa (circa 65 °C). Togliete dal fuoco e coprite con pellicola trasparente, toccando il composto in modo che non si formi la crosticina. Conservatelo in frigorifero per 12 ore nello scomparto più freddo.']),
      G('Ricetta 2 · impasto', [
        'Mescolare lo lievito con 2 cucchiai di latte caldo. Lasciate riposare per 10 minuti, finché non diventa schiumoso e spumeggiante.',
        'Mescolate tutti gli ingredienti secchi in una ciotola, create un buco al centro e versate gli ingredienti umidi e il tang zhong preparato in precedenza. Impastate a velocità 2 con il gancio fino a quando tutto l’impasto granuloso non inizia a compattarsi in un’unica massa; potrebbero volerci circa 2-3 minuti. Non aggiungete liquidi. Potrebbe essere necessario fermarsi a metà cottura e raschiare l’impasto dal gancio e dai lati della ciotola, quindi impastare di nuovo più volte.',
        'Una volta ottenuto un impasto grossolano, spegnete la macchina. Non preoccupatevi, l’impasto non sarà liscio. Coprite l’impasto con pellicola trasparente e lasciatelo riposare per 20 minuti. Questo è un riposo importante che i fornai chiamano autolisi.',
        'Dopo il riposo, riaccendete la planetaria e impastate di nuovo a velocità 2 per 1-2 minuti, fino a ottenere un impasto leggermente più liscio. Aggiungete quindi il sale e lo zucchero. Continuate a impastare fino a ottenere un impasto relativamente liscio. Durante questo processo, fermatevi e raschiate l’impasto dal gancio e dalla ciotola più volte.',
        'Una volta ottenuto un impasto liscio, riaccendete la macchina per impastare e aumentate la velocità a 4. Aggiungete gradualmente il burro ammorbidito, poco alla volta. L’impasto diventerà di nuovo un vero pasticcio appiccicoso a causa del burro, continuate a impastare e fermatevi a metà, raschiate di nuovo l’impasto dal gancio e dalla ciotola e continuate a impastare finché il burro non sarà assorbito dall’impasto. ACCADRÀ, non preoccupatevi! NON siate tentati di aggiungere altra farina. Otterrete un impasto liscio e lucido, molto elastico. Ci vorranno circa 10-15 minuti. L’impasto deve superare la prova della finestra, ovvero quando si allunga una piccola quantità di impasto sottilmente, non si romperà e la luce può passare attraverso.',
        'Mettere l’impasto in una ciotola capiente leggermente unta, coprirlo con un canovaccio pulito e umido o con pellicola trasparente e lasciarlo in un luogo caldo per circa 1 ora, finché l’impasto non raddoppia di volume.',
        'Sgonfiate l’impasto, poi arrotolatelo fino a formare una palla e conservatela in un contenitore ermetico e riponetela nella parte più fredda del frigorifero (non nel congelatore) per un massimo di 12 ore. Non consiglio di conservarla più a lungo. Procedete alla formatura.',
        'Ungete leggermente lo stampo da plumcake. Potete anche usare uno spray antiaderente. Se l’impasto è freddo di frigorifero, lasciatelo riposare a temperatura ambiente per circa 15-20 minuti e poi procedete alla formatura. Sgonfiare l’impasto e dividerlo in 3 parti uguali. Coprire l’impasto con pellicola trasparente e lasciarlo riposare per 10 minuti per rilassare il glutine.',
        'Stendete ogni pallina fino a formare un rettangolo (non è necessario essere precisi). Ripiegate i due lati lunghi verso l’alto e poi arrotolate dal basso verso l’alto. Posizionate la chiusura rivolta verso il basso nello stampo da plumcake e ripetete l’operazione con gli altri 2 impasti. Disponeteli uno accanto all’altro. Coprite con pellicola trasparente e far lievitare finché non arriva al bordo dello stampo (1 ora circa).',
      ]),
      G('Ricetta 2 · cottura al forno', [
        'Posizionate la teglia sul ripiano centrale e lasciate cuocere per i successivi 25-30 minuti, a seconda del forno, la temperatura interna al centro del pane è di almeno 88 °C. Consiglio vivamente un termometro digitale per evitare ogni dubbio!',
        'Sfornate, togliete il pane dalla teglia e lasciatelo raffreddare completamente sulla griglia. Gustatelo e, una volta raffreddato completamente, avvolgetelo nella pellicola trasparente: si conserva per circa 3 giorni a temperatura ambiente (a casa nostra non durava così a lungo).',
      ]),
      G('Ricetta 3', [
        'Water roux: in un pentolino, cuocete il mix di farina e acqua a fuoco dolce, finché otterrete un gel. Spostatelo in una ciotolina e fatelo raffreddare, coprendolo con pellicola a contatto.',
        'In una ciotola unite il roux ormai freddo e la farina. Poi aggiungete zucchero, sale, miele, lievito e latte poco alla volta e mescolate. Per ultimo incorporate piano piano il burro morbido e continuate a impastare fino a ottenere una pagnotta liscia. Fatela lievitare per 2 ore a temperatura ambiente, poi tutta la notte in frigo.',
        'Terminato il tempo di lievitazione, dividete l’impasto in 3 pezzi da 245 g e date a ciascuno una forma sferica facendolo roteare con le mani sul piano da lavoro. Con l’aiuto del matterello stendete le tre porzioni in rettangoli.',
        'Piegate un rettangolo riportando i lati lunghi verso il centro e poi arrotolate il tutto da un capo verso l’altro in modo da ottenere un cilindro. Procedete in questo modo con i 2 pezzi di impasto restanti.',
        'Adagiate i cilindri ottenuti all’interno di uno stampo da plumcake da 25×11 cm, imburrato, disponendolo con la “chiusura” verso il basso. Coprite con la pellicola alimentare e fate lievitare fino a quando la brioche arriverà fino al bordo (ci vorranno circa 2-3 ore). Spennellate la superficie con il tuorlo sbattuto con un po’ di latte.',
        'Infornate l’impasto in forno, preriscaldato a 180 °C, inserendo lo stampo nella parte bassa del forno. Cuocete per 30-40 minuti circa, coprendo la superficie con un foglio di alluminio a metà cottura.',
        'Sfornate il vostro shokupan pane al latte giapponese e gustatelo!',
      ]),
    ],
  },
  {
    num: 36, title: 'Gelato alla frutta', subtitle: 'con preparato Beppiani', cat: 'dolci', emoji: '🍓', servings: 4, guess: true,
    ingredients: [G(null, ['300 g fragole', '280 g acqua tiepida', '200 g preparato'])],
    steps: [G(null, [
      'Mettere gli ingredienti in una ciotola e frullare bene, mettere tutto nella gelatiera e far mantecare per circa 1 ora, fino a quando è ben compatto. Spostare in un contenitore e mettere in freezer per circa 2 ore.',
    ])],
  },
  {
    num: 37, title: 'Gelato al limone', cat: 'dolci', emoji: '🍋', servings: 4, guess: true,
    ingredients: [G(null, ['3 limoni', '250 g panna', '200 g latte intero|oppure 180 g di latte condensato', '160 g zucchero a velo vanigliato'])],
    steps: [G(null, [
      'Pulire i limoni e grattare la buccia di un paio, poi spremerli e mettere il succo in una ciotola, aggiungere il latte e lo zucchero (se non vanigliato mettere qualche goccia di estratto). Frullare bene, poi aggiungere la panna e la buccia grattugiata del limone e frullare ancora.',
      'Mettere in frigo per un quarto d’ora, poi spostare nella gelatiera e mantecare per circa un’ora. Quando è ben compatto spostare in un contenitore e mettere nel freezer per almeno un paio d’ore.',
    ])],
  },
];
