import Tx from 'ethereumjs-tx';
import {
    ERROR,
    CONTRACT_UPDATE,
    LOADING,
    STELLAR,
    NETWORK_CHANGE,
    BURNED
} from '../constants/action-types';
import {save, load} from '../utils/storage';
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
            gas: 6721975,
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
                supply: results[0],
                name: results[1],
                symbol: results[2]
            }
        });

        dispatch(getBalance());

        return null;
    } catch (e) {
        console.log(e);
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

const sendSignedTransaction = (web3, serializedTx, error) => new Promise(async (resolve, reject) => {
    await web3.eth.sendSignedTransaction(serializedTx)
        .on('transactionHash', (hash) => {
            hash;
            resolve(hash);
        })
        // .on('receipt', (receipt) => {
        //     console.log(receipt);
        //     return receipt.transactionHash;
        // })
        // .on('confirmation', function (confirmationNumber) {
        //     if (confirmationNumber >= 7) {
        //         this.off('confirmation');
        //
        //         return;
        //     }
        //
        //     const num = !isNaN(confirmationNumber) ? confirmationNumber : 0;
        //     // console.log(102, confirmationNumber, receipt);
        //     dispatch({type: LOADING, payload: `Network confirmations: ${num}`});
        // })
        .on('error', (e) => {
            console.log('error', e);
            reject(error);
        });
});

const watchConfirmations = (web3, transactionHash) => new Promise((resolve, reject) => {

    let loop = 0;
    console.log('watchConfirmations');
    let timeout = 0;

    const loopCheckConfirmation = async () => {
        clearTimeout(timeout);
        timeout = 0;
        console.log('loopCheckConfirmation');
        console.log(loop);
        try {
            const receipt = await web3.eth.getTransaction(transactionHash);
            console.log(receipt);
            if (receipt.blockNumber) {
                resolve(receipt);
                return;
            } else {
                loop++;
                timeout = setTimeout(loopCheckConfirmation, 2000);
            }
        } catch (e) {
            console.log(e);
            reject(e);
        }
    };

    loopCheckConfirmation();
});

export const burn = (amount) => async (dispatch, getState) => {
    const {address, instance} = getState().contract;
    const {coinbase, privateKey} = getState().user;
    const web3 = getState().web3.instance;

    const loadedInfo = await load('burning');
    console.log(loadedInfo);

    dispatch({type: LOADING, payload: getState().content.data.statusWaitingConfirmation});

    try {

        let stellar;
        if (loadedInfo.stellar) {
            stellar = loadedInfo.stellar;
        } else {
            stellar = await createStellarKeyPair();
        }

        dispatch({type: STELLAR, payload: stellar});

        if (!loadedInfo.started) {
            console.log(`${getAPIURL()}/stellar`);
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

            console.log(payload);

            if (payload.error) {
                console.log('payload error', payload.error);
                dispatch({type: ERROR, payload});
                dispatch({type: LOADING, payload: getState().content.data.errorCreatingStellarAccount});
                setTimeout(dispatch, 4000, {type: LOADING, payload: null});
                return;
            }

            loadedInfo.stellar = stellar;
            loadedInfo.ethAddress = coinbase;
            loadedInfo.value = amount;
            loadedInfo.started = true;
            save('burning', loadedInfo);
        }

        let transactionHash;

        if (!loadedInfo.transactionHash) {
            const bufferPrivateKey = new Buffer(privateKey, 'hex');
            const data = instance.methods.burn(amount).encodeABI();

            const rawTx = {
                nonce: web3.utils.toHex(await web3.eth.getTransactionCount(coinbase)),
                gasPrice: web3.utils.toHex(await web3.eth.getGasPrice()),
                gasLimit: web3.utils.toHex(4700000),
                value: web3.utils.toHex(0),
                to: address,
                from: coinbase,
                data
            };

            const tx = new Tx(rawTx);
            tx.sign(bufferPrivateKey);
            const serializedTx = '0x' + tx.serialize().toString('hex');

            transactionHash = await sendSignedTransaction(web3, serializedTx, getState().content.data.errorBurningTokens);
            loadedInfo.transactionHash = transactionHash;
            save('burning', loadedInfo);
            dispatch({type: LOADING, payload: `Transaction Hash: ${transactionHash}\n\nWaiting for network confirmations`});

            if (!transactionHash) {
                dispatch({type: LOADING, payload: getState().content.data.errorBurningTokens});
                setTimeout(dispatch, 6000, {type: LOADING, payload: null});
                return;
            }
        } else {
            transactionHash = loadedInfo.transactionHash;
        }

        if (!loadedInfo.burned) {

            dispatch({type: LOADING, payload: `Transaction Hash: ${transactionHash}\n\nWaiting for network confirmations`});
            const validateTransaction = await watchConfirmations(web3, transactionHash);
            if (validateTransaction.from.toLowerCase() !== coinbase.toLowerCase()) {
                console.log('error', validateTransaction);
                dispatch({type: LOADING, payload: getState().content.data.errorEthereumTransactionInvalid});
                setTimeout(dispatch, 4000, {type: LOADING, payload: null});
                return;
            }
            console.log(validateTransaction);

            dispatch({
                type: LOADING,
                payload: getState().content.data.statusErc20Burned,
            });

            loadedInfo.burned = true;
            save('burning', loadedInfo);

            dispatch({
                type: BURNED,
                payload: transactionHash
            });
        }

        console.log('burned');

        // dispatch(getActivity());
        dispatch(validate());

    } catch (e) {
        console.log(e);
        dispatch({type: ERROR, payload: e});
    }
};
