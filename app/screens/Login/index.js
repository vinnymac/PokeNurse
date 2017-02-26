import React, {
  PropTypes
} from 'react'
import { connect } from 'react-redux'

import LoginForm from './components/LoginFormContainer'

class Login extends React.Component {
  static propTypes = {
    credentials: PropTypes.object,
  }

  render() {
    return (
      <div>
        <header className="header">
          <h1>PokéNurse</h1>
          <h4>A tool for Pokémon Go to aid in transferring and evolving Pokémon</h4>
        </header>

        <LoginForm credentials={this.props.credentials} />
      </div>
    )
  }
}

export default connect(state => ({
  credentials: state.authenticate.credentials,
}))(Login)
