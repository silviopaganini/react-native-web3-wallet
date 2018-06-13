import {Keypair} from '@pigzbe/stellar-utils';
import bip39 from 'bip39';
import hdkey from 'ethereumjs-wallet/hdkey';
import {ENV} from '../constants/config';
import Config from 'react-native-config';

export const getAPIURL = () => {
    switch (ENV) {
        case 'private':
        case 'local':
            return `http://${Config.OFFLINE_HOST || '0.0.0.0'}:5001`;
        case 'mainnet':
        case 'production':
            return 'https://api.pigzbe.com';
        default:
            return 'https://staging.api.pigzbe.com';
    }
};

export const createStellarKeyPair = () => new Promise(async (resolve, reject) => {
    try {
        const keypair = await Keypair.randomAsync();
        const pk = keypair.publicKey();
        const sk = keypair.secret();
        resolve({sk, pk});
    } catch (e) {
        reject(e);
    }
});

export const generateAddressFromSeed = (seed, publicAddress) => {
    const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(seed));
    const wallet_hdpath = 'm/44\'/60\'/0\'/0/';

    let account = {address: ''};
    let counter = 0;
    while (account.address.toLowerCase() !== publicAddress.toLowerCase()) {
        const wallet = hdwallet.derivePath(wallet_hdpath + counter).getWallet();
        const address = '0x' + wallet.getAddress().toString('hex');
        const privateKey = wallet.getPrivateKey().toString('hex');
        account = {address: address, privateKey: privateKey};
        counter++;
    }

    return account;
};
