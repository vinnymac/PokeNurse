let levelCpMultiplier = {
  '1': 0.094,
  '1.5': 0.135137432,
  '2': 0.16639787,
  '2.5': 0.192650919,
  '3': 0.21573247,
  '3.5': 0.236572661,
  '4': 0.25572005,
  '4.5': 0.273530381,
  '5': 0.29024988,
  '5.5': 0.306057377,
  '6': 0.3210876,
  '6.5': 0.335445036,
  '7': 0.34921268,
  '7.5': 0.362457751,
  '8': 0.37523559,
  '8.5': 0.387592406,
  '9': 0.39956728,
  '9.5': 0.411193551,
  '10': 0.42250001,
  '10.5': 0.432926419,
  '11': 0.44310755,
  '11.5': 0.453059958,
  '12': 0.46279839,
  '12.5': 0.472336083,
  '13': 0.48168495,
  '13.5': 0.4908558,
  '14': 0.49985844,
  '14.5': 0.508701765,
  '15': 0.51739395,
  '15.5': 0.525942511,
  '16': 0.53435433,
  '16.5': 0.542635767,
  '17': 0.55079269,
  '17.5': 0.558830576,
  '18': 0.56675452,
  '18.5': 0.574569153,
  '19': 0.58227891,
  '19.5': 0.589887917,
  '20': 0.59740001,
  '20.5': 0.604818814,
  '21': 0.61215729,
  '21.5': 0.619399365,
  '22': 0.62656713,
  '22.5': 0.633644533,
  '23': 0.64065295,
  '23.5': 0.647576426,
  '24': 0.65443563,
  '24.5': 0.661214806,
  '25': 0.667934,
  '25.5': 0.674577537,
  '26': 0.68116492,
  '26.5': 0.687680648,
  '27': 0.69414365,
  '27.5': 0.700538673,
  '28': 0.70688421,
  '28.5': 0.713164996,
  '29': 0.71939909,
  '29.5': 0.725571552,
  '30': 0.7317,
  '30.5': 0.734741009,
  '31': 0.73776948,
  '31.5': 0.740785574,
  '32': 0.74378943,
  '32.5': 0.746781211,
  '33': 0.74976104,
  '33.5': 0.752729087,
  '34': 0.75568551,
  '34.5': 0.758630378,
  '35': 0.76156384,
  '35.5': 0.764486065,
  '36': 0.76739717,
  '36.5': 0.770297266,
  '37': 0.7731865,
  '37.5': 0.776064962,
  '38': 0.77893275,
  '38.5': 0.781790055,
  '39': 0.78463697,
  '39.5': 0.787473578,
  '40': 0.79030001,
  '40.5': 0.7931164
}

function getLevel (cpMultiplier) {
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

function getMaxCostsForPowerup (trainerLevel, powerups, pokemonsCPMultiplier, transform, upgradesPerLevel = 2, allowedLevelsAbovePlayer = 2) {
  let maxLevelOfPokemon = trainerLevel + allowedLevelsAbovePlayer
  let currentLevelOfPokemon = utils.getLevelFromCpMultiplier(pokemonsCPMultiplier)

  let numberOfUpgrades = (maxLevelOfPokemon - currentLevelOfPokemon) * 2

  let total = 0
  let upgrades = 0

  // just making an iterable array out of the numberOfUpgrades value
  Array.apply(null, Array(numberOfUpgrades)).forEach((v, index) => {
    let level = ((index + 1) * .5) + currentLevelOfPokemon
    let multiplier = levelCpMultiplier[level]
    total += transform(multiplier, powerups)
  })

  return total
}

let utils = {
  levelCpMultiplier: levelCpMultiplier,
  getLevelFromCpMultiplier: (multiplier) => {
    return getLevel(multiplier)
  },
  getMaxCp: (attack, defense, stamina) => {
    return utils.getMaxCpForTrainerLevel(attack, defense, stamina, 40)
  },
  getMaxCpForTrainerLevel: (attack, defense, stamina, trainerLevel) => {
    let maxPokemonLevel = Math.min(40.5, trainerLevel + 1.5)
    let maxCpMultiplier = levelCpMultiplier[maxPokemonLevel]

    return attack * Math.pow(defense, 0.5) * Math.pow(stamina, 0.5) * Math.pow(maxCpMultiplier, 2.0) / 10.0
  },
  getStardustCostsForPowerup: (cpMultiplier, powerups) => {
    let level = utils.getLevelFromCpMultiplier(cpMultiplier)

    if (level <= 3 && powerups <= 4) {
      return 200
    }
    if (level <= 4 && powerups <= 8) {
      return 400
    }
    if (level <= 7 && powerups <= 12) {
      return 600
    }
    if (level <= 8 && powerups <= 16) {
      return 800
    }
    if (level <= 11 && powerups <= 20) {
      return 1000
    }
    if (level <= 13 && powerups <= 24) {
      return 1300
    }
    if (level <= 15 && powerups <= 28) {
      return 1600
    }
    if (level <= 17 && powerups <= 32) {
      return 1900
    }
    if (level <= 19 && powerups <= 36) {
      return 2200
    }
    if (level <= 21 && powerups <= 40) {
      return 2500
    }
    if (level <= 23 && powerups <= 44) {
      return 3000
    }
    if (level <= 25 && powerups <= 48) {
      return 3500
    }
    if (level <= 27 && powerups <= 52) {
      return 4000
    }
    if (level <= 29 && powerups <= 56) {
      return 4500
    }
    if (level <= 31 && powerups <= 60) {
      return 5000
    }
    if (level <= 33 && powerups <= 64) {
      return 6000
    }
    if (level <= 35 && powerups <= 68) {
      return 7000
    }
    if (level <= 37 && powerups <= 72) {
      return 8000
    }
    if (level <= 39 && powerups <= 76) {
      return 9000
    }
    return 10000
  },
  getCandyCostsForPowerup: (cpMultiplier, powerups) => {
    let level = utils.getLevelFromCpMultiplier(cpMultiplier)

    if (level <= 13 && powerups <= 20) {
      return 1
    }
    if (level <= 21 && powerups <= 36) {
      return 2
    }
    if (level <= 31 && powerups <= 60) {
      return 3
    }
    return 4
  },
  getCpAfterPowerup: (cp, cpMultiplier) => {
    let level = utils.getLevelFromCpMultiplier(cpMultiplier)

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
  getMaxCandyCostsForPowerup: (trainerLevel, powerups, pokemonsCPMultiplier, upgradesPerLevel, allowedLevelsAbovePlayer) => {
    return getMaxCostsForPowerup(trainerLevel, powerups, pokemonsCPMultiplier, utils.getCandyCostsForPowerup, upgradesPerLevel, allowedLevelsAbovePlayer)
  },
  getMaxStardustCostsForPowerup: (trainerLevel, powerups, pokemonsCPMultiplier, upgradesPerLevel, allowedLevelsAbovePlayer) => {
    return getMaxCostsForPowerup(trainerLevel, powerups, pokemonsCPMultiplier, utils.getStardustCostsForPowerup, upgradesPerLevel, allowedLevelsAbovePlayer)
  }
}

export default utils
