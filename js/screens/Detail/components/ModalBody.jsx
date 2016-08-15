import React from 'react'

// TODO find and use some JSON data
// Examples
// https://gist.github.com/shri/9754992
// https://gist.github.com/ihciah/71b0bf44322431bd34dea4ff193267e5

// <div id='pokemon_basic_move_info'>
// <div className='pokemon-moves-info-title'>Basic Attacks</div>
// <div className='pokemon-move-item'>
// <span className='pokemon-move-title'>vine whip</span>
// <span className='pokemon-move-type grass'>grass</span>
// <span className='pokemon-move-damage'>10</span>
// </div>
// <div className='pokemon-move-item'>
// <span className='pokemon-move-title'>tackle</span>
// <span className='pokemon-move-type normal'>normal</span>
// <span className='pokemon-move-damage'>12</span>
// </div>
// </div>

// TODO Potential special movesets for each pokemon
// Special Attacks
// <div id='pokemon_special_move_info'>
// <div className='pokemon-moves-info-title'>Special Attacks</div>
// <div className='pokemon-move-item'>
// <div className='pokemon-move-title'>sludge bomb</div>
// <div className='pokemon-move-cost'>
// <div className='pokemon-move-cost-item' style='width:67px;'></div><div className='pokemon-move-cost-item' style='width:67px;'></div>
// </div>
// <span className='pokemon-move-type poison'>poison</span>
// <span className='pokemon-move-damage'>50</span>
// </div>
// <div className='pokemon-move-item'>
// <div className='pokemon-move-title'>seed bomb</div>
// <div className='pokemon-move-cost'>
// <div className='pokemon-move-cost-item' style='width:41.5px;'></div><div className='pokemon-move-cost-item' style='width:41.5px;'></div><div className='pokemon-move-cost-item' style='width:41.5px;'></div>
// </div>
// <span className='pokemon-move-type grass'>grass</span>
// <span className='pokemon-move-damage'>30</span>
// </div>
// <div className='pokemon-move-item'>
// <div className='pokemon-move-title'>power whip</div>
// <div className='pokemon-move-cost'>
// <div className='pokemon-move-cost-item' style='width:142px;'></div>
// </div>
// <span className='pokemon-move-type grass'>grass</span>
// <span className='pokemon-move-damage'>60</span>
// </div>
// </div>

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
	
	let move2CastTime = []
	
	for(var i = 0; i < (100/charged_move.energyCost); i++)
	{
		move2CastTime.push(<div key={i} className='pokemon-move-cost-item' style={{width:`${charged_move.energyCost}px`}}/>)
	}
		  
    return (<div className='modal-body'>
      <div id='pokemon_sprite_wrapper'>
        <div style={{textAlign: 'center', fontSize: '11px'}}>
          <span>CP</span>
          <span style={{fontSize: '20px'}}>{cp}</span>
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
        <div id='pokemon_info'>
          <div className='pokemon-info-item'>
            <div className='pokemon-info-item-text'>{`${type}`}</div>
            <div className='pokemon-info-item-title'>Type</div>
          </div>
          <div className='pokemon-info-item'>
            <div className='pokemon-info-item-text'>
              {`${weight} `}
              <span className='pokemon-stat-unit'>kg</span>
            </div>
            <div className='pokemon-info-item-title'>Weight</div>
          </div>
          <div className='pokemon-info-item'>
            <div className='pokemon-info-item-text'>
              {`${height} `}
              <span className='pokemon-stat-unit'>m</span>
            </div>
            <div className='pokemon-info-item-title'>Height</div>
          </div>
        </div>
        <div id='pokemon_info'>
          <div className='pokemon-combat-info-item'>
            <div className='pokemon-combat-info-item-text'>{`${attack}`}</div>
            <div className='pokemon-info-item-title'>Attack</div>
          </div>
          <div className='pokemon-combat-info-item'>
            <div className='pokemon-combat-info-item-text'>{`${defense}`}</div>
            <div className='pokemon-info-item-title'>Defense</div>
          </div>
        </div>
        <div id='pokemon_upgrade_info'>
          <div className='pokemon-upgrade-info-item'>
            <div className='pokemon-upgrade-info-item-text cp-upgrade'>{cpPerUpgrade}</div>
            <div className='pokemon-upgrade-info-item-title'>CP Per Upgrade</div>
          </div>
          <div className='pokemon-upgrade-info-item'>
            <div className='pokemon-upgrade-info-item-text'>{candies}</div>
            <div className='pokemon-upgrade-info-item-title'>{`${name} CANDIES`}</div>
          </div>
        </div>
		<div id='pokemon_basic_move_info'>
			<div className='pokemon-moves-info-title'>Basic Attacks</div>
			<div className='pokemon-move-item'>
				<span className='pokemon-move-title'>{`${fast_move.name}`}</span>
				<span className={'pokemon-move-type ' + fast_move.type}>{`${fast_move.type}`}</span>
				<span className='pokemon-move-damage'>{`${fast_move.power}`}</span>
			</div>
		</div>
		
		<div id='pokemon_special_move_info'>
			<div className='pokemon-moves-info-title'>Special Attacks</div>
			<div className='pokemon-move-item'>
				<div className='pokemon-move-title'>{`${charged_move.name}`}</div>
				<div className='pokemon-move-cost'>
					{move2CastTime}
				</div>
				<span className={'pokemon-move-type ' + charged_move.type}>{`${charged_move.type}`}</span>
				<span className='pokemon-move-damage'>{`${charged_move.power}`}</span>
			</div>
		</div>
      </div>
    </div>)
  },
  _handleCry () {
    this.refs.cry.play()
  }
})

export default ModalBody
