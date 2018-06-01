import CryptoJS from 'crypto-js';
import Tx from 'ethereumjs-tx';
import {
    ERROR,
    CONTRACT_UPDATE,
    LOADING,
    NETWORK_CHANGE,
    BURNED
} from '../constants/action-types';
import {getAPIURL} from '../utils';
import Contract from '../constants/contract';
import {getBalance} from './eth';
import {validate} from './api';

// const getContractJSON = () => new Promise((resolve) => {
//     web3.eth.net.getId((err, netId) => {
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
//

export const getContract = () => async (dispatch, getState) => {

    try {
        const {network} = getState().contract;
        const web3 = getState().web3.instance;
        const gasPrice = await web3.eth.getGasPrice();
        const deployedContract = new web3.eth.Contract(Contract[network].ABI, Contract[network].ADDRESS, {
            gasPrice,
            gas: 47000000,
        });

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
                address: Contract[network].ADDRESS,
                abi: deployedContract.abi,
                supply: web3.utils.toDecimal(results[0]),
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

export const changeNetwork = (network) => (dispatch) => {
    dispatch({
        type: NETWORK_CHANGE,
        payload: network
    });
};

const validateTransactionWeb3 = () => async (dispatch, getState) => new Promise((resolve, reject) => {
    const {transactionHash} = getState().events;
    const {coinbase} = getState().user;
    const web3 = getState().web3.instance;
    try {
        const res = web3.eth.getTransaction(transactionHash);
        resolve(res.from === coinbase);
    } catch (e) {
        reject(e);
    }
});

export const burn = (amount) => async (dispatch, getState) => {
    const {address} = getState().contract;
    const {coinbase, stellar, privateKey} = getState().user;
    const web3 = getState().web3.instance;

    dispatch({type: LOADING, payload: getState().content.data.statusWaitingConfirmation});

    try {

        const payload = await (await fetch(`${getAPIURL()}/stellar`, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                pk: stellar.pk,
                eth: coinbase,
                value: amount,
            })
        })).json();

        if (payload.error) {
            console.log('payload error', payload.error);
            dispatch({type: ERROR, payload});
            dispatch({type: LOADING, payload: getState().content.data.errorCreatingStellarAccount});
            setTimeout(dispatch, 4000, {type: LOADING, payload: null});
            return;
        }

        const bufferPrivateKey = new Buffer(privateKey, 'hex');

        console.log(address);

        const functionName = 'burn';
        const types = ['uint256'];
        const args = [amount];
        const fullName = functionName + '(' + types.join() + ')';
        const signature = CryptoJS.SHA3(fullName, {outputLength: 256}).toString(CryptoJS.enc.Hex).slice(0, 8);
        const dataHex = signature + web3.eth.abi.encodeParameters(types, args);
        const data = '0x' + dataHex;
        // console.log(99, dataHex)

        const rawTx = {
            nonce: web3.utils.toHex(await web3.eth.getTransactionCount(coinbase)),
            gasPrice: '0x09184e72a000',
            gasLimit: '0x2710',
            // gasPrice: web3.utils.toHex(await this.props.web3.eth.getGasPrice()),
            // gasLimit: web3.utils.toHex(10721975),
            value: '0x00',
            to: address,
            from: coinbase,
            data
        };

        console.log(rawTx);

        const tx = new Tx(rawTx);
        tx.sign(bufferPrivateKey);
        const serializedTx = '0x' + tx.serialize().toString('hex');

        const result = await web3.eth.sendSignedTransaction(serializedTx)
            .on('transactionHash', (hash) => {
                console.log(hash);
                dispatch({type: LOADING, payload: `Transaction Hash: ${hash}\n\nWaiting for network confirmations`});
            })
            .on('receipt', (receipt) => {
                // console.log(101, receipt);
                dispatch({type: LOADING, payload: `Transaction Receipt: ${receipt}`});
                return receipt;
            })
            .on('confirmation', (confirmationNumber, receipt) => {
                console.log(102, confirmationNumber, receipt);
                dispatch({type: LOADING, payload: `Network confirmations: ${confirmationNumber || 0}`});
            })
            .on('error', (e) => {
                console.log('error', e);
                return new Error(getState().content.data.errorBurningTokens);
            });

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
        console.log(e);
        dispatch({type: ERROR, payload: e});
    }
};
