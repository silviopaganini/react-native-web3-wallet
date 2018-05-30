import Web3 from './web3';

export const ABI = [{constant: true, inputs: [], name: 'name', outputs: [{name: '', type: 'string'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'totalSupply', outputs: [{name: '', type: 'uint256'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'INITIAL_SUPPLY', outputs: [{name: '', type: 'uint256'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'decimals', outputs: [{name: '', type: 'uint8'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: false, inputs: [{name: '_value', type: 'uint256'}], name: 'burn', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {constant: true, inputs: [{name: '_owner', type: 'address'}], name: 'balanceOf', outputs: [{name: 'balance', type: 'uint256'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'owner', outputs: [{name: '', type: 'address'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'symbol', outputs: [{name: '', type: 'string'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: false, inputs: [{name: 'newOwner', type: 'address'}], name: 'transferOwnership', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor'}, {anonymous: false, inputs: [{indexed: true, name: 'previousOwner', type: 'address'}, {indexed: true, name: 'newOwner', type: 'address'}], name: 'OwnershipTransferred', type: 'event'}, {anonymous: false, inputs: [{indexed: true, name: 'burner', type: 'address'}, {indexed: false, name: 'value', type: 'uint256'}], name: 'Burn', type: 'event'}, {anonymous: false, inputs: [{indexed: true, name: 'from', type: 'address'}, {indexed: true, name: 'to', type: 'address'}, {indexed: false, name: 'value', type: 'uint256'}], name: 'Transfer', type: 'event'}, {constant: false, inputs: [{name: '_to', type: 'address'}, {name: '_value', type: 'uint256'}], name: 'transfer', outputs: [{name: '', type: 'bool'}], payable: false, stateMutability: 'nonpayable', type: 'function'}];

const CONTRACT_ADDRESS = '0x2521edac39a28e0a0fafcbedcac10fe0fc0f8297';
let contractInstance = null;

export const getContract = (from) => {
    if (contractInstance) {
        return contractInstance;
    }
    contractInstance = new Web3.eth.Contract(ABI, CONTRACT_ADDRESS, {from, gasPrice: 20000000000, gas: 6721975});
    return contractInstance;
};
