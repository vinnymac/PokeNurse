var fs = require('fs')

var gameMaster = require('./GAME_MASTER_v0_1.json')
var cpStats = require('./cpStats.json')
var evolveCost = require('./evolveCost.json')
var familiesById = require('./familiesById.json')

function writeBaseStats () {
  var baseStats = {}

  gameMaster.Items.forEach(item => {
    if (item.TemplateId && item.Pokemon && item.Pokemon.Stats) {
      let pokemonIndex = parseInt(item.Pokemon.UniqueId.match(/\d+/g)[0]) - 1
      let pokemonId = String(pokemonIndex + 1)
      let types = []
      if (item.Pokemon.Type1) types.push(item.Pokemon.Type1.split('POKEMON_TYPE_')[1].toLowerCase())
      if (item.Pokemon.Type2) types.push(item.Pokemon.Type2.split('POKEMON_TYPE_')[1].toLowerCase())

      baseStats[pokemonId] = {
        types: types,
        cpPerUpgrade: cpStats.cpPerUpgrade[pokemonIndex],
        evolveCost: evolveCost.data[pokemonIndex].cost,
        familyId: familiesById.data[pokemonIndex].family
      }

      Object.assign(baseStats[pokemonId], item.Pokemon.Stats)
    }
  })

  fs.writeFileSync('./generateBaseStats/baseStats.json', JSON.stringify(baseStats, null, 2))
}

writeBaseStats()
