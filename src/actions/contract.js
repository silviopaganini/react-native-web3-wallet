/*global require */
import {
    ERROR,
    CONTRACT_UPDATE,
    LOADING,
    BURNED
} from '../constants/action-types';
import {getAPIURL} from '../utils';
import * as Contract from '../constants/contract';
import Web3 from '../constants/web3';
import {getBalance} from './eth';
import {validate} from './api';

// const getContractJSON = () => new Promise((resolve) => {
//     Web3.eth.net.getId((err, netId) => {
//       if(err) {
//         reject(err);
//         return;
//       }
//
//       switch(netId.toString()) {
//       case '3':
//         resolve(require('../contracts/ropsten/WolloToken.json'));
//         return;
//
//       default:
//         resolve(require('../contracts/local/WolloToken.json'));
//         return;
//       }
//     });
// });

export const getContract = (from) => async (dispatch) => {

    try {
        const deployedContract = new Web3.eth.Contract(Contract.ABI, Contract.ADDRESS, {from, gasPrice: 20000000000, gas: 6721975});

        const results = await Promise.all([
            deployedContract.methods.totalSupply().call(),
            deployedContract.methods.name().call(),
            deployedContract.methods.symbol().call(),
            deployedContract.methods.owner().call()
        ]);

        dispatch({
            type: CONTRACT_UPDATE,
            payload: {
                owner: results[3],
                instance: deployedContract,
                address: deployedContract.address,
                abi: deployedContract.abi,
                supply: Web3.utils.toDecimal(results[0]),
                name: results[1],
                symbol: results[2]
            }
        });

        dispatch(getBalance());
        // dispatch(getWallet());
        // dispatch(getActivity());

        return null;
    } catch (e) {
        return dispatch({
            type: ERROR,
            payload: e,
        });
    }
};

// export const transfer = (address, amount) => async (dispatch, getState) => {
//     const {instance} = getState().contract;
//
//     dispatch({type: LOADING, payload: getState().content.data.statusWaitingConfirmation});
//
//     try {
//         const transferStatus = await instance.methods.transfer(address, amount, {from: getState().user.coinbase}).send();
//         if (transferStatus) {
//             dispatch(getBalance());
//             dispatch({type: LOADING, payload: 'Transfer Complete'});
//             setTimeout(dispatch, 2000, {type: LOADING, payload: null});
//         }
//
//     } catch (e) {
//         dispatch({type: ERROR, payload: {title: 'Submit Tokens Error', message: 'Check console for more info'}});
//     }
// };

const validateTransactionWeb3 = () => async (dispatch, getState) => new Promise((resolve, reject) => {
    const {transactionHash} = getState().events;
    const {coinbase} = getState().user;
    try {
        const res = Web3.eth.getTransaction(transactionHash);
        resolve(res.from === coinbase);
    } catch (e) {
        reject(e);
    }
});

export const burn = (amount) => async (dispatch, getState) => {
    const {instance} = getState().contract;
    const {coinbase, stellar} = getState().user;

    dispatch({type: LOADING, payload: getState().content.data.statusWaitingConfirmation});

    try {

        const data = await fetch(`${getAPIURL()}/stellar`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                pk: stellar.pk,
                eth: coinbase,
                value: amount,
            })
        });

        const payload = await data.json();
        if (payload.error) {
            dispatch({type: ERROR, payload});
            dispatch({type: LOADING, payload: getState().content.data.errorCreatingStellarAccount});
            setTimeout(dispatch, 4000, {type: LOADING, payload: null});
            return;
        }

        const result = await instance.methods.burn(payload.stellar.value).send();

        if (!result || !result.transactionHash) {
            dispatch({type: LOADING, payload: getState().content.data.errorBurningTokens});
            setTimeout(dispatch, 6000, {type: LOADING, payload: null});
            return;
        }

        dispatch({
            type: LOADING,
            payload: getState().content.data.statusErc20Burned,
        });

        dispatch({
            type: BURNED,
            payload: result.transactionHash
        });

        const validateTransaction = await validateTransactionWeb3();
        if (!validateTransaction) {
            dispatch({type: LOADING, payload: getState().content.data.errorEthereumTransactionInvalid});
            setTimeout(dispatch, 4000, {type: LOADING, payload: null});
            return;
        }

        // dispatch(getActivity());
        dispatch(validate());

    } catch (e) {
        dispatch({type: ERROR, payload: e});
    }
};
