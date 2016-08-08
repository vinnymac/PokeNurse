var fs = require('fs')

// var gameMaster = require('./GAME_MASTER_v0_1.json')
var gameMaster2 = require('./GAME_MASTER_v0_2.json')
var cpStats = require('./cpStats.json')
var evolveCost = require('./evolveCost.json')
var familiesById = require('./familiesById.json')

function writeBaseStats () {
  var baseStats = {}

  gameMaster2.forEach(item => {
    let pokemonIndex = item.PkMn - 1
    let pokemonId = String(item.PkMn)
    let types = [item.Type1.toLowerCase()]
    if (item.Type2 !== "NONE") types.push(item.Type2.toLowerCase())

    baseStats[pokemonId] = {
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
      quickMoves: item.QuickMoves.split(", "),
      cinematicMoves: item.CinematicMoves.split(", ")
    }
  })

  fs.writeFileSync('./baseStats.json', JSON.stringify(baseStats, null, 2))
}

writeBaseStats()
