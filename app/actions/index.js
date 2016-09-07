import * as statusActions from './status'
import * as authenticateActions from './authenticate'
import * as trainerActions from './trainer'
import * as settingsActions from './settings'

export default {
  ...statusActions,
  ...authenticateActions,
  ...trainerActions,
  ...settingsActions,
}
