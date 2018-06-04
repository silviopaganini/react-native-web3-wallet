import Tx from 'ethereumjs-tx';
import {
    ERROR,
    CONTRACT_UPDATE,
    LOADING,
    STELLAR,
    NETWORK_CHANGE,
    BURNED
} from '../constants/action-types';
import {getAPIURL, createStellarKeyPair} from '../utils';
import Contract from '../constants/contract';
import {getBalance} from './eth';
import {validate} from './api';

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

const waitConfirmations = (web3, dispatch, serializedTx, error) => new Promise(async (resolve, reject) => {
    let transactionHash;
    await web3.eth.sendSignedTransaction(serializedTx)
        .on('transactionHash', (hash) => {
            transactionHash = hash;
            dispatch({type: LOADING, payload: `Transaction Hash: ${hash}\n\nWaiting for network confirmations`});
        })
        .on('receipt', (receipt) => {
            dispatch({type: LOADING, payload: `Transaction Receipt: ${receipt.transactionHash}`});
            return receipt;
        })
        .on('confirmation', function (confirmationNumber) {
            if (confirmationNumber >= 7) {
                this.off('confirmation');
                resolve(transactionHash);
                return;
            }

            const num = !isNaN(confirmationNumber) ? confirmationNumber : 0;
            // console.log(102, confirmationNumber, receipt);
            dispatch({type: LOADING, payload: `Network confirmations: ${num}`});
        })
        .on('error', (e) => {
            console.log('error', e);
            reject(error);
        });
});

export const burn = (amount) => async (dispatch, getState) => {
    const {address, instance} = getState().contract;
    const {coinbase, privateKey} = getState().user;
    const web3 = getState().web3.instance;

    dispatch({type: LOADING, payload: getState().content.data.statusWaitingConfirmation});

    try {

        const stellar = await createStellarKeyPair();
        dispatch({type: STELLAR, payload: stellar});

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
        const data = instance.methods.burn(amount).encodeABI();

        const rawTx = {
            nonce: web3.utils.toHex(await web3.eth.getTransactionCount(coinbase)),
            gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
            gasLimit: web3.utils.toHex(10721975),
            value: web3.utils.toHex(0),
            to: address,
            from: coinbase,
            data
        };

        const tx = new Tx(rawTx);
        tx.sign(bufferPrivateKey);
        const serializedTx = '0x' + tx.serialize().toString('hex');

        const transactionHash = await waitConfirmations(web3, dispatch, serializedTx, getState().content.data.errorBurningTokens);
        if (!transactionHash) {
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
            payload: transactionHash
        });

        console.log('burned');

        // console.log(transactionHash);

        // const validateTransaction = await validateTransactionWeb3();
        const validateTransaction = await web3.eth.getTransaction(transactionHash);
        console.log('validateTransaction', validateTransaction);
        if (validateTransaction.from.toLowerCase() !== coinbase.toLowerCase()) {
            console.log('error', validateTransaction);
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
