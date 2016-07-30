const ipc = require('electron').ipcRenderer
const pogobuf = require('pogobuf')
const POGOProtos = require('node-pogo-protos')

const header = document.getElementById('profile-header')
const usernameH = document.getElementById('username-h')
const refreshBtn = document.getElementById('refresh-btn')
const transferBtn = document.getElementById('transfer-btn')
const evolveBtn = document.getElementById('evolve-btn')
const pokemonList = document.getElementById('pokemon-list')

var playerInfo = ipc.sendSync('get-player-info')
if (playerInfo.success) {
  switch (playerInfo.player_data['team']) {
    case 1:
      header.style.backgroundImage = 'url("./imgs/mystic.jpg")'
      break
    case 2:
      header.style.backgroundImage = 'url("./imgs/valor.jpg")'
      break
    case 3:
      header.style.backgroundImage = 'url("./imgs/instinct.jpg")'
      break
  }

  usernameH.innerHTML = playerInfo.player_data['username']

  refreshPokemonList()
} else {
  ipc.send('error-message', 'Failed in retrieving player info.  Please restart.')
}

refreshBtn.addEventListener('click', () => {
  refreshPokemonList()
})

transferBtn.addEventListener('click', () => {
  // IMPLEMENT
  ipc.send('transfer-pokemon', [])
})

evolveBtn.addEventListener('click', () => {
  // IMPLEMENT
  ipc.send('evolve-pokemon', [])
})

function refreshPokemonList () {
  var pokemons = ipc.sendSync('get-players-pokemons')
  if (pokemons.success) {
    pokemonList.innerHTML = ''

    pokemons.pokemon.forEach(poke => {
      if (poke['pokemon_id'] === 0) return
      var pokemonName = pogobuf.Utils.getEnumKeyByValue(POGOProtos.Enums.PokemonId, poke['pokemon_id'])
      pokemonList.innerHTML += '<tr><td>' + poke['pokemon_id'] + '</td><td>' + pokemonName + '</td><td>' + poke['cp'] + '</td></tr>'
    })
  }
}
