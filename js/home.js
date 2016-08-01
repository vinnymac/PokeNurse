const ipc = require('electron').ipcRenderer

const header = document.getElementById('profile-header')
const usernameH = document.getElementById('username-h')
const statusH = document.getElementById('status-h')
const refreshBtn = document.getElementById('refresh-btn')
const transferBtn = document.getElementById('transfer-btn')
const evolveBtn = document.getElementById('evolve-btn')
const pokemonList = document.getElementById('pokemon-list')
const sortLinks = document.querySelectorAll('td[data-sort]')

// Default sort, sort first by pokemon_id then by cp
var currSortings = ['pokemon_id', 'cp']
var pokemons = []
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
  if (pokemons.success) sortPokemonList(currSortings[0], true)
}

function sortPokemonList (sorting, refresh) {
  var lastSort = currSortings[0]
  var isSameSort = sorting === lastSort || '-' + sorting === lastSort
  var newSort = (!refresh && sorting === lastSort ? '-' : '') + sorting

  if (isSameSort) {
    currSortings[0] = newSort
  } else {
    currSortings.pop()
    currSortings.unshift(newSort)
  }

  pokemons.pokemon.sort(sortBy(currSortings))

  pokemonList.innerHTML = ''

  pokemons.pokemon.forEach(poke => {
    var checkBox = '<input type="checkbox" value="' + poke['id'].toString() + '"'
    var favorite = 'glyphicon glyphicon-star-empty'

    if (poke['deployed']) checkBox += ' disabled'
    if (poke['favorite']) favorite = 'glyphicon glyphicon-star favorite-yellow'

    var html = '<tr>'
    html += '<td>' + checkBox + '></td>'
    html += '<td><span class="favorite ' + favorite + '" /></td>'
    html += '<td>' + poke['pokemon_id'] + '</td>'
    html += '<td>' + poke['name'] + '</td>'
    html += '<td class="nickname" data-toggle="modal" data-target="#bulbasaurModal">' + poke['nickname'] + '</td>'
    html += '<td>' + poke['cp'] + '</td>'
    html += '<td>' + poke['iv'] + '% (' + poke['attack'] + '/' + poke['defense'] + '/' + poke['stamina'] + ')</td>'
    html += '</tr>'
    pokemonList.innerHTML += html
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

function sortBy (props) {
  var orders = props.map((prop) => {
    return prop.substr(0, 1) === '-' ? -1 : 1
  })

  props = props.map((prop) => {
    if (prop.substr(0, 1) === '-') prop = prop.substr(1)
    return prop
  })

  function doSort (a, b, i) {
    if (i === props.length) return 0
    return (a[props[i]] < b[props[i]]) ? -1 * orders[i]
           : (a[props[i]] > b[props[i]]) ? 1 * orders[i]
           : doSort(a, b, ++i)
  }

  return function (a, b) {
    return doSort(a, b, 0)
  }
}
