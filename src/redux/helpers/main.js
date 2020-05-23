/* Helper for connect() */

/* Available Actions(dispatches) */
import {
  updateClient
} from '../actions/index.js';

// Map all three REDUX state types to props
export const mapAllStatesToProps = state => {
  return {
    state_client  : state.clientReducer
   }
}

// Map all available actions (Dispatches) to props
export const mapAllDispatchesToProps = (dispatch) => {
  return {
    dispatch_updateClient  : client  => dispatch(updateClient(client))
  }
}
