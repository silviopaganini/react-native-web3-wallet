import Web3 from './web3';

const getWallet = () => {
  return Web3.eth.getAccounts();
};

export default getWallet;
