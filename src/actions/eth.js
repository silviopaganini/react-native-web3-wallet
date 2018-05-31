/* eslint-disable no-console */

import Web3 from '../constants/web3';
import {
    USER_BALANCE,
    USER_LOGIN,
    // ACTIVITY,
    ERROR,
    LOADING
} from '../constants/action-types';
import {getContract} from './contract';

let timeout;

export const getBalance = () => async (dispatch, getState) => {
    try {

        const contract = getState().contract.instance;
        const balance = await contract.methods.balanceOf(getState().user.get('coinbase')).call();
        dispatch({type: USER_BALANCE, payload: Web3.utils.toDecimal(balance)});

    } catch (e) {
        dispatch({type: ERROR, payload: e});
    }

};

// export const getActivity = () => async (dispatch, getState) => {
//     try {
//         const contract = getState().contract.instance;
//         contract.allEvents({from: getState().user.get('coinbase'), fromBlock: 0, toBlock: 'latest'}, (err, events) => {
//             if (err) {
//                 dispatch({type: 'error', payload: err});
//                 return;
//             }
//             dispatch({type: ACTIVITY, payload: events});
//         });
//     } catch (e) {
//         dispatch({type: ERROR, payload: e});
//     }
// };

export const userLogin = (privateKey) => async (dispatch) => {
    clearTimeout(timeout);
    timeout = 0;

    dispatch({type: LOADING, payload: null});

    try {
        const account = Web3.eth.accounts.privateKeyToAccount(privateKey);
        const coinbase = account.address;

        dispatch({
            type: USER_LOGIN,
            payload: coinbase,
        });

        dispatch(getContract(coinbase));

    } catch (e) {
        dispatch({type: ERROR, payload: e});
    }
};

// export const getWallet = () => async (dispatch, getState) => {
//     clearTimeout(timeout);
//     timeout = 0;
//     try {
//         const wallet = await Web3.eth.getAccounts();
//         if (wallet.length === 0) {
//             dispatch({type: LOADING, payload: getState().content.data.errorMetamaskLocked});
//             timeout = setTimeout(dispatch, 1500, getWallet());
//             return;
//         }
//
//         dispatch({type: LOADING, payload: null});
//
//         dispatch({
//             type: USER_LOGIN,
//             payload: wallet[0],
//         });
//
//         dispatch(getBalance());
//     // dispatch(intervalCheckNetwork());
//     } catch (e) {
//         dispatch({type: ERROR, payload: e});
//     }
// };

// export const intervalCheckNetwork = () => (dispatch, getState) => {
//   clearTimeout(timeout);
//   timeout = 0;
//
//   const { coinbase } = getState().user;
//   if (coinbase !== '') {
//     Web3.eth.getAccounts((err, accounts) => {
//       if (err) {
//         return;
//       }
//
//       if(!accounts[0]) {
//         dispatch({type: LOADING, payload: getState().content.data.errorMetamaskLocked});
//         clearTimeout(timeout);
//         timeout = setTimeout(dispatch, 1500, getWallet());
//         return;
//       }
//
//       if (accounts[0].toUpperCase() !== coinbase.toUpperCase()) {
//         window.location.reload();
//       }
//     });
//     timeout = setTimeout(dispatch, 1500, intervalCheckNetwork());
//   }
// };
