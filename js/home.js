const ipc         = require('electron').ipcRenderer

const header      = document.getElementById('profile-header')
const usernameH   = document.getElementById('username-h')
const statusH     = document.getElementById('status-h')
const refreshBtn  = document.getElementById('refresh-btn')
const transferBtn = document.getElementById('transfer-btn')
const evolveBtn   = document.getElementById('evolve-btn')
const pokemonList = document.getElementById('pokemon-list')
const sortLinks   = document.querySelectorAll('td[data-sort]')

var currSorting   = 'pokemon_id'
var pokemons      = []
var running       = false

var playerInfo    = ipc.sendSync('get-player-info')
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

refreshBtn.addEventListener('click', refreshPokemonList)

transferBtn.addEventListener('click', () => {
  if (runningCheck()) return

  var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked')

  if (ipc.sendSync('confirmation-dialog', 'transfer').success) {
    running = true
    selectedPokemon.forEach((pokemon, index) => {
      ipc.send('transfer-pokemon', pokemon.value, index * randomDelay(2, 3))
    })
    countDown('Transfer', selectedPokemon.length * 2.5)
  }
})

evolveBtn.addEventListener('click', () => {
  if (runningCheck()) return

  var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked')

  if (ipc.sendSync('confirmation-dialog', 'evolve').success) {
    running = true
    selectedPokemon.forEach((pokemon, index) => {
      ipc.send('evolve-pokemon', pokemon.value, index * randomDelay(25, 30))
    })
    countDown('Evolve', selectedPokemon.length * 27.5)
  }
})

for (var i = 0; i < sortLinks.length; i++) {
  sortLinks[i].addEventListener('click', function (e) {
    sortPokemonList(this.dataset.sort)
  })
}

function refreshPokemonList () {
  pokemons = ipc.sendSync('get-players-pokemons')
  if (pokemons.success) sortPokemonList(currSorting, true)
}

function sortPokemonList (sorting, refresh) {
  currSorting = (!refresh && sorting == currSorting ? '-' : '') + sorting
  pokemons.pokemon.sort(sortBy(currSorting))

  pokemonList.innerHTML = ''

  pokemons.pokemon.forEach(poke => {
    var checkBox = '<input type="checkbox" value="' + poke['id'].toString() + '"'

    if (poke['deployed']) checkBox += ' disabled'

    pokemonList.innerHTML += '<tr><td>' + checkBox + '></td><td>' + poke['pokemon_id'] + '</td><td>' + poke['name'] + '</td><td>' + poke['cp'] + '</td><td>' + poke['iv'] + '% (' + poke['attack'] + '/' + poke['defense'] + '/' + poke['stamina'] + ')</td></tr>'
  })
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
    if (index <= 0) {
      clearInterval(interval)
      running = false
      statusH.innerHTML = 'Idle'
      ipc.send('error-message', 'Complete!')
    }
  }, 1000)
}

function randomDelay (min, max) {
  return Math.round((min + Math.random() * (max - min)) * 1000)
}

function sortBy (prop) {
  var order = prop.substr(0, 1) == '-' ? -1 : 1;

  if (prop.substr(0, 1) === '-') prop = prop.substr(1)

  return function (a, b) {
    return  (a[prop] < b[prop]) ? -1 * order :
            (a[prop] > b[prop]) ? 1 * order :
            (a['cp'] < b['cp']) ? 1 :
            (a['cp'] > b['cp']) ? -1 :
            0;
  }
}
