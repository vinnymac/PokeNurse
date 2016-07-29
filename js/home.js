const ipc = require('electron').ipcRenderer

const header = document.getElementById('header')
const usernameH = document.getElementById('username-h')
const refreshBtn = document.getElementById('refresh-btn')
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

function refreshPokemonList () {
  var pokemons = ipc.sendSync('get-players-pokemons')
  if (pokemons.success) {
    pokemonList.innerHTML = ''

    pokemons.pokemon.forEach(poke => {
      pokemonList.innerHTML += '<tr><td>' + poke['pokemon_id'] + '</td><td>' + 'pokemon name' + '</td><td>' + poke['cp'] + '</td></tr>'
    })
  }
}
