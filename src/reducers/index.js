import { combineReducers } from 'redux';

import user from './user';
import events from './events';
import contract from './contract';

export default combineReducers({
  content: (state = {}) => state,
  user,
  events,
  contract
});
