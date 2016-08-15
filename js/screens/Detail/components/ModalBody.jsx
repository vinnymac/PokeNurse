import React from 'react'

// TODO find and use some JSON data
// Examples
// https://gist.github.com/shri/9754992
// https://gist.github.com/ihciah/71b0bf44322431bd34dea4ff193267e5

// TODO JSON list of evolutions
// Evolutions
// <div id='pokemon_evolve_info'>
// <div className='pokemon-evolve-info-title'>Evolutions</div>
// <a href='/pokemon/ivysaur' className='pokemon-evolve-info-item'>
// <div className='pokemon-sprite ivysaur'></div>
// <div className='pokemon-evolve-info-item-title'>ivysaur</div>
// </a>
// </div>
// </div>

const ModalBody = React.createClass({
  render () {
    let {
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
	  charged_move
    } = this.props
	
	let chargedMoveBars = []
	
	for(var i = 0; i < Math.floor(100/charged_move.energyCost); i++)
	{
		chargedMoveBars.push(<div key={i} className='pokemon-move-cost-item' style={{width:`${charged_move.energyCost}px`}}/>)
	}
	
	let fastMoveTip = `
			Move Duration: ${fast_move.durationMs}ms <br>
			Damage Window: ${fast_move.damageWindowMs}ms <br>
			No STAB DPS: ${fast_move.dps} <br>
			Energy Gain(EG): ${fast_move.energyGain} <br>
			EGPS: ${fast_move.energyGainPerSecond}
        `
		
	let chargedMoveTip = `
			Duration: ${charged_move.durationMs}ms <br>
			Dodge Window: ${charged_move.dodgeWindowMs}ms <br>
			Crit Chance: ${charged_move.crit * 100}%
		`
	
    return (<div className='modal-body'>
      <div id='pokemon_sprite_wrapper'>
        <div className='modal-outline-white pokemon-cp'>
          <span>CP</span>
          <span style={{fontSize: '25px'}}>{cp}</span>
          <span>{` (Max ${maxCP})`}</span>
        </div>
        <div id='pokemon_sprite_sphere_wrapper'>
          <div id='pokemon_sprite_sphere'></div>
          <div id='pokemon_sprite_sphere_dot' style={{WebkitTransform: transform}}></div>
        </div>

        <img
          onClick={this._handleCry}
          title='Listen to Cry'
          alt='Profile Sprite'
          id='pokemon_profile_sprite'
          src={`http://www.pogo-dex.com/images/sprites/${spriteImageName}.png`}
        />
        <audio
          id='pokemonCry'
          ref='cry'
        >
          <source
            src={`./cries/${id}.ogg`}
            type='audio/ogg'
          />
        </audio>
      </div>

      <div id='pokemon_contents'>
        <div id='pokemon_name'>{`${nickname}`}</div>
        <div id='pokemon_health_bar'></div>
        <div id='pokemon_health'>{`HP ${hp}`}</div>
        <div className='pokemon_info'>
          <div className='pokemon-info-item split-3-way'>
            <div className='pokemon-info-item-text'>{`${type.join(' / ')}`}</div>
            <div className='pokemon-info-item-title'>Type</div>
          </div>
          <div className='pokemon-info-item split-3-way'>
            <div className='pokemon-info-item-text'>
              {`${weight} `}
              <span className='pokemon-stat-unit'>kg</span>
            </div>
            <div className='pokemon-info-item-title'>Weight</div>
          </div>
          <div className='pokemon-info-item split-3-way'>
            <div className='pokemon-info-item-text'>
              {`${height} `}
              <span className='pokemon-stat-unit'>m</span>
            </div>
            <div className='pokemon-info-item-title'>Height</div>
          </div>
        </div>
        <div className='pokemon_info'>
          <div className='pokemon-info-item split-2-way'>
            <div className='pokemon-info-item-text combat-stat'>{`${attack}`}</div>
            <div className='pokemon-info-item-title'>Attack</div>
          </div>
          <div className='pokemon-info-item split-2-way'>
            <div className='pokemon-info-item-text combat-stat'>{`${defense}`}</div>
            <div className='pokemon-info-item-title'>Defense</div>
          </div>
        </div>
        <div className='pokemon_info'>
          <div className='pokemon-info-item split-2-way'>
            <div className='pokemon-info-item-text cp-upgrade'>{cpPerUpgrade}</div>
            <div className='pokemon-info-item-title'>CP Per Upgrade</div>
          </div>
          <div className='pokemon-info-item split-2-way'>
            <div className='pokemon-info-item-text candy-count'>{candies}</div>
            <div className='pokemon-info-item-title'>{`${name} Candies`}</div>
          </div>
        </div>
		<div className='pokemon_move_info'>
			<div className='pokemon-move-item'>
				<div className='pokemon-move-item-text-area' ref='tooltip1' data-toggle='tooltip' data-placement='right' data-html='true' title={fastMoveTip}>
					<div className='pokemon-move-title'>{`${fast_move.name}`}</div>
					<div className={'pokemon-move-type ' + fast_move.type}>{`${fast_move.type}`}</div>
				</div>
				<div className='pokemon-move-cost'></div>
				<div className='pokemon-move-damage'>{`${fast_move.power}`}</div>
			</div>
			<div className='pokemon-move-item'>
				<div className='pokemon-move-item-text-area' ref='tooltip2' data-toggle='tooltip' data-placement='right' data-html='true' title={chargedMoveTip}>
					<div className='pokemon-move-title'>{`${charged_move.name}`}</div>
					<div className={'pokemon-move-type ' + charged_move.type}>{`${charged_move.type}`}</div>
				</div>
				<div className='pokemon-move-cost'>
					{chargedMoveBars}
				</div>
				<div className='pokemon-move-damage'>
					{`${charged_move.power}`}
				</div>
			</div>
		</div>
      </div>
    </div>)
  },
  _handleCry () {
    this.refs.cry.play()
  },
  
  componentDidMount () {
    $(this.refs.tooltip1).tooltip()
    $(this.refs.tooltip2).tooltip()
  },

  componentDidUpdate () {
    $(this.refs.tooltip1).tooltip()
    $(this.refs.tooltip2).tooltip()
  },
})

export default ModalBody
