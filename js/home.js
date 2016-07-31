const ipc = require('electron').ipcRenderer
const pogoUtils = require('pogobuf').Utils
const POGOProtos = require('node-pogo-protos')

const header = document.getElementById('profile-header')
const usernameH = document.getElementById('username-h')
const statusH = document.getElementById('status-h')
const refreshBtn = document.getElementById('refresh-btn')
const transferBtn = document.getElementById('transfer-btn')
const evolveBtn = document.getElementById('evolve-btn')
const pokemonList = document.getElementById('pokemon-list')

var running = false

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
  if (runningCheck()) return

  var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked')

  if (ipc.sendSync('confirmation-dialog', 'transfer').success) {
    running = true
    selectedPokemon.forEach((pokemon, index) => {
      ipc.send('transfer-pokemon', pokemon.value, index * 2000)
    })
    countDown('Transfer', selectedPokemon.length * 2)
  }
})

evolveBtn.addEventListener('click', () => {
  if (runningCheck()) return

  var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked')

  if (ipc.sendSync('confirmation-dialog', 'evolve').success) {
    running = true
    selectedPokemon.forEach((pokemon, index) => {
      ipc.send('evolve-pokemon', pokemon.value, index * 15000)
    })
    countDown('Evolve', selectedPokemon.length * 15)
  }
})

function refreshPokemonList () {
  var pokemons = ipc.sendSync('get-players-pokemons')
  if (pokemons.success) {
    pokemons.pokemon.sort((a, b) => {
      if (a['pokemon_id'] < b['pokemon_id']) return -1
      if (a['pokemon_id'] > b['pokemon_id']) return 1
      if (a['cp'] > b['cp']) return -1
      if (a['cp'] < b['cp']) return 1
      return 0
    })

    pokemonList.innerHTML = ''

    pokemons.pokemon.forEach(poke => {
      var pokemonId = poke['pokemon_id']

      var pokemonName = pogoUtils.getEnumKeyByValue(POGOProtos.Enums.PokemonId, pokemonId)

      var checkBox = '<input type="checkbox" value="' + poke['id'].toString() + '"'
      if (poke['deployed']) checkBox += ' disabled'

      pokemonList.innerHTML += '<tr><td>' + checkBox + '></td><td>' + pokemonId + '</td><td>' + pokemonName + '</td><td>' + poke['cp'] + '</td><td>' + poke['iv'] + '%</td></tr>'
    })
  }
}

function runningCheck () {
  if (running) {
    ipc.send('error-message', 'An action is already running')
    return true
  }
  return false
}

function countDown (method, index) {
  var interval = setInterval(() => {
    statusH.innerHTML = method + ' / ' + index + ' second(s) left'
    index--
    if (index === 0) {
      clearInterval(interval)
      running = false
      statusH.innerHTML = 'Idle'
      ipc.send('error-message', 'Complete!')
    }
  }, 1000)
}
