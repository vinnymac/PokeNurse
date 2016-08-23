import React, {
  PropTypes
} from 'react'
import QuickMove from './QuickMove'
import CinematicMove from './CinematicMove'
import Nickname from './Nickname'

const ModalBody = React.createClass({
  propTypes: {
    transform: PropTypes.string.isRequired,
    nickname: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    hp: PropTypes.string.isRequired,
    cp: PropTypes.number.isRequired,
    id: PropTypes.string.isRequired,
    maxCP: PropTypes.number.isRequired,
    type: PropTypes.array.isRequired,
    weight: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    attack: PropTypes.string.isRequired,
    defense: PropTypes.string.isRequired,
    cpPerUpgrade: PropTypes.string.isRequired,
    candies: PropTypes.number.isRequired,
    spriteImageName: PropTypes.string.isRequired,
    fastMove: PropTypes.object.isRequired,
    chargedMove: PropTypes.object.isRequired,
    evolvesTo: PropTypes.node,
    possibleQuickMoves: PropTypes.array,
    possibleCinematicMoves: PropTypes.array,
  },

  render() {
    const {
      transform,
      nickname,
      name,
      hp,
      cp,
      id,
      maxCP,
      type,
      weight,
      height,
      attack,
      defense,
      cpPerUpgrade,
      candies,
      spriteImageName,
      fastMove,
      chargedMove,
      evolvesTo,
      possibleQuickMoves,
      possibleCinematicMoves
    } = this.props

    const quickMoves = []
    for (let i = 0; i < possibleQuickMoves.length; i++) {
      quickMoves.push(<QuickMove key={i} move={possibleQuickMoves[i]} myMove={fastMove} />)
    }

    const cinematicMoves = []
    for (let i = 0; i < possibleCinematicMoves.length; i++) {
      cinematicMoves.push(<CinematicMove key={i} move={possibleCinematicMoves[i]} myMove={chargedMove} />)
    }

    let evolution

    if (evolvesTo) {
      evolution = (<div id="pokemon_evolve_info">
        <div className="pokemon-evolve-info-title">Evolution</div>
        <div className="pokemon-evolve-info-item">
          <div className={`pokemon-sprite ${evolvesTo.toLowerCase()}`} />
          <div className="pokemon-evolve-info-item-title">{evolvesTo.toLowerCase()}</div>
        </div>
      </div>)
    }

    return (<div className="modal-body">
      <div id="pokemon_sprite_wrapper">
        <div style={{ textAlign: 'center', fontSize: '11px' }}>
          <span>CP</span>
          <span style={{ fontSize: '20px' }}>{cp}</span>
          <span>{` (Max ${maxCP})`}</span>
        </div>
        <div id="pokemon_sprite_sphere_wrapper">
          <div id="pokemon_sprite_sphere" />
          <div id="pokemon_sprite_sphere_dot" style={{ WebkitTransform: transform }} />
        </div>

        <img
          onClick={this.handleCry}
          title="Listen to Cry"
          alt="Profile Sprite"
          id="pokemon_profile_sprite"
          src={`./imgs/3d/${spriteImageName}.jpg`}
        />
        <audio
          id="pokemonCry"
          ref={(c) => { this.cry = c }}
        >
          <source
            src={`./cries/${id}.ogg`}
            type="audio/ogg"
          />
        </audio>
      </div>

      <div id="pokemon_contents">
        <Nickname nickname={nickname} id={id} />
        <div id="pokemon_health_bar" />
        <div id="pokemon_health">{`HP ${hp}`}</div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text">{`${type.join(' / ')}`}</div>
            <div className="pokemon-info-item-title">Type</div>
          </div>
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text">
              {`${weight} `}
              <span className="pokemon-stat-unit">kg</span>
            </div>
            <div className="pokemon-info-item-title">Weight</div>
          </div>
          <div className="pokemon-info-item split-3-way">
            <div className="pokemon-info-item-text">
              {`${height} `}
              <span className="pokemon-stat-unit">m</span>
            </div>
            <div className="pokemon-info-item-title">Height</div>
          </div>
        </div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text combat-stat">{`${attack}`}</div>
            <div className="pokemon-info-item-title">Attack</div>
          </div>
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text combat-stat">{`${defense}`}</div>
            <div className="pokemon-info-item-title">Defense</div>
          </div>
        </div>
        <div className="pokemon_info">
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text cp-upgrade">{cpPerUpgrade}</div>
            <div className="pokemon-info-item-title">CP Per Upgrade</div>
          </div>
          <div className="pokemon-info-item split-2-way">
            <div className="pokemon-info-item-text candy-count">{candies}</div>
            <div className="pokemon-info-item-title">{`${name} Candies`}</div>
          </div>
        </div>
        <div className="pokemon_move_info">
          <div className="pokemon-move-item-title">Quick Moves</div>
          {quickMoves}
          <div className="pokemon-move-item-title">Charged Moves</div>
          {cinematicMoves}
        </div>
        {evolution}
      </div>
    </div>)
  },

  handleCry() {
    this.cry.play()
  },

})

export default ModalBody
