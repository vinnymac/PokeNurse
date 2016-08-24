import React, {
  PropTypes
} from 'react'
import ReactDOM from 'react-dom'

import ModalBody from './components/ModalBody'

import baseStats from '../../../baseStats'

const ModalDialog = React.createClass({
  displayName: 'ModalDialog',

  propTypes: {
    name: PropTypes.string.isRequired,
    detailModal: PropTypes.object.isRequired,
    type: PropTypes.array
  },

  componentDidMount() {
    this.props.detailModal.modal('show')
  },

  render() {
    let modalBackground = {
      background: `linear-gradient(to bottom,
      ${this.getBackgroundColor(this.props.type[0])} 0%,
      ${this.getBackgroundColor(this.props.type[1])} 100%)`
    }

    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content" style={modalBackground}>
          <div className="modal-header modal-outline-white">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 className="modal-title" id="detailModalLabel">{this.props.name}</h4>
          </div>
          <ModalBody {...this.props} />
        </div>
      </div>
    )
  },

  getBackgroundColor(type) {
    switch (type) {
      case 'normal':
        return '#A8A878'
      case 'fire':
        return '#F08030'
      case 'water':
        return '#6890F0'
      case 'grass':
        return '#78C850'
      case 'electric':
        return '#f8d030'
      case 'ice':
        return '#98d8d8'
      case 'ground':
        return '#e0c068'
      case 'flying':
        return '#a890f0'
      case 'poison':
        return '#a040a0'
      case 'fighting':
        return '#c03028'
      case 'psychic':
        return '#f85888'
      case 'dark':
        return '#705848'
      case 'rock':
        return '#b8a038'
      case 'bug':
        return '#a8b820'
      case 'ghost':
        return '#705898'
      case 'steel':
        return '#b8b8d0'
      case 'dragon':
        return '#7038f8'
      case 'fairy':
        return '#ffaec9'
      default:
        return '#FFFFFF'
    }
  },
})

export default ($detailModal, pokemon, species, monsterUpdater) => {
  // Calculate CP Progress dot position
  const minDeg = 0
  const maxDeg = 180
  const degree = Math.max(Math.min((pokemon.cp / pokemon.max_cp) * maxDeg, maxDeg), minDeg)

  let transform = `rotate(${degree}deg) translate(-193px)`

  const stats = baseStats.pokemon[pokemon.pokemon_id]

  const baseAttack = stats.BaseAttack
  const baseDefense = stats.BaseDefense

  // TODO Need additional information to calculate these
  let hp = `${pokemon.current_stamina} / ${pokemon.stamina_max}`
  let attack = `${baseAttack + pokemon.attack}`
  let defense = `${baseDefense + pokemon.defense}`
  let type = stats.types

  const cppu = stats.cpPerUpgrade
  let cpPerUpgrade = cppu ? `+${cppu} CP (+/-)` : 'Unknown'

  let height = `${pokemon.height.toFixed(2)}`
  let weight = `${pokemon.weight.toFixed(2)}`

  let candies = species.candy
  let name = species.name
  let nickname = pokemon.nickname
  let spriteImageName = name.toLowerCase()

  let moveOne = baseStats.moves[pokemon.move_1]
  let moveTwo = baseStats.moves[pokemon.move_2]

  if (spriteImageName.indexOf('nidoran') > -1) {
    const spriteParts = spriteImageName.split(' ')
    spriteImageName = `${spriteParts[0]}-${(spriteParts[1][0] === '♂') ? 'm' : 'f'}`
  }

  let possibleQuickMoves = stats.quickMoves.map((quickMove) =>
    baseStats.moves[quickMove]
  )

  let possibleCinematicMoves = stats.cinematicMoves.map((cinematicMove) =>
    baseStats.moves[cinematicMove]
  )

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
    spriteImageName={spriteImageName}
    type={type}
    weight={weight}
    height={height}
    detailModal={$detailModal}
    fastMove={moveOne}
    chargedMove={moveTwo}
    evolvesTo={stats.evolvesTo}
    possibleQuickMoves={possibleQuickMoves}
    possibleCinematicMoves={possibleCinematicMoves}
    monsterUpdater={monsterUpdater}
  />)

  $detailModal.on('hidden.bs.modal', () => {
    ReactDOM.unmountComponentAtNode($detailModal.get(0))
  })

  ReactDOM.render(modalDialog, $detailModal.get(0))
}
