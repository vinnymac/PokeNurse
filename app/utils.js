import {
  times
} from 'lodash'

import POGOProtos from 'node-pogo-protos'

import {
  defaultSettings
} from './reducers/settings'

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

const TYPES = Object
  .keys(POGOProtos.Enums.PokemonType)
  .map(t => t.split('_')[2].toLowerCase())

const NAMES = Object
  .keys(POGOProtos.Enums.PokemonId)
  .map(name =>
    // 'HO_OH'
    name
      // ['HO', 'OH']
      .split('_')
      // ['Ho', 'Oh']
      .map(word => capitalize(word))
      // 'Ho' + 'Oh'
      .join(' ')
      // Nidoran Male/Female
      .replace('Female', '♀')
      .replace('Male', '♂')
  )

const COSTUMES = Object
  .keys(POGOProtos.Enums.Costume)
  .map(c => c.split('_').map(word => capitalize(word)).join(' '))

const GENDERS = Object
  .keys(POGOProtos.Enums.Gender)
  .map(g => g.split('_').map(word => capitalize(word)).join(' '))

const FORMS = Object
  .keys(POGOProtos.Enums.Form)
  .map(f => f.split('_').map(word => capitalize(word)).join(' '))

const levelCpMultiplier = {
  1: 0.094,
  1.5: 0.135137432,
  2: 0.16639787,
  2.5: 0.192650919,
  3: 0.21573247,
  3.5: 0.236572661,
  4: 0.25572005,
  4.5: 0.273530381,
  5: 0.29024988,
  5.5: 0.306057377,
  6: 0.3210876,
  6.5: 0.335445036,
  7: 0.34921268,
  7.5: 0.362457751,
  8: 0.37523559,
  8.5: 0.387592406,
  9: 0.39956728,
  9.5: 0.411193551,
  10: 0.42250001,
  10.5: 0.432926419,
  11: 0.44310755,
  11.5: 0.453059958,
  12: 0.46279839,
  12.5: 0.472336083,
  13: 0.48168495,
  13.5: 0.4908558,
  14: 0.49985844,
  14.5: 0.508701765,
  15: 0.51739395,
  15.5: 0.525942511,
  16: 0.53435433,
  16.5: 0.542635767,
  17: 0.55079269,
  17.5: 0.558830576,
  18: 0.56675452,
  18.5: 0.574569153,
  19: 0.58227891,
  19.5: 0.589887917,
  20: 0.59740001,
  20.5: 0.604818814,
  21: 0.61215729,
  21.5: 0.619399365,
  22: 0.62656713,
  22.5: 0.633644533,
  23: 0.64065295,
  23.5: 0.647576426,
  24: 0.65443563,
  24.5: 0.661214806,
  25: 0.667934,
  25.5: 0.674577537,
  26: 0.68116492,
  26.5: 0.687680648,
  27: 0.69414365,
  27.5: 0.700538673,
  28: 0.70688421,
  28.5: 0.713164996,
  29: 0.71939909,
  29.5: 0.725571552,
  30: 0.7317,
  30.5: 0.734741009,
  31: 0.73776948,
  31.5: 0.740785574,
  32: 0.74378943,
  32.5: 0.746781211,
  33: 0.74976104,
  33.5: 0.752729087,
  34: 0.75568551,
  34.5: 0.758630378,
  35: 0.76156384,
  35.5: 0.764486065,
  36: 0.76739717,
  36.5: 0.770297266,
  37: 0.7731865,
  37.5: 0.776064962,
  38: 0.77893275,
  38.5: 0.781790055,
  39: 0.78463697,
  39.5: 0.787473578,
  40: 0.79030001,
  40.5: 0.7931164
}

const candyColors = {
  1: {
    pokemon: 'Bulbasaur',
    primaryColor: '#36C8A4',
    secondaryColor: '#A3FB83',
    verified: true
  },
  4: {
    pokemon: 'Charmander',
    primaryColor: '#F09230',
    secondaryColor: '#FFE699',
    verified: true
  },
  7: {
    pokemon: 'Squirtle',
    primaryColor: '#85C4D6',
    secondaryColor: '#F2E8BE',
    verified: true
  },
  10: {
    pokemon: 'Caterpie',
    primaryColor: '#A5CD87',
    secondaryColor: '#FAE3B1',
    verified: true
  },
  13: {
    pokemon: 'Weedle',
    primaryColor: '#E7BC83',
    secondaryColor: '#DB76AD',
    verified: true
  },
  16: {
    pokemon: 'Pidgey',
    primaryColor: '#E9E0B7',
    secondaryColor: '#D29E65',
    verified: true
  },
  19: {
    pokemon: 'Rattata',
    primaryColor: '#A989BA',
    secondaryColor: '#D9D7BE',
    verified: true
  },
  21: {
    pokemon: 'Spearow',
    primaryColor: '#EBB9A0',
    secondaryColor: '#FE5D6C',
    verified: true
  },
  23: {
    pokemon: 'Ekans',
    primaryColor: '#CBA8C9',
    secondaryColor: '#F1E090',
    verified: true
  },
  25: {
    pokemon: 'Pikachu',
    primaryColor: '#F5D368',
    secondaryColor: '#E2A65D',
    verified: true
  },
  27: {
    pokemon: 'Sandshrew',
    primaryColor: '#E0D2A4',
    secondaryColor: '#C9B180',
    verified: true
  },
  29: {
    pokemon: 'Nidoran F',
    primaryColor: '#C5D3E4',
    secondaryColor: '#9697C5',
    verified: true
  },
  32: {
    pokemon: 'Nidoran M',
    primaryColor: '#D59FC1',
    secondaryColor: '#C37096',
    verified: true
  },
  35: {
    pokemon: 'Clefairy',
    primaryColor: '#F1D3D1',
    secondaryColor: '#F1BFC0',
    verified: true
  },
  37: {
    pokemon: 'Vulpix',
    primaryColor: '#F5865E',
    secondaryColor: '#F6D29C',
    verified: true
  },
  39: {
    pokemon: 'Jigglypuff',
    primaryColor: '#F1D2E1',
    secondaryColor: '#EAB9CE',
    verified: true
  },
  41: {
    pokemon: 'Zubat',
    primaryColor: '#478ABF',
    secondaryColor: '#DC8DD7',
    verified: true
  },
  43: {
    pokemon: 'Oddish',
    primaryColor: '#7095BF',
    secondaryColor: '#75C06B',
    verified: true
  },
  46: {
    pokemon: 'Paras',
    primaryColor: '#F1873D',
    secondaryColor: '#FFD159',
    verified: true
  },
  48: {
    pokemon: 'Venonat',
    primaryColor: '#998FD6',
    secondaryColor: '#E24379',
    verified: true
  },
  50: {
    pokemon: 'Diglett',
    primaryColor: '#B08570',
    secondaryColor: '#EEC5DC',
    verified: true
  },
  52: {
    pokemon: 'Meowth',
    primaryColor: '#ECE0C4',
    secondaryColor: '#FFE28A',
    verified: true
  },
  54: {
    pokemon: 'Psyduck',
    primaryColor: '#F4C487',
    secondaryColor: '#EEEED8',
    verified: true
  },
  56: {
    pokemon: 'Mankey',
    primaryColor: '#E5D6CB',
    secondaryColor: '#C3927F',
    verified: true
  },
  58: {
    pokemon: 'Growlithe',
    primaryColor: '#F3A056',
    secondaryColor: '#3F3D2A',
    verified: true
  },
  60: {
    pokemon: 'Poliwag',
    primaryColor: '#849FCA',
    secondaryColor: '#ECECF6',
    verified: true
  },
  63: {
    pokemon: 'Abra',
    primaryColor: '#E5CE5C',
    secondaryColor: '#8E7994',
    verified: true
  },
  66: {
    pokemon: 'Machop',
    primaryColor: '#A1BBDE',
    secondaryColor: '#DCCEB1',
    verified: true
  },
  69: {
    pokemon: 'Bellsprout',
    primaryColor: '#EBE16E',
    secondaryColor: '#AFD57E',
    verified: true
  },
  72: {
    pokemon: 'Tentacool',
    primaryColor: '#71ACD8',
    secondaryColor: '#C24589',
    verified: true
  },
  74: {
    pokemon: 'Geodude',
    primaryColor: '#ACA078',
    secondaryColor: '#756108',
    verified: true
  },
  77: {
    pokemon: 'Ponyta',
    primaryColor: '#EDE7C7',
    secondaryColor: '#F59062',
    verified: true
  },
  79: {
    pokemon: 'Slowpoke',
    primaryColor: '#DFA1B9',
    secondaryColor: '#EEE1C7',
    verified: true
  },
  81: {
    pokemon: 'Magnemite',
    primaryColor: '#D0DAE0',
    secondaryColor: '#92B6C6',
    verified: true
  },
  83: {
    pokemon: 'Farfetch\'d',
    primaryColor: '#AC9E95',
    secondaryColor: '#95FB97',
    verified: true
  },
  84: {
    pokemon: 'Doduo',
    primaryColor: '#C89462',
    secondaryColor: '#AF755F',
    verified: true
  },
  86: {
    pokemon: 'Seel',
    primaryColor: '#C7DFE8',
    secondaryColor: '#B6CAED',
    verified: true
  },
  88: {
    pokemon: 'Grimer',
    primaryColor: '#BFA4C7',
    secondaryColor: '#5F5370',
    verified: true
  },
  90: {
    pokemon: 'Shellder',
    primaryColor: '#AB9CC5',
    secondaryColor: '#E0B5B3',
    verified: true
  },
  92: {
    pokemon: 'Gastly',
    primaryColor: '#242223',
    secondaryColor: '#9B7FB7',
    verified: true
  },
  95: {
    pokemon: 'Onix',
    primaryColor: '#B5B6B8',
    secondaryColor: '#626264',
    verified: true
  },
  96: {
    pokemon: 'Drowzee',
    primaryColor: '#F8CB58',
    secondaryColor: '#AF7961',
    verified: true
  },
  98: {
    pokemon: 'Krabby',
    primaryColor: '#EB9063',
    secondaryColor: '#EDD9CE',
    verified: true
  },
  100: {
    pokemon: 'Voltorb',
    primaryColor: '#B64656',
    secondaryColor: '#F0E5EA',
    verified: true
  },
  102: {
    pokemon: 'Exeggcute',
    primaryColor: '#F4DDE7',
    secondaryColor: '#EFC3C1',
    verified: true
  },
  104: {
    pokemon: 'Cubone',
    primaryColor: '#D4D5D6',
    secondaryColor: '#CBB57A',
    verified: true
  },
  106: {
    pokemon: 'Hitmonlee',
    primaryColor: '#BD9F88',
    secondaryColor: '#EEE1C7',
    verified: true
  },
  107: {
    pokemon: 'Hitmonchan',
    primaryColor: '#C8ABBB',
    secondaryColor: '#E4643B',
    verified: true
  },
  108: {
    pokemon: 'Lickitung',
    primaryColor: '#E3AEB9',
    secondaryColor: '#F0E4CA',
    verified: true
  },
  109: {
    pokemon: 'Koffing',
    primaryColor: '#8B8FAE',
    secondaryColor: '#DEE0BF',
    verified: true
  },
  111: {
    pokemon: 'Rhyhorn',
    primaryColor: '#BCBDBF',
    secondaryColor: '#959CA2',
    verified: true
  },
  113: {
    pokemon: 'Chansey',
    primaryColor: '#E0AEB2',
    secondaryColor: '#C68D87',
    verified: true
  },
  114: {
    pokemon: 'Tangela',
    primaryColor: '#666C9D',
    secondaryColor: '#E46E8C',
    verified: true
  },
  115: {
    pokemon: 'Kangaskhan',
    primaryColor: '#978781',
    secondaryColor: '#E3DDB8',
    verified: true
  },
  116: {
    pokemon: 'Horsea',
    primaryColor: '#9FCFE9',
    secondaryColor: '#FCF7D7',
    verified: true
  },
  118: {
    pokemon: 'Goldeen',
    primaryColor: '#E6E6E7',
    secondaryColor: '#F38469',
    verified: true
  },
  120: {
    pokemon: 'Staryu',
    primaryColor: '#B49569',
    secondaryColor: '#F5E688',
    verified: true
  },
  122: {
    pokemon: 'Mr_Mime',
    primaryColor: '#E56387',
    secondaryColor: '#FFCED5',
    verified: true
  },
  123: {
    pokemon: 'Scyther',
    primaryColor: '#92C587',
    secondaryColor: '#F6F0CF',
    verified: true
  },
  124: {
    pokemon: 'Jynx',
    primaryColor: '#C44552',
    secondaryColor: '#643187',
    verified: true
  },
  125: {
    pokemon: 'Electabuzz',
    primaryColor: '#F5DB77',
    secondaryColor: '#14175E',
    verified: true
  },
  126: {
    pokemon: 'Magmar',
    primaryColor: '#F5D477',
    secondaryColor: '#F0664E',
    verified: true
  },
  127: {
    pokemon: 'Pinsir',
    primaryColor: '#BCB1AB',
    secondaryColor: '#CFD4D8',
    verified: true
  },
  128: {
    pokemon: 'Tauros',
    primaryColor: '#D8A058',
    secondaryColor: '#887E6F',
    verified: true
  },
  129: {
    pokemon: 'Magikarp',
    primaryColor: '#E87839',
    secondaryColor: '#F6F0CF',
    verified: true
  },
  131: {
    pokemon: 'Lapras',
    primaryColor: '#6BA7D4',
    secondaryColor: '#FFF0DA',
    verified: true
  },
  132: {
    pokemon: 'Ditto',
    primaryColor: '#F2ABC0',
    secondaryColor: '#DA74AC',
    verified: true
  },
  133: {
    pokemon: 'Eevee',
    primaryColor: '#CA9761',
    secondaryColor: '#7E5621',
    verified: true
  },
  137: {
    pokemon: 'Porygon',
    primaryColor: '#E7757C',
    secondaryColor: '#6BC7C5',
    verified: true
  },
  138: {
    pokemon: 'Omanyte',
    primaryColor: '#DDDCCC',
    secondaryColor: '#73CEE2',
    verified: true
  },
  140: {
    pokemon: 'Kabuto',
    primaryColor: '#C18335',
    secondaryColor: '#4E4E48',
    verified: true
  },
  142: {
    pokemon: 'Aerodactyl',
    primaryColor: '#D4BAD3',
    secondaryColor: '#B196C5',
    verified: true
  },
  143: {
    pokemon: 'Snorlax',
    primaryColor: '#326583',
    secondaryColor: '#E3DACE',
    verified: true
  },
  144: {
    pokemon: 'Articuno',
    primaryColor: '#8dc0e6',
    secondaryColor: '#5b99bb',
    verified: true
  },
  145: {
    pokemon: 'Zapdos',
    primaryColor: '#f8de8a',
    secondaryColor: '#af9354',
    verified: true
  },
  146: {
    pokemon: 'Moltres',
    primaryColor: '#fccf81',
    secondaryColor: '#e6845f',
    verified: true
  },
  147: {
    pokemon: 'Dratini',
    primaryColor: '#90AED4',
    secondaryColor: '#EFEAE6',
    verified: true
  },
  150: {
    pokemon: 'Mewtwo',
    primaryColor: '#c8d3ea',
    secondaryColor: '#8d96b5',
    verified: true
  },
  151: {
    pokemon: 'Mew',
    primaryColor: '#eedfe9',
    secondaryColor: '#e7bbce',
    verified: true
  },
  152: {
    pokemon: 'Chikorita',
    primaryColor: '#CBDAAE',
    secondaryColor: '#86C07C',
    verified: true
  },
  155: {
    pokemon: 'Cyndaquil',
    primaryColor: '#185E62',
    secondaryColor: '#EED9AC',
    verified: true
  },
  158: {
    pokemon: 'Totodile',
    primaryColor: '#96B8C1',
    secondaryColor: '#BF8390',
    verified: true
  },
  161: {
    pokemon: 'Sentret',
    primaryColor: '#AA8374',
    secondaryColor: '#FDFAEE',
    verified: true
  },
  163: {
    pokemon: 'Hoothoot',
    primaryColor: '#A88F77',
    secondaryColor: '#3A3836',
    verified: true
  },
  165: {
    pokemon: 'Ledyba',
    primaryColor: '#E4845F',
    secondaryColor: '#291F1D',
    verified: true
  },
  167: {
    pokemon: 'Spinarak',
    primaryColor: '#A4D08C',
    secondaryColor: '#F6DA8C',
    verified: true
  },
  170: {
    pokemon: 'Chinchou',
    primaryColor: '#728ABD',
    secondaryColor: '#EEDC9D',
    verified: true
  },
  175: {
    pokemon: 'Togepi',
    primaryColor: '#EADEB2',
    secondaryColor: '#BDC4CE',
    verified: true
  },
  177: {
    pokemon: 'Natu',
    primaryColor: '#85BD57',
    secondaryColor: '#E9CA67',
    verified: true
  },
  179: {
    pokemon: 'Mareep',
    primaryColor: '#F2E5C2',
    secondaryColor: '#5A84B1',
    verified: true
  },
  183: {
    pokemon: 'Marill',
    primaryColor: '#52B3E4',
    secondaryColor: '#E1F4F6',
    verified: true
  },
  185: {
    pokemon: 'Sudowoodo',
    primaryColor: '#AE9F85',
    secondaryColor: '#88AB72',
    verified: true
  },
  187: {
    pokemon: 'Hoppip',
    primaryColor: '#EB92A8',
    secondaryColor: '#A8CF86',
    verified: true
  },
  190: {
    pokemon: 'Aipom',
    primaryColor: '#BA9DB7',
    secondaryColor: '#DBC4B1',
    verified: true
  },
  191: {
    pokemon: 'Sunkern',
    primaryColor: '#EAD887',
    secondaryColor: '#83B177',
    verified: true
  },
  193: {
    pokemon: 'Yanma',
    primaryColor: '#BC836F',
    secondaryColor: '#A6AD72',
    verified: true
  },
  194: {
    pokemon: 'Wooper',
    primaryColor: '#97C3DA',
    secondaryColor: '#B593A0',
    verified: true
  },
  198: {
    pokemon: 'Murkrow',
    primaryColor: '#3B5670',
    secondaryColor: '#F0D3A4',
    verified: true
  },
  200: {
    pokemon: 'Misdreavus',
    primaryColor: '#8994A0',
    secondaryColor: '#B97F85',
    verified: true
  },
  201: {
    pokemon: 'Unown',
    primaryColor: '#51626E',
    secondaryColor: '#CED6E0',
    verified: true
  },
  202: {
    pokemon: 'Wobbuffet',
    primaryColor: '#54ADC9',
    secondaryColor: '#2E2F33',
    verified: true
  },
  203: {
    pokemon: 'Girafarig',
    primaryColor: '#E7AB3D',
    secondaryColor: '#39281F',
    verified: true
  },
  204: {
    pokemon: 'Pineco',
    primaryColor: '#1A4146',
    secondaryColor: '#8FABA0',
    verified: true
  },
  206: {
    pokemon: 'Dunsparce',
    primaryColor: '#F2DF93',
    secondaryColor: '#4B908C',
    verified: true
  },
  207: {
    pokemon: 'Gligar',
    primaryColor: '#D18EB2',
    secondaryColor: '#598ABC',
    verified: true
  },
  209: {
    pokemon: 'Snubbull',
    primaryColor: '#E78C96',
    secondaryColor: '#3B2F2D',
    verified: true
  },
  211: {
    pokemon: 'Qwilfish',
    primaryColor: '#4A7471',
    secondaryColor: '#E5EAB4',
    verified: true
  },
  213: {
    pokemon: 'Shuckle',
    primaryColor: '#942D2B',
    secondaryColor: '#F5CF6C',
    verified: true
  },
  214: {
    pokemon: 'Heracross',
    primaryColor: '#2B5978',
    secondaryColor: '#93AFC1',
    verified: true
  },
  215: {
    pokemon: 'Sneasel',
    primaryColor: '#5F8795',
    secondaryColor: '#D76B68',
    verified: true
  },
  216: {
    pokemon: 'Teddiursa',
    primaryColor: '#E09659',
    secondaryColor: '#FBE699',
    verified: true
  },
  218: {
    pokemon: 'Slugma',
    primaryColor: '#E69881',
    secondaryColor: '#F4CC94',
    verified: true
  },
  220: {
    pokemon: 'Swinub',
    primaryColor: '#B28B73',
    secondaryColor: '#D88C89',
    verified: true
  },
  222: {
    pokemon: 'Corsola',
    primaryColor: '#e697a2',
    secondaryColor: '#ccd5db',
    verified: true
  },
  223: {
    pokemon: 'Remoraid',
    primaryColor: '#AEC8B7',
    secondaryColor: '#709687',
    verified: true
  },
  225: {
    pokemon: 'Delibird',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    verified: false
  },
  226: {
    pokemon: 'Mantine',
    primaryColor: '#425161',
    secondaryColor: '#EDDEE8',
    verified: true
  },
  227: {
    pokemon: 'Skarmory',
    primaryColor: '#D2D9E9',
    secondaryColor: '#923A3B',
    verified: true
  },
  228: {
    pokemon: 'Houndour',
    primaryColor: '#867770',
    secondaryColor: '#B5816C',
    verified: true
  },
  231: {
    pokemon: 'Phanpy',
    primaryColor: '#9CCFCF',
    secondaryColor: '#D06D52',
    verified: true
  },
  234: {
    pokemon: 'Stantler',
    primaryColor: '#BB9780',
    secondaryColor: '#EDDE9A',
    verified: true
  },
  235: {
    pokemon: 'Smeargle',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    verified: true
  },
  236: {
    pokemon: 'Tyrogue',
    primaryColor: '#D7C1D0',
    secondaryColor: '#926E4A',
    verified: true
  },
  241: {
    pokemon: 'Miltank',
    primaryColor: '#F1BABE',
    secondaryColor: '#EEE0B7',
    verified: true
  },
  243: {
    pokemon: 'Raikou',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    verified: false
  },
  244: {
    pokemon: 'Entei',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    verified: false
  },
  245: {
    pokemon: 'Suicune',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    verified: false
  },
  246: {
    pokemon: 'Larvitar',
    primaryColor: '#B5BF96',
    secondaryColor: '#595755',
    verified: true
  },
  249: {
    pokemon: 'Lugia',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    verified: false
  },
  250: {
    pokemon: 'Ho-oh',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    verified: false
  },
  251: {
    pokemon: 'Celebi',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    verified: false
  }
}

function getLevel(cpMultiplier) {
  let level

  if (cpMultiplier < 0.734) {
    // compute polynomial approximation obtained by regression
    level = 58.35178527 * cpMultiplier * cpMultiplier - 2.838007664 * cpMultiplier + 0.8539209906
  } else {
    // compute linear approximation obtained by regression
    level = 171.0112688 * cpMultiplier - 95.20425243
  }

  // round to nearest .5 value and return
  return Math.round((level) * 2) / 2.0
}

function getMaxCostsForPowerup(
  trainerLevel,
  powerups,
  pokemonsCPMultiplier,
  transform,
  upgradesPerLevel = 2,
  allowedLevelsAbovePlayer = 2
) {
  // The Maximum Level this pokemon can reach
  const maxLevelOfPokemon = trainerLevel + allowedLevelsAbovePlayer
  // The current level of the pokemon based on its `cp_multiplier` property
  const currentLevelOfPokemon = utils.getLevelFromCpMultiplier(pokemonsCPMultiplier)

  // Number of Upgrades to Maximum
  // So if your current level was 3 and if it could max at 20,
  // that would be 17 Upgrades * 2 Upl - 1 = 33 Upgrades
  const numberOfUpgrades = ((maxLevelOfPokemon - currentLevelOfPokemon) * upgradesPerLevel) - 1

  // initialize our total cost for candies or dust
  let total = transform(levelCpMultiplier[currentLevelOfPokemon], powerups)
  let currentPowerUps = powerups + 1

  // The difference between any two adjacent levels +-
  const levelSize = 0.5

  times(numberOfUpgrades, (i) => {
    // The number that represents the current upgrade
    const upgradeNumber = i + 1
    // The level the pokemon will become if upgraded
    // currentLevelOfPokemon could be 3, if the index is 0, upgradeNumber is 1
    // so we get (1 * .5) + 3
    const level = (upgradeNumber * levelSize) + currentLevelOfPokemon
    // the number of power ups previously applied and the number we are applying
    // so if you used 4, the first index is 0 so 4
    currentPowerUps += i

    // a candy or dust cost calculated from
    // a levels cp multiplier and the current number of power ups used
    total += transform(levelCpMultiplier[level], currentPowerUps)
  })

  return total
}

const utils = {
  levelCpMultiplier,

  getLevelFromCpMultiplier(multiplier) {
    return getLevel(multiplier)
  },

  getMaxCp(attack, defense, stamina) {
    return utils.getMaxCpForTrainerLevel(attack, defense, stamina, 40)
  },

  getMaxCpForTrainerLevel(attack, defense, stamina, trainerLevel) {
    const maxPokemonLevel = Math.min(40.5, trainerLevel + 1.5)
    const maxCpMultiplier = levelCpMultiplier[maxPokemonLevel]
    const ADS = attack * Math.pow(defense, 0.5) * Math.pow(stamina, 0.5)
    const total = ADS * Math.pow(maxCpMultiplier, 2.0)
    return Math.floor(total / 10)
  },

  getStardustCostsForPowerup(cpMultiplier, powerups) {
    const level = utils.getLevelFromCpMultiplier(cpMultiplier)

    if (level <= 2.5 && powerups <= 5) {
      return 200
    }
    if (level <= 4.5 && powerups <= 9) {
      return 400
    }
    if (level <= 6.5 && powerups <= 13) {
      return 600
    }
    if (level <= 8.5 && powerups <= 17) {
      return 800
    }
    if (level <= 10.5 && powerups <= 21) {
      return 1000
    }
    if (level <= 12.5 && powerups <= 25) {
      return 1300
    }
    if (level <= 14.5 && powerups <= 29) {
      return 1600
    }
    if (level <= 16.5 && powerups <= 33) {
      return 1900
    }
    if (level <= 18.5 && powerups <= 37) {
      return 2200
    }
    if (level <= 20.5 && powerups <= 41) {
      return 2500
    }
    if (level <= 22.5 && powerups <= 45) {
      return 3000
    }
    if (level <= 24.5 && powerups <= 49) {
      return 3500
    }
    if (level <= 26.5 && powerups <= 53) {
      return 4000
    }
    if (level <= 28.5 && powerups <= 57) {
      return 4500
    }
    if (level <= 30.5 && powerups <= 61) {
      return 5000
    }
    if (level <= 32.5 && powerups <= 65) {
      return 6000
    }
    if (level <= 34.5 && powerups <= 69) {
      return 7000
    }
    if (level <= 36.5 && powerups <= 73) {
      return 8000
    }
    if (level <= 38.5 && powerups <= 77) {
      return 9000
    }
    return 10000
  },

  getCandyCostsForPowerup(cpMultiplier, powerups) {
    const level = utils.getLevelFromCpMultiplier(cpMultiplier)

    if (level <= 10.5 && powerups <= 21) {
      return 1
    }
    if (level <= 20.5 && powerups <= 41) {
      return 2
    }
    if (level <= 25.5 && powerups <= 51) {
      return 3
    }
    if (level <= 30.5 && powerups <= 61) {
      return 4
    }
    if (level <= 32.5 && powerups <= 65) {
      return 6
    }
    if (level <= 34.5 && powerups <= 69) {
      return 8
    }
    if (level <= 36.5 && powerups <= 73) {
      return 10
    }
    if (level <= 38.5 && powerups <= 77) {
      return 12
    }
    return 15
  },

  getCpAfterPowerup(cp, cpMultiplier) {
    const level = utils.getLevelFromCpMultiplier(cpMultiplier)

    if (level <= 10) {
      return (cp * 0.009426125469) / Math.pow(cpMultiplier, 2)
    }
    if (level <= 20) {
      return (cp * 0.008919025675) / Math.pow(cpMultiplier, 2)
    }
    if (level <= 30) {
      return (cp * 0.008924905903) / Math.pow(cpMultiplier, 2)
    }
    return (cp * 0.00445946079) / Math.pow(cpMultiplier, 2)
  },

  getMaxCandyCostsForPowerup(
    trainerLevel,
    powerups,
    pokemonsCPMultiplier,
    upgradesPerLevel,
    allowedLevelsAbovePlayer
  ) {
    return getMaxCostsForPowerup(
      trainerLevel,
      powerups,
      pokemonsCPMultiplier,
      utils.getCandyCostsForPowerup,
      upgradesPerLevel,
      allowedLevelsAbovePlayer
    )
  },

  getMaxStardustCostsForPowerup(
    trainerLevel,
    powerups,
    pokemonsCPMultiplier,
    upgradesPerLevel,
    allowedLevelsAbovePlayer
  ) {
    return getMaxCostsForPowerup(
      trainerLevel,
      powerups,
      pokemonsCPMultiplier,
      utils.getStardustCostsForPowerup,
      upgradesPerLevel,
      allowedLevelsAbovePlayer
  )
  },

  getADS(pokemon) {
    return pokemon.individual_attack + pokemon.individual_defense + pokemon.individual_stamina
  },

  getIVs(pokemon) {
    return Math.round(utils.getADS(pokemon) / 45 * 10000) / 100
  },

  getEvolvesCount(evolveCost, candy, count) {
    let evolves = Math.floor((candy + Math.floor(candy / evolveCost)) / evolveCost)

    if ((evolves === Infinity || isNaN(evolves))) {
      evolves = 0
    }

    return (evolves > count ? count : evolves)
  },

  getType(type) {
    return TYPES[type]
  },

  getName(id) {
    return NAMES[id] || 'Unknown'
  },

  getCostume(costume) {
    return COSTUMES[costume]
  },

  getGender(gender) {
    return GENDERS[gender]
  },

  getForm(form) {
    return FORMS[form]
  },

  getCandyColor(id) {
    return candyColors[id]
  },

  capitalize,
}

const Immutable = {
  array: {
    set(array, index, item) {
      if (item === null) {
        return [
          ...array.slice(0, index),
          ...array.slice(index + 1)
        ]
      }

      return [
        ...array.slice(0, index),
        item,
        ...array.slice(index + 1)
      ]
    }
  }
}

const COLUMN_SORT_AS_NUM = {
  nickname: false,
  iv: true,
  cp: true,
  favorite: true,
  pokemon_id: true,
  name: false,
  count: true,
  candy: true,
  evolves: true,
  level: true,
}

const Organize = {
  sortAsString(array, sortBy, sortDir) {
    array.sort((a, b) => {
      if (sortDir === 'ASC') {
        if (a[sortBy] > b[sortBy]) return 1
        if (a[sortBy] < b[sortBy]) return -1
      } else {
        if (a[sortBy] > b[sortBy]) return -1
        if (a[sortBy] < b[sortBy]) return 1
      }

      return 0
    })
  },

  sortAsNumber(array, sortBy, sortDir) {
    array.sort((a, b) => {
      if (sortDir === 'ASC') return a[sortBy] - b[sortBy]

      return b[sortBy] - a[sortBy]
    })
  },

  getSortedPokemon(specie, currentSortState, sortBy, sortDir) {
    const pokemon = specie.pokemon.slice()

    if (!sortBy && !sortDir) {
      // Hacky way of retrieving the current sort state of species.jsx
      if (currentSortState) {
        sortBy = currentSortState.sortBy
        sortDir = currentSortState.sortDir
      } else {
        sortBy = defaultSettings.defaultSpecieSortBy
        sortDir = defaultSettings.defaultSpecieSortDirection
      }
    }

    if (COLUMN_SORT_AS_NUM[sortBy]) {
      Organize.sortAsNumber(pokemon, sortBy, sortDir)
    } else {
      Organize.sortAsString(pokemon, sortBy, sortDir)
    }

    return pokemon
  },

  getSortedSpecies(monsters, sortBy, sortDir) {
    const species = monsters.species.slice()

    if (COLUMN_SORT_AS_NUM[sortBy]) {
      Organize.sortAsNumber(species, sortBy, sortDir)
    } else {
      Organize.sortAsString(species, sortBy, sortDir)
    }

    return species
  },
}

export { utils as default, Immutable, Organize, COLUMN_SORT_AS_NUM }
