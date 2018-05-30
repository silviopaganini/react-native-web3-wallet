import { Record } from 'immutable';
import {
  // BUY_PLAYER,
  USER_LOGIN,
  USER_LOGOUT,
  USER_BALANCE,
  STELLAR,
} from '../constants/action-types';

const initialState = new Record({
  coinbase: '',
  balance: null,
  supply: null,
  loggedIn: false,
  stellar: null,
})();

export default (state = initialState, action) => {
  switch (action.type) {
  case USER_LOGOUT:
    return state
      .set('loggedIn', false)
      .set('coinbase', '');

  case STELLAR:
    return state
      .set('stellar', Object.assign({}, action.payload));

  case USER_BALANCE:
    return state
      .set('balance', action.payload);

  case USER_LOGIN:
    return state
      .set('loggedIn', true)
      .set('coinbase', action.payload);

  default:
    return state;
  }
};
