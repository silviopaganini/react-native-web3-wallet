import StellarSdk from '@pigzbe/react-native-stellar-sdk';
// import axios from 'axios';

const ISSUING_PK = 'GA3ZCJL6LVSEGHLTQBYT27XEIVZ6E4NOPV7LRLXS5QPUCS7RPJD6RK5T';
const ASSET_CODE = 'WLO';

let _server = null;

// const getPublicServer = () => {
//     const server = new StellarSdk.Server('https://horizon.stellar.org');
//     StellarSdk.Network.usePublicNetwork();
//     return server;
// };

const getTestServer = () => {
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    StellarSdk.Network.useTestNetwork();
    return server;
};

const getServer = () => {
    if (!_server) {
        _server = getTestServer();
    }
    return _server;
};

export const getKeyPair = secretKey => {
    return StellarSdk.Keypair.fromSecret(secretKey);
};

export const trustAsset = async (pk, receivingKeys) => {
    try {
        const receiver = await getServer().loadAccount(pk);
        const transaction = new StellarSdk.TransactionBuilder(receiver)
            .addOperation(StellarSdk.Operation.changeTrust({
                asset: new StellarSdk.Asset(ASSET_CODE, ISSUING_PK),
            }))
            .build();

        transaction.sign(receivingKeys);

        const transactionRes = await getServer().submitTransaction(transaction);
        console.log(transactionRes);
    } catch (e) {
        console.log(e);
        throw new Error(e);
    }

};

export const createAccount = (sourceKeyPair, balance = '20') => {
    const pair = StellarSdk.Keypair.random();

    return getServer().loadAccount(sourceKeyPair.publicKey())
        .then(account => {
            const transaction = new StellarSdk.TransactionBuilder(account)
                .addOperation(StellarSdk.Operation.createAccount({
                    destination: pair.publicKey(),
                    startingBalance: balance,
                    source: account.id
                }))
                .build();

            transaction.sign(sourceKeyPair);

            return transaction;
        })
        .then(transaction => getServer().submitTransaction(transaction))
        .then(result => {
            return {
                sk: pair.secret(),
                pk: pair.publicKey(),
                result
            };
        });
};

export const loadAccountInfo = publicKey => {
    return getServer().loadAccount(publicKey);
};

export const createAsset = ({
    code,
    amount = '100',
    homeDomain = '',
    issuingSK,
    distributionSK
}) => {
    // Keys for accounts to issue and receive the new asset
    const issuingKeys = getKeyPair(issuingSK);
    const receivingKeys = getKeyPair(distributionSK);

    // Create an object to represent the new asset
    const asset = new StellarSdk.Asset(code, issuingKeys.publicKey());
    // const eth = new StellarSdk.Asset('ETH', issuingKeys.publicKey());
    // const btc = new StellarSdk.Asset('BTC', issuingKeys.publicKey());

    // First, the receiving account must trust the asset
    return getServer().loadAccount(receivingKeys.publicKey())
        .then(receiver => {
            const transaction = new StellarSdk.TransactionBuilder(receiver)
            // The `changeTrust` operation creates (or alters) a trustline
            // The `limit` parameter below is optional
                .addOperation(StellarSdk.Operation.changeTrust({
                    asset: asset,
                    limit: amount
                }))
                .build();

            transaction.sign(receivingKeys);

            return getServer().submitTransaction(transaction);
        })
        .then(() => getServer().loadAccount(issuingKeys.publicKey()))
        // set the home domain on the issuing account
        .then(issuer => {
            const transaction = new StellarSdk.TransactionBuilder(issuer)
                .addOperation(StellarSdk.Operation.setOptions({
                    homeDomain
                }))
                .build();

            transaction.sign(issuingKeys);

            return getServer()
                .submitTransaction(transaction)
                .then(() => issuer);
        })
        // the issuing account actually sends a payment using the asset
        .then(issuer => {
            const transaction = new StellarSdk.TransactionBuilder(issuer)
                .addOperation(StellarSdk.Operation.payment({
                    destination: receivingKeys.publicKey(),
                    asset: asset,
                    amount: amount
                }))
                .build();

            transaction.sign(issuingKeys);

            return getServer()
                .submitTransaction(transaction)
                .then(() => issuer);
        })
        // lock the issuing account
        .then(issuer => {
            const transaction = new StellarSdk.TransactionBuilder(issuer)
                .addOperation(StellarSdk.Operation.setOptions({
                    masterWeight: 0,
                    lowThreshold: 1,
                    medThreshold: 1,
                    highThreshold: 1
                }))
                .build();

            transaction.sign(issuingKeys);

            return getServer()
                .submitTransaction(transaction);
        });
};

export const sendPayment = ({issuingPK, senderSK, receiverSK, assetCode, amount}) => {
    const issuingKeys = getKeyPair(senderSK);
    const receivingKeys = getKeyPair(receiverSK);
    const asset = new StellarSdk.Asset(assetCode, issuingPK);

    return getServer().loadAccount(receivingKeys.publicKey())
        .then(receiver => {
            const transaction = new StellarSdk.TransactionBuilder(receiver)
            // The `changeTrust` operation creates (or alters) a trustline
            // The `limit` parameter below is optional
                .addOperation(StellarSdk.Operation.changeTrust({
                    asset: asset
                }))
                .build();

            transaction.sign(receivingKeys);

            return getServer().submitTransaction(transaction);
        })

    // Second, the issuing account actually sends a payment using the asset
        .then(() => getServer().loadAccount(issuingKeys.publicKey()))
        .then(issuer => {
            const transaction = new StellarSdk.TransactionBuilder(issuer)
                .addOperation(StellarSdk.Operation.payment({
                    destination: receivingKeys.publicKey(),
                    asset: asset,
                    amount: amount
                }))
                .build();
            transaction.sign(issuingKeys);
            return getServer().submitTransaction(transaction);
        });
};

export const createOffer = ({
    issuingPK,
    sellerSK,
    sellAssetCode,
    price
}) => {
    const sellerKeys = getKeyPair(sellerSK);
    const token = new StellarSdk.Asset(sellAssetCode, issuingPK);
    // const eth = new StellarSdk.Asset('ETH', issuingPK);
    // const btc = new StellarSdk.Asset('BTC', issuingPK);

    return getServer().loadAccount(sellerKeys.publicKey())
        .then(receiver => {
            const transaction = new StellarSdk.TransactionBuilder(receiver)
            // https://www.stellar.org/developers/horizon/reference/resources/offer.html
                .addOperation(StellarSdk.Operation.manageOffer({
                    selling: token,
                    buying: StellarSdk.Asset.native(),
                    price: price.XLM,
                    amount: String(1 / Number(price.XLM))
                }))
                .build();

            transaction.sign(sellerKeys);

            return getServer().submitTransaction(transaction);
        });
};

const trusted = (account, asset) => account.balances.some(balance => {
    return balance.asset_code === asset.getCode() &&
           balance.asset_issuer === asset.getIssuer();
});

// buyTokens(sourceWallet, sendAsset, destAsset, sendMax, destAmount) {
export const buyTokens = ({
    buyerSK,
    assetCode,
    issuingPK,
    sendAssetCode = 'ETH'
}) => {
    const buyerKeys = getKeyPair(buyerSK);
    const buyAsset = new StellarSdk.Asset(assetCode, issuingPK);
    const sendAsset = new StellarSdk.Asset(sendAssetCode, issuingPK);
    const destAmount = sendAssetCode === 'ETH' ? '10' : '100';
    // const eth = new StellarSdk.Asset('ETH', issuingPK);
    // const btc = new StellarSdk.Asset('BTC', issuingPK);
    return getServer().loadAccount(buyerKeys.publicKey())
        .then(account => {
            if (!trusted(account, buyAsset)) {
                const transaction = new StellarSdk.TransactionBuilder(account)
                    .addOperation(StellarSdk.Operation.changeTrust({
                        asset: buyAsset
                    }))
                    .build();
                transaction.sign(buyerKeys);
                return getServer().submitTransaction(transaction)
                    .then(() => account);
            }

            return account;
        })
        .then(account => {
            if (!trusted(account, sendAsset)) {
                const transaction = new StellarSdk.TransactionBuilder(account)
                    .addOperation(StellarSdk.Operation.changeTrust({
                        asset: sendAsset
                    }))
                    .build();
                transaction.sign(buyerKeys);
                return getServer().submitTransaction(transaction)
                    .then(() => account);
            }

            return account;
        })
        .then(account => {
            if (!trusted(account, buyAsset)) {
                throw new Error('No trustline from buyer to buyAsset');
            }
            if (!trusted(account, sendAsset)) {
                throw new Error('No trustline from buyer to sendAsset');
            }

            const transaction = new StellarSdk.TransactionBuilder(account)
                .addOperation(StellarSdk.Operation.pathPayment({
                    destination: account.id,
                    sendAsset: sendAsset,
                    sendMax: '1',
                    destAsset: buyAsset,
                    destAmount: destAmount,
                    path: []
                }))
                .build();

            transaction.sign(buyerKeys);

            return getServer().submitTransaction(transaction);
        });
};
