import React, {
  PropTypes
} from 'react'
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'

import store from '../../store'

import ModalBody from './components/ModalBody'

const ModalDialog = React.createClass({
  displayName: 'ModalDialog',

  propTypes: {
    $modal: PropTypes.object.isRequired,
  },

  componentDidMount() {
    this.props.$modal.modal('show')
  },

  render() {
    return (
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header modal-outline-white">
            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
            <h4 className="modal-title" id="settingsModalLabel">
              Settings
            </h4>
          </div>
          <ModalBody {...this.props} />
          <div className="modal-footer">
            <div type="button" className="btn btn-default" data-dismiss="modal" >Close</div>
          </div>
        </div>
      </div>
    )
  },
})

export default ($modal) => {
  const modalDialog = (<ModalDialog
    $modal={$modal}
  />)

  $modal.on('hidden.bs.modal', () => {
    ReactDOM.unmountComponentAtNode($modal.get(0))
  })

  ReactDOM.render(<Provider store={store}>{modalDialog}</Provider>, $modal.get(0))
}
