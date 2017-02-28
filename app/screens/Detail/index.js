import React, {
  PropTypes
} from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from '../../store'

import ModalBody from './components/ModalBody'

import utils from '../../utils'

// TODO Move to utils
const TYPE_COLOR_MAP = {
  normal: '#A8A878',
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#f8d030',
  ice: '#98d8d8',
  ground: '#e0c068',
  flying: '#a890f0',
  poison: '#a040a0',
  fighting: '#c03028',
  psychic: '#f85888',
  dark: '#705848',
  rock: '#b8a038',
  bug: '#a8b820',
  ghost: '#705898',
  steel: '#b8b8d0',
  dragon: '#7038f8',
  fairy: '#ffaec9',
}

class ModalDialog extends React.Component {
  static displayName = 'ModalDialog'

  static propTypes = {
    name: PropTypes.string.isRequired,
    detailModal: PropTypes.object.isRequired,
    type: PropTypes.array
  }

  componentDidMount() {
    this.props.detailModal.modal('show')
  }

  render() {
    const modalBackground = {
      background: `linear-gradient(to bottom,
      ${this.getBackgroundColor(this.props.type[0])} 0%,
      ${this.getBackgroundColor(this.props.type[1])} 100%)`
    }

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content" style={modalBackground}>
          <div className="modal-header modal-outline-white">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 className="modal-title" id="detailModalLabel">{this.props.name}</h4>
          </div>
          <ModalBody {...this.props} />
        </div>
      </div>
    )
  }

  getBackgroundColor = type => TYPE_COLOR_MAP[type] || '#FFFFFF'
}

export default ($detailModal, pokemon, species) => {
  // Calculate CP Progress dot position
  const minDeg = 0
  const maxDeg = 180
  const degree = Math.max(Math.min((pokemon.cp / pokemon.max_cp) * maxDeg, maxDeg), minDeg)

  const transform = `rotate(${degree}deg) translate(-193px)`

  const type = pokemon.type

  const possibleQuickMoves = pokemon.quick_moves
  const possibleCinematicMoves = pokemon.cinematic_moves

  const evolutionIds = pokemon.evolution_ids

  const totalCpMultiplier = pokemon.cp_multiplier + pokemon.additional_cp_multiplier
  const cppu = utils.getCpAfterPowerup(pokemon.cp, totalCpMultiplier)

  // TODO Need additional information to calculate these
  const hp = `${pokemon.current_stamina} / ${pokemon.stamina_max}`
  const attack = `${pokemon.base_attack + pokemon.attack}`
  const defense = `${pokemon.base_defense + pokemon.defense}`

  const cpPerUpgrade = cppu ? `+${cppu.toFixed(2)} CP (+/-)` : 'Unknown'

  const height = `${pokemon.height.toFixed(2)}`
  const weight = `${pokemon.weight.toFixed(2)}`

  const candies = species.candy
  const name = species.name
  const nickname = pokemon.nickname

  const moveOne = pokemon.move_1
  const moveTwo = pokemon.move_2

  const modalDialog = (<ModalDialog
    name={name}
    nickname={nickname}
    transform={transform}
    attack={attack}
    defense={defense}
    pokemon={pokemon}
    hp={hp}
    candies={candies}
    id={pokemon.id}
    cp={pokemon.cp}
    maxCP={pokemon.max_cp}
    cpPerUpgrade={cpPerUpgrade}
    type={type}
    weight={weight}
    height={height}
    detailModal={$detailModal}
    fastMove={moveOne}
    chargedMove={moveTwo}
    evolutionIds={evolutionIds}
    possibleQuickMoves={possibleQuickMoves}
    possibleCinematicMoves={possibleCinematicMoves}
  />)

  $detailModal.one('hidden.bs.modal', () => {
    ReactDOM.unmountComponentAtNode($detailModal.get(0))
  })

  ReactDOM.render(<Provider store={store}>{modalDialog}</Provider>, $detailModal.get(0))
}
