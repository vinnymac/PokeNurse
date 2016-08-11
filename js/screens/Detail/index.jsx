import React from 'react'
import ReactDOM from 'react-dom'

import ModalBody from './components/ModalBody'

import baseStats from '../../../baseStats'

const ModalDialog = React.createClass({
  componentDidMount () {
    this.props.detailModal.modal('show')
  },

  render () {
    return (
      <div className='modal-dialog' role='document'>
        <div className='modal-content'>
          <div className='modal-header'>
            <button type='button' className='close' data-dismiss='modal' aria-label='Close'><span aria-hidden='true'>&times;</span></button>
            <h4 className='modal-title' id='detailModalLabel'>{this.props.name}</h4>
          </div>
          <ModalBody {...this.props} />
          <div className='modal-footer'>
            <button type='button' className='btn btn-default' data-dismiss='modal'>Close</button>
          </div>
        </div>
      </div>
    )
  }
})

export default ($detailModal, pokemon, species) => {
  // Calculate CP Progress dot position
  let minDeg = 0
  let maxDeg = 180
  let degree = Math.max(Math.min((pokemon.cp / pokemon.max_cp) * maxDeg, maxDeg), minDeg)

  let transform = `rotate(${degree}deg) translate(-193px)`

  let stats = baseStats[pokemon['pokemon_id']]

  let baseAttack = stats.BaseAttack
  let baseDefense = stats.BaseDefense

  // TODO Need additional information to calculate these
  let hp = `${pokemon.current_stamina} / ${pokemon.stamina_max}`
  let attack = `${baseAttack + pokemon.attack}`
  let defense = `${baseDefense + pokemon.defense}`
  let type = stats.types.join(' / ')

  let cppu = stats.cpPerUpgrade
  let cpPerUpgrade = cppu ? `+${cppu} CP (+/-)` : 'Unknown'

  let height = `${pokemon.height.toFixed(2)}`
  let weight = `${pokemon.weight.toFixed(2)}`

  let candies = species.candy
  let name = species.name
  let nickname = pokemon.nickname

  let spriteImageName = name.toLowerCase()
  if (spriteImageName.indexOf('nidoran') > -1) {
    let spriteParts = spriteImageName.split(' ')
    spriteImageName = `${spriteParts[0]}-${(spriteParts[1][0] === '♂') ? 'm' : 'f'}`
  }

  let modalDialog = <ModalDialog
    name={name}
    nickname={nickname}
    transform={transform}
    attack={attack}
    defense={defense}
    id={species.pokemon_id}
    hp={hp}
    candies={candies}
    cp={pokemon.cp}
    maxCP={pokemon.max_cp}
    cpPerUpgrade={cpPerUpgrade}
    spriteImageName={spriteImageName}
    type={type}
    weight={weight}
    height={height}
    detailModal={$detailModal}
  />

  $detailModal.on('hidden.bs.modal', () => {
    ReactDOM.unmountComponentAtNode($detailModal.get(0))
  })

  ReactDOM.render(modalDialog, $detailModal.get(0))
}
