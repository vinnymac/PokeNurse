import React from 'react'

const QuickMove = React.createClass({
  render () {
    let { 
      move,
      myMove
    } = this.props

    let fastMoveTip = `
      Move Duration: ${move.durationMs}ms <br>
      Damage Window: ${move.damageWindowMs}ms <br>
      No STAB DPS: ${move.dps} <br>
      Energy Gain(EG): ${move.energyGain} <br>
      EGPS: ${move.energyGainPerSecond}
    `

    return (
      <div className={'pokemon-move-item' + (move===myMove?' mine':' notmine')}>
      <div className='pokemon-move-item-text-area' ref='tooltip' data-toggle='tooltip' data-placement='right' data-html='true' title={fastMoveTip}>
        <div className='pokemon-move-title'>{`${move.name}`}</div>
        <div className={'pokemon-move-type ' + move.type}>{`${move.type}`}</div>
      </div>
      <div className='pokemon-move-cost'></div>
      <div className='pokemon-move-damage'>{`${move.power}`}</div>
      </div>
    )
  },
  componentDidMount () {
    $(this.refs.tooltip).tooltip()
  },
  componentDidUpdate () {
    $(this.refs.tooltip).tooltip()
  },
})

export default QuickMove