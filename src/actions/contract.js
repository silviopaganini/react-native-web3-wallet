import Tx from 'ethereumjs-tx';
import {
    ERROR,
    CONTRACT_UPDATE,
    LOADING,
    STELLAR,
    NETWORK_CHANGE,
    LOCAL_STORAGE,
    BURNED
} from '../constants/action-types';
import {getAPIURL, createStellarKeyPair} from '../utils';
import {watchConfirmations} from '../utils/web3';
import Contract from '../constants/contract';
import {getBalance} from './eth';
import {validate} from './api';
import {NUM_VALIDATIONS} from '../constants/config';

const getContract = () => async (dispatch, getState) => {

    console.log('getContract');

    try {
        const {network} = getState().contract;
        const web3 = getState().web3.instance;
        const {coinbase} = getState().user;

        console.log(network);

        const deployedContract = new web3.eth.Contract(Contract[network].ABI, Contract[network].ADDRESS, {
            gasPrice: await web3.eth.getGasPrice(),
            gas: 6721975,
        });

        console.log(deployedContract);

        const results = await Promise.all([
            deployedContract.methods.totalSupply().call(),
            deployedContract.methods.name().call(),
            deployedContract.methods.symbol().call(),
            deployedContract.methods.owner().call()
        ]);

        console.log(results);

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

        if (coinbase) {
            dispatch(getBalance());
        }

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
    console.log('changeNetwork');
    dispatch({
        type: NETWORK_CHANGE,
        payload: network
    });

    dispatch(getContract());
};

const sendSignedTransaction = (web3, serializedTx, error) => new Promise(async (resolve, reject) => {
    await web3.eth.sendSignedTransaction(serializedTx)
        .on('transactionHash', (hash) => {
            resolve(hash);
        })
        .on('error', (e) => {
            console.log('error', e);
            reject(error);
        });
});



export const burn = (amount) => async (dispatch, getState) => {
    const {address, instance} = getState().contract;
    const {coinbase, privateKey} = getState().user;
    const {localStorage} = getState().content;
    const web3 = getState().web3.instance;

    dispatch({type: LOADING, payload: getState().content.data.statusWaitingConfirmation});

    try {
        const stellar = localStorage.stellar || await createStellarKeyPair();

        dispatch({type: STELLAR, payload: stellar});

        if (!localStorage.started) {
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

            dispatch({
                type: LOCAL_STORAGE,
                payload: {
                    stellar: stellar,
                    ethAddress: coinbase,
                    value: amount,
                    started: true,
                }
            });
        }

        let transactionHash;

        if (!localStorage.transactionHash) {
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

            dispatch({
                type: LOCAL_STORAGE,
                payload: {
                    transactionHash: transactionHash
                }
            });

            dispatch({type: LOADING, payload: 'Transaction accepted!\n\nWaiting for network confirmations\n\nThis step can take a while, it\'s safe to come back later'});

            if (!transactionHash) {
                dispatch({type: LOADING, payload: getState().content.data.errorBurningTokens});
                setTimeout(dispatch, 6000, {type: LOADING, payload: null});
                return;
            }
        } else {
            transactionHash = localStorage.transactionHash;
        }

        if (!localStorage.burned) {
            dispatch({type: LOADING, payload: 'Transaction accepted!\n\nWaiting for network confirmations\n\nThis step can take a while, it\'s safe to come back later'});
            console.log(transactionHash);

            const onValidatedBlock = (blocks) => dispatch({type: LOADING, payload: `Blocks confirmed: ${blocks}\n\nThis step can take a while, it\'s safe to come back later`});

            const validateTransaction = await watchConfirmations({
                web3,
                transactionHash,
                validations: NUM_VALIDATIONS,
                onValidatedBlock
            });

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

            dispatch({
                type: LOCAL_STORAGE,
                payload: {
                    burned: true
                }
            });

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
