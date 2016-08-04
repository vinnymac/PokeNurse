var fs = require('fs')

var gameMaster = require('./GAME_MASTER_v0_1.json')

function writeBaseStats () {
  var baseStats = {}

  gameMaster.Items.forEach(item => {
    if (item.TemplateId && item.Pokemon && item.Pokemon.Stats) {
      let pokemonId = String(parseInt(item.Pokemon.UniqueId.match(/\d+/g)[0]))
      let types = []
      if (item.Pokemon.Type1) types.push(item.Pokemon.Type1.split('POKEMON_TYPE_')[1].toLowerCase())
      if (item.Pokemon.Type2) types.push(item.Pokemon.Type2.split('POKEMON_TYPE_')[1].toLowerCase())

      baseStats[pokemonId] = {
        types: types
      }

      Object.assign(baseStats[pokemonId], item.Pokemon.Stats)
    }
  })

  fs.writeFileSync('./baseStats.json', JSON.stringify(baseStats, null, 2))
}

writeBaseStats()
