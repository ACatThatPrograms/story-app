import {
  UPDATE_CLIENT
} from '../constants/index.js';

// UDPATE_CLIENT:
// Used to updated local client state, general UX/UI such as Loaders
export const updateClient = ( payload ) => {
  return { type: UPDATE_CLIENT, payload }
}
