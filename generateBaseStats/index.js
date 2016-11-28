const fs = require('fs')

// var gameMaster = require('./GAME_MASTER_v0_1.json')
// const gameMaster2 = require('./GAME_MASTER_v0_2.json')
const gameMaster3 = require('./GAME_MASTER_v0_3.json')
const cpStats = require('./cpStats.json')
const evolveCost = require('./evolveCost.json')
const familiesById = require('./familiesById.json')
const basicAttacks = require('./basicAttacks.json')
const chargedAttacks = require('./chargedAttacks.json')

function writeBaseStats() {
  const baseStats = {
    pokemon: {},
    moves: {}
  }

  gameMaster3.forEach(item => {
    const pokemonIndex = item.PkMn - 1
    const pokemonId = String(item.PkMn)
    const types = [item.Type1.toLowerCase()]
    if (item.Type2 !== 'NONE') types.push(item.Type2.toLowerCase())

    const quickMoves = []
    const quickMovesSource = item.QuickMoves.split(', ')

    quickMovesSource.forEach(moveSource => {
      basicAttacks.forEach(basicAttack => {
        if (basicAttack.name === moveSource) {
          quickMoves.push(basicAttack.id)
        }
      })
    })

    const chargedMoves = []
    const chargedMovesSource = item.CinematicMoves.split(', ')

    chargedMovesSource.forEach(moveSource => {
      chargedAttacks.forEach(chargedAttack => {
        if (chargedAttack.name === moveSource) {
          chargedMoves.push(chargedAttack.id)
        } else if (moveSource.indexOf('Scissor') > -1 && chargedAttack.name.indexOf('Scissor') > -1) {
          chargedMoves.push(chargedAttack.id)
        }
      })
    })

    baseStats.pokemon[pokemonId] = {
      name: item.Identifier,
      types,
      cpPerUpgrade: cpStats.cpPerUpgrade[pokemonIndex],
      evolveCost: evolveCost.data[pokemonIndex].cost,
      familyId: familiesById.data[pokemonIndex].family,
      // TODO camel case these
      BaseStamina: item.BaseStamina,
      BaseAttack: item.BaseAttack,
      BaseDefense: item.BaseDefense,
      evolvesTo: item.EvolvesTo,
      evolvesFrom: item.EvolvesFrom,
      quickMoves,
      cinematicMoves: chargedMoves
    }
  })

  basicAttacks.forEach(item => {
    baseStats.moves[item.id] = {
      name: item.name,
      type: item.type,
      power: item.pw,
      staminaLoss: item.staminalossscalarUnsureIfMatters,
      durationMs: item.durationMs,
      damageWindowMs: item.damageWindowMs,
      energyGain: item.nrg,
      energyGainPerSecond: item.nrgps,
      dps: item.dps
    }
  })

  chargedAttacks.forEach(item => {
    baseStats.moves[item.id] = {
      name: item.name,
      type: item.type,
      power: item.pw,
      staminaLoss: item.staminalossscalar,
      durationMs: item.durationMs,
      dodgeWindowMs: item.dodgeWindowMs,
      crit: item.crit,
      energyCost: item.nrgCost
    }
  })

  fs.writeFileSync('./baseStats.json', JSON.stringify(baseStats, null, 2))
}

writeBaseStats()
