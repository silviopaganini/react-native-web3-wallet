import erc20Local from './erc20-contract.json';

export default {
    ropsten: {
        provider: erc20Local.ropsten.rpc,
        ADDRESS: erc20Local.ropsten.address,
        ABI: erc20Local.ropsten.abi
    },
    local: {
        provider: erc20Local.local.rpc,
        ADDRESS: erc20Local.local.address,
        ABI: erc20Local.local.abi
    }
};
