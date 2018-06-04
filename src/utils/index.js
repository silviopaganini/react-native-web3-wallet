import Stellar from '@pigzbe/react-native-stellar-sdk';
import bip39 from 'bip39';
import hdkey from 'ethereumjs-wallet/hdkey';

export const getAPIURL = () => {
    const env = 'staging';
    switch (env) {
        case 'local':
            return 'http://localhost:5001';
        case 'production':
            return 'https://api.pigzbe.com';
        default:
            return 'https://staging.api.pigzbe.com';
    }
};

export const createStellarKeyPair = () => new Promise(async (resolve, reject) => {
    try {
        const keypair = await Stellar.Keypair.randomAsync();
        const pk = keypair.publicKey();
        const sk = keypair.secret();
        resolve({sk, pk});
    } catch (e) {
        reject(e);
    }
});

export const getKeyPair = secretKey => Stellar.Keypair.fromSecret(secretKey);

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
