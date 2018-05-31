import StellarSdk from 'stellar-sdk';
import bip39 from 'bip39';
import hdkey from 'ethereumjs-wallet/hdkey';

export const getAPIURL = () => {
    const env = 'local';
    switch (env) {
        case 'local':
            return 'http://localhost:5001';
        case 'production':
            return 'https://api.pigzbe.com';
        default:
            return 'https://staging.api.pigzbe.com';
    }
};

export const createStellarKeyPair = () => {
    const pair = StellarSdk.Keypair.random();
    const sk = pair.secret();
    const pk = pair.publicKey();

    return {sk, pk};
};

export const getKeyPair = secretKey => StellarSdk.Keypair.fromSecret(secretKey);

export const generateAddressFromSeed = (seed, publicAddress) => {
    const hdwallet = hdkey.fromMasterSeed(bip39.mnemonicToSeed(seed));
    const wallet_hdpath = 'm/44\'/60\'/0\'/0/';

    let account = {address: ''};
    let counter = 0;
    while (account.address.toLowerCase() !== publicAddress.toLowerCase()) {
        const wallet = hdwallet.derivePath(wallet_hdpath + counter).getWallet();
        const address = '0x' + wallet.getAddress().toString('hex');
        const privateKey = '0x' + wallet.getPrivateKey().toString('hex');
        account = {address: address, privateKey: privateKey};
        counter++;
    }

    return account;
};
