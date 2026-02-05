import type { MessagePattern } from '../utils/types';

// IDs de juegos hardcodeados (para fallback)
export type HardcodedGameId = 'rdr2' | 'bg3' | 'minecraft';

export const MESSAGE_PATTERNS: Record<HardcodedGameId, MessagePattern> = {
  rdr2: {
    gameplay: [
      'Ese headshot estuvo limpio!',
      'Cuidado con los O\'Driscolls',
      'Ya desbloqueaste el campamento completo?',
      'BOAH ese caballo esta epico',
      'F por el caballo',
      'Dutch tiene un plan... seguro',
      'Ese lasso fue perfecto',
      'Nice robbery!',
      'La punteria esta on fire',
      'Vas a subir o bajar el honor?',
      'Esa mision es de las mejores',
      'Arthur es el mejor protagonista',
      'Los graficos son una locura',
      'Ese campamento esta aesthetic',
      'Ya fuiste a Saint Denis?',
      'Momento cinematografico'
    ],
    reactions: [
      'JAJAJA ese ragdoll',
      'XD',
      'LOL',
      'Clasico Rockstar',
      'No puede ser',
      'KEKW',
      'Brutal hermano',
      'LMAOOO',
      'Uff ese momento',
      'Increible',
      'Epico',
      'Me muero jajaja',
      'Ese bug es legendario'
    ],
    questions: [
      'Honor alto o bajo?',
      'Que arma usas mas?',
      'Ya exploraste toda la zona?',
      'Cuantas horas llevas?',
      'Que capitulo vas?',
      'Customizaste tu caballo?',
      'Completaste todos los desafios?',
      'Encontraste algun easter egg?',
      'Ya hiciste todas las side quests?',
      'Que build estas usando?'
    ]
  },
  bg3: {
    gameplay: [
      'Esa tirada critica salvo la party',
      'Romance con Shadowheart?',
      'Ese build esta roto jaja',
      'Multiclase o puro?',
      'Los dados estan bendiciendo hoy',
      'Natural 20! POG',
      'Ese spell combo fue 200 IQ',
      'Karlach best girl',
      'Esa decision tiene consecuencias',
      'Ya probaste hablar con los animales?',
      'Ese dialogo fue oro puro',
      'La historia es una obra de arte',
      'Astarion siendo Astarion',
      'Esa build es meta',
      'Gale y sus discursos jajaja',
      'Los graficos son insanos'
    ],
    reactions: [
      'JAJAJA',
      'KEKW ese fail',
      'XD los dados te odian',
      'Brutal',
      'Epico',
      'LOL',
      'No puede ser',
      'Ese RNG',
      'Increible',
      'LMAO',
      'Uff que momento',
      'Clasico D&D',
      'Me encanta este juego'
    ],
    questions: [
      'Que clase estas usando?',
      'Ya llegaste al acto 2?',
      'Con quien vas a hacer romance?',
      'Cuantos NPCs has matado?',
      'Que companion usas mas?',
      'Multiclase o puro?',
      'Completaste el acto 1?',
      'Que build recomiendas?',
      'Cuantas horas llevas?',
      'Salvaste a todos?'
    ]
  },
  minecraft: {
    gameplay: [
      'Nice build!',
      'Ya encontraste diamantes?',
      'Cuidado con los creepers',
      'Esa redstone esta 200 IQ',
      'F por las cosas',
      'Modo survival o creativo?',
      'Ese diseno esta limpio',
      'Fortune III! POG',
      'Esa granja es eficiente',
      'Los shaders se ven increibles',
      'Ese es tu main world?',
      'Esa casa esta aesthetic',
      'Nice enchantments!',
      'El Nether da miedo',
      'Ese mob farm es genius',
      'La textura pack esta bonita'
    ],
    reactions: [
      'JAJAJA',
      'XD',
      'LOL ese fail',
      'Clasico Minecraft',
      'No puede ser',
      'KEKW',
      'F',
      'RIP',
      'Brutal hermano',
      'Epico',
      'Ese creeper',
      'Me muero jajaja',
      'Uff que susto'
    ],
    questions: [
      'Que version estas jugando?',
      'Vas a hacer granja automatica?',
      'Ya fuiste al Nether?',
      'Cuantos dias llevas?',
      'Usas mods?',
      'Tienes elytra ya?',
      'Que texture pack usas?',
      'Encontraste una mansion?',
      'Ya derrotaste al Ender Dragon?',
      'Cuantos diamantes tienes?'
    ]
  }
};

export function getPatternsByGameId(gameId: HardcodedGameId): MessagePattern {
  return MESSAGE_PATTERNS[gameId];
}
