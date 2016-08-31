import * as statusActions from './status'
import * as authenticateActions from './authenticate'
import * as trainerActions from './trainer'

export default {
  ...statusActions,
  ...authenticateActions,
  ...trainerActions
}
