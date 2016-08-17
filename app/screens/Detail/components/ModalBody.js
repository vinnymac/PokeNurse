import React, {
  PropTypes
} from 'react'
import $ from 'jquery'

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
    fast_move: PropTypes.object.isRequired,
    charged_move: PropTypes.object.isRequired,
    evolvesTo: PropTypes.string
  },

  componentDidMount() {
    this.setupTooltips()
  },

  componentDidUpdate() {
    this.setupTooltips()
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
      fast_move,
      charged_move,
      evolvesTo
    } = this.props

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

    let chargedMoveBars = []

    for (let i = 0; i < Math.floor(100 / charged_move.energyCost); i++) {
      const move = (<div
        key={i}
        className="pokemon-move-cost-item"
        style={{ width: `${charged_move.energyCost}px` }}
      />)

      chargedMoveBars.push(move)
    }

    let fastMoveTip = `
        Move Duration: ${fast_move.durationMs}ms <br>
        Damage Window: ${fast_move.damageWindowMs}ms <br>
        DPS: ${fast_move.dps} <br>
        Energy Gain(EG): ${fast_move.energyGain} <br>
        EGPS: ${fast_move.energyGainPerSecond}
          `

    let chargedMoveTip = `
        Duration: ${charged_move.durationMs}ms <br>
        Dodge Window: ${charged_move.dodgeWindowMs}ms <br>
        Crit Chance: ${charged_move.crit * 100}%
      `
    const bgColor1 = this.getBackgroundColor(type[0])
    const bgColor2 = this.getBackgroundColor(type[1])

    let modalBackground = {
      background: `linear-gradient(to bottom, ${bgColor1} 0%, ${bgColor2} 100%)`
    }

    return (<div className="modal-body" style={modalBackground}>
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
        <div id="pokemon_name">{`${nickname}`}</div>
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
          <div className="pokemon-move-item">
            <div
              className="pokemon-move-item-text-area"
              ref={(c) => { this.tooltip1 = c }}
              data-toggle="tooltip"
              data-placement="right"
              data-html="true"
              title={fastMoveTip}
            >
              <div className="pokemon-move-title">{`${fast_move.name}`}</div>
              <div className={`pokemon-move-type ${fast_move.type}`}>{`${fast_move.type}`}</div>
            </div>
            <div className="pokemon-move-cost" />
            <div className="pokemon-move-damage">{`${fast_move.power}`}</div>
          </div>
          <div className="pokemon-move-item">
            <div
              className="pokemon-move-item-text-area"
              ref={(c) => { this.tooltip2 = c }}
              data-toggle="tooltip"
              data-placement="right"
              data-html="true"
              title={chargedMoveTip}
            >
              <div className="pokemon-move-title">{`${charged_move.name}`}</div>
              <div className={`pokemon-move-type ${charged_move.type}`}>
                {`${charged_move.type}`}
              </div>
            </div>
            <div className="pokemon-move-cost">
              {chargedMoveBars}
            </div>
            <div className="pokemon-move-damage">
              {`${charged_move.power}`}
            </div>
          </div>
        </div>
        {evolution}
      </div>
    </div>)
  },

  setupTooltips() {
    $(this.tooltip1).tooltip()
    $(this.tooltip2).tooltip()
  },

  handleCry() {
    this.cry.play()
  },

  // this should probably be moved out as a utility method
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

export default ModalBody
