/* global process */
import StellarSdk from 'stellar-sdk';

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
