/* global process */
import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
// import { createLogger } from 'redux-logger';
import rootReducer from '../reducers';
// import DevTools from '../utils/devtools';

export default function (initialState = {}) {
  const middlewares = [
    thunk,
  ];

  // const isProduction = process.env.NODE_ENV === 'production';
  //
  // if(isProduction) {
  //   return createStore(
  //     rootReducer,
  //     initialState,
  //     compose(
  //       applyMiddleware(...middlewares),
  //     )
  //   );
  // }

  // middlewares.push(createLogger());

  return createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(...middlewares),
      // DevTools.instrument()
    )
  );
}
