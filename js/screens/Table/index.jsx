import React from 'react'
import $ from 'jquery'
import renderModal from '../Detail'

window.$ = window.jQuery = $
require('bootstrap')
require('datatables.net')(window, $)
require('datatables.net-bs')(window, $)

const ipc = require('electron').ipcRenderer

const Table = React.createClass({

  componentDidMount () {
    document.title = 'PokéNurse • Home'

    const header = document.getElementById('profile-header')
    const usernameH = document.getElementById('username-h')
    const statusH = document.getElementById('status-h')
    const refreshBtn = document.getElementById('refresh-btn')
    const transferBtn = document.getElementById('transfer-btn')
    const evolveBtn = document.getElementById('evolve-btn')
    const detailModal = document.getElementById('detailModal')

    // Default sort, sort first by pokemon_id then by cp
    // var currSortings = ['pokemon_id', 'cp']
    var monsters = []
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

      var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked:not(#checkall)')

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

      var selectedPokemon = document.querySelectorAll('input[type="checkbox"]:checked:not(#checkall)')

      if (ipc.sendSync('confirmation-dialog', 'evolve').success) {
        running = true
        selectedPokemon.forEach((pokemon, index) => {
          ipc.send('evolve-pokemon', pokemon.value, index * randomDelay(25, 30))
        })
        countDown('Evolve', selectedPokemon.length * 27.5)
      }
    })

    function refreshPokemonList () {
      $('#pokemon-data').DataTable().destroy()
      monsters = ipc.sendSync('get-players-pokemons')
      if (monsters.success) dataTables(monsters.species)
    }

    function format (d) {
      // `d` is the original data object for the row
      let html = ''

      html += '<table class="table table-condensed table-hover" id="' + d.pokemon_id + '" style="width:100%;">'
      html += '<thead>'
      html += '<tr>'
      html += '<th width="5%" data-orderable="' + false + '" data-searchable="' + false + '">'
      html += '<input type="checkbox" id="checkall"></th>'
      html += '<th>'
      html += '<span class="glyphicon glyphicon-star favorite-yellow"></span>'
      html += '</th>'
      html += '<th>Name</th>'
      html += '<th>Nickname</th>'
      html += '<th>CP</th>'
      html += '<th>IV (A/D/S)</th>'
      html += '</tr>'
      html += '</thead>'
      html += '<tbody>'
      for (var i = 0; i < d.pokemon.length; i++) {
        var poke = d.pokemon[i]
        html += '<tr>'
        html += '<td>' + poke.td_checkbox + '</td>'
        html += '<td data-order="' + poke.favorite + '">' + poke.td_favorite + '</td>'
        html += '<td data-order="' + poke.name + i + '">' + poke.td_name + '</td>'
        html += '<td data-order="' + poke.nickname + i + '">' + poke.td_nickname + '</td>'
        html += '<td>' + poke.td_cp + '</td>'
        html += '<td>' + poke.td_pokeiv + '</td>'
        html += '</tr>'
      }
      html += '</tbody>'
      html += '</table>'

      return html
    }

    function dataTables (pokemon) {
      var table = $('#pokemon-data').DataTable({
        data: pokemon,
        className: 'details-control',
        bPaginate: false,
        bInfo: false,
        columns: [
          {
            className: 'details-control',
            orderable: false,
            data: null,
            defaultContent: ''
          },
          { data: 'pokemon_id' },
          { data: 'name' },
          { data: 'count' },
          { data: 'candy' },
          { data: 'evolves' }
        ],
        order: [[1, 'asc']]
      })

      // Add event listener for opening and closing details
      $('#pokemon-data tbody').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr')
        var row = table.row(tr)

        if (row.child.isShown()) {
          // This row is already open - close it
          row.child.hide()
          tr.removeClass('shown')
        } else {
          // Open this row
          prepDisplay(row.data())
          row.child(format(row.data()), 'child').show()
          tr.addClass('shown')
          subDataTable(row.data())
        }
      })
    }

    function prepDisplay (d) {
      for (var i = 0; i < d.pokemon.length; i++) {
        var poke = d.pokemon[i]
        var checkBox = '<input type="checkbox" value="' + poke.id.toString() + '"'
        var favorite = 'glyphicon glyphicon-star-empty'
        var pokeiv = poke['iv'] + '% (' + poke['attack'] + '/' + poke['defense'] + '/' + poke['stamina'] + ')'
        var favoriteBool = poke['favorite'] ? 'true' : 'false'

        if (poke.deployed) checkBox += ' disabled'
        if (poke.favorite) favorite = 'glyphicon glyphicon-star favorite-yellow'

        poke.td_checkbox = checkBox + '>'
        poke.td_favorite = '<span class="favorite ' + favorite + '" id="favoriteBtn" data-pokemon-id="' + poke.id + '" data-pokemon-favorited="' + favoriteBool + '" />'
        poke.td_name = poke.name
        poke.td_nickname = '<a class="nickname" data-pokemon-id="' + poke.id + '">' + poke.nickname + '</a>'
        poke.td_cp = poke.cp
        poke.td_pokeiv = pokeiv
      }

      return d.pokemon
    }

    function subDataTable (d) {
      var table = $('#' + d.pokemon_id).DataTable({
        bPaginate: false,
        info: false,
        bFilter: false,
        order: [[4, 'desc']]
      })

      // Check all boxes
      $('#' + d.pokemon_id + ' #checkall').click(function () {
        $(':checkbox', table.rows().nodes()).prop('checked', this.checked)
      })

      document.querySelectorAll('td a.nickname').forEach(el => {
        el.addEventListener('click', showModal.bind(this, $(el).data('pokemon-id')), false)
      })

      addFavoriteButtonEvent()
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
          refreshPokemonList()
        }
      }, 1000)
    }

    function randomDelay (min, max) {
      return Math.round((min + Math.random() * (max - min)) * 1000)
    }

    function addFavoriteButtonEvent () {
      var buttons = document.querySelectorAll('#favoriteBtn')
      buttons.forEach((button) => {
        button.addEventListener('click', (event) => {
          var setToFavorite = button.dataset.pokemonFavorited === 'false'
          ipc.send('favorite-pokemon', button.dataset.pokemonId, setToFavorite)
          updatePokemonById(button.dataset.pokemonId, 'favorite', setToFavorite)
          var newClass = setToFavorite ? 'favorite glyphicon glyphicon-star favorite-yellow' : 'favorite glyphicon glyphicon-star-empty'
          button.className = newClass
          button.dataset.pokemonFavorited = setToFavorite.toString()
        })
      })
    }

    function updatePokemonById (id, key, value) {
      let updated = false

      monsters.species.forEach(species => {
        species.pokemon.forEach(pokemonById => {
          if (pokemonById['id'] === id) {
            pokemonById[key] = value
            updated = true
          }
        })
      })

      return updated
    }

    function findPokemonMapById (id) {
      let pokemonMap = null

      monsters.species.forEach(species => {
        let pokemon = species.pokemon.find(pokemonById => {
          return pokemonById['id'] === id
        })

        if (pokemon) pokemonMap = {species, pokemon}
      })

      return pokemonMap
    }

    function showModal (id, event) {
      let pokemonMap = findPokemonMapById(id)

      if (!pokemonMap) {
        console.error('No Pokemon Found to Display Detail')
        return
      }

      renderModal($(detailModal), pokemonMap)
    }


    ipc.send('table-did-mount')
  },

  render () {
    // <!--<h5 id="pokestorage-h"></h5>
    // <h5 id="bagstorage-h"></h5>-->
    return (
      <div>
        <header className='header' id='profile-header'>
          <p id='username-h'></p>
          <p>Status: <span id='status-h'>Idle</span></p>
        </header>

        <div className='container'>
          <h1>
            <span>Pokémon</span>
            <span className='glyphicon glyphicon-refresh' id='refresh-btn'></span>

            <span className='pull-right'>
              <input type='button' className='btn btn-warning' id='transfer-btn' value='Transfer selected' />
              {" "}
              <input type='button' className='btn btn-danger' id='evolve-btn' value='Evolve selected' />
            </span>
          </h1>

          <table className='table table-condensed table-hover display' id='pokemon-data'>
            <thead>
              <tr>
                <th></th>
                <th width='18%'>Pokédex #</th>
                <th>Name</th>
                <th>Count</th>
                <th>Candy</th>
                <th>Evolves</th>
              </tr>
            </thead>
          </table>
        </div>

        <div className='modal fade' id='detailModal' tabIndex='-1' role='dialog' aria-labelledby='detailModalLabel'></div>
      </div>
    )
  }
})

export default Table
