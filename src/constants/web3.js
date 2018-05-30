import Web3 from 'web3';
import {PROVIDER} from './constants';

let web3 = null;

const initWeb3 = () => {
  if(web3) return web3;

  web3 = new Web3(new Web3.providers.HttpProvider(PROVIDER));
  return web3;
}

export default initWeb3();
