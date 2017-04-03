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
