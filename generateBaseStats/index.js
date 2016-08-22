var fs = require('fs')

// var gameMaster = require('./GAME_MASTER_v0_1.json')
var gameMaster2 = require('./GAME_MASTER_v0_2.json')
var cpStats = require('./cpStats.json')
var evolveCost = require('./evolveCost.json')
var familiesById = require('./familiesById.json')
var basicAttacks = require('./basicAttacks.json')
var chargedAttacks = require('./chargedAttacks.json')

function writeBaseStats () {
  var baseStats = {
    pokemon:{},
    moves:{}
  }

  gameMaster2.forEach(item => {
    let pokemonIndex = item.PkMn - 1
    let pokemonId = String(item.PkMn)
    let types = [item.Type1.toLowerCase()]
    if (item.Type2 !== 'NONE') types.push(item.Type2.toLowerCase())

    let quickMoves = [];
    let quickMovesSource = item.QuickMoves.split(', ')

    for(var i=0; i < quickMovesSource.length; i++)
    {
      basicAttacks.forEach(item=>{
        if(item.name===quickMovesSource[i])
        {
          quickMoves.push(item.id)
        }
      })
    }

    let chargedMoves = [];
    let chargedMovesSource = item.CinematicMoves.split(', ')

    for(var i=0; i < chargedMovesSource.length; i++)
    {
      chargedAttacks.forEach(item=>{
        if(item.name===chargedMovesSource[i])
        {
          chargedMoves.push(item.id)
        }
      })
    }

    baseStats.pokemon[pokemonId] = {
      name: item.Identifier,
      types: types,
      cpPerUpgrade: cpStats.cpPerUpgrade[pokemonIndex],
      evolveCost: evolveCost.data[pokemonIndex].cost,
      familyId: familiesById.data[pokemonIndex].family,
      // TODO camel case these
      BaseStamina: item.BaseStamina,
      BaseAttack: item.BaseAttack,
      BaseDefense: item.BaseDefense,
      evolvesTo: item.EvolvesTo,
      evolvesFrom: item.EvolvesFrom,
      quickMoves: quickMoves,
      cinematicMoves: chargedMoves
    }
  })

  basicAttacks.forEach(item=>{
    baseStats.moves[item.id] = {
      name : item.name,
      type : item.type,
      power : item.pw,
      staminaLoss : item.staminalossscalarUnsureIfMatters,
      durationMs : item.durationMs,
      damageWindowMs : item.damageWindowMs,
      energyGain : item.nrg,
      energyGainPerSecond : item.nrgps,
      dps : item.dps
    }
  })

  chargedAttacks.forEach(item=>{
    baseStats.moves[item.id] = {
      name : item.name,
      type : item.type,
      power : item.pw,
      staminaLoss : item.staminalossscalar,
      durationMs : item.durationMs,
      dodgeWindowMs : item.dodgeWindowMs,
      crit : item.crit,
      energyCost : item.nrgCost
    }
  })

  fs.writeFileSync('./baseStats.json', JSON.stringify(baseStats, null, 2))
}

writeBaseStats()
