import { combineReducers } from 'redux';

import user from './user';
import events from './events';
import contract from './contract';
import content from './content';
import web3 from './web3';

export default combineReducers({
  content,
  user,
  events,
  contract,
  web3
});
