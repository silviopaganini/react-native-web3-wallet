export default {
    ropsten: {
        provider: 'https://ropsten.infura.io/Oan138HoQpDarYosPryu',
        ADDRESS: '0x8c1dc4910a21790bb07b0232c8828520d6aefd57',
        ABI: [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"INITIAL_SUPPLY","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_value","type":"uint256"}],"name":"burn","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"previousOwner","type":"address"},{"indexed":true,"name":"newOwner","type":"address"}],"name":"OwnershipTransferred","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"burner","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Burn","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"from","type":"address"},{"indexed":true,"name":"to","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Transfer","type":"event"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"}]
    },
    local: {
        provider: 'http://192.168.1.64:7545',
        ADDRESS: '0x200842a677bc443ec7591af6bd65f247cbb551cc',
        ABI: [{constant: true, inputs: [], name: 'name', outputs: [{name: '', type: 'string'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'totalSupply', outputs: [{name: '', type: 'uint256'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'INITIAL_SUPPLY', outputs: [{name: '', type: 'uint256'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'decimals', outputs: [{name: '', type: 'uint8'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: false, inputs: [{name: '_value', type: 'uint256'}], name: 'burn', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {constant: true, inputs: [{name: '_owner', type: 'address'}], name: 'balanceOf', outputs: [{name: '', type: 'uint256'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'owner', outputs: [{name: '', type: 'address'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: true, inputs: [], name: 'symbol', outputs: [{name: '', type: 'string'}], payable: false, stateMutability: 'view', type: 'function'}, {constant: false, inputs: [{name: 'newOwner', type: 'address'}], name: 'transferOwnership', outputs: [], payable: false, stateMutability: 'nonpayable', type: 'function'}, {inputs: [], payable: false, stateMutability: 'nonpayable', type: 'constructor'}, {anonymous: false, inputs: [{indexed: true, name: 'previousOwner', type: 'address'}, {indexed: true, name: 'newOwner', type: 'address'}], name: 'OwnershipTransferred', type: 'event'}, {anonymous: false, inputs: [{indexed: true, name: 'burner', type: 'address'}, {indexed: false, name: 'value', type: 'uint256'}], name: 'Burn', type: 'event'}, {anonymous: false, inputs: [{indexed: true, name: 'from', type: 'address'}, {indexed: true, name: 'to', type: 'address'}, {indexed: false, name: 'value', type: 'uint256'}], name: 'Transfer', type: 'event'}, {constant: false, inputs: [{name: '_to', type: 'address'}, {name: '_value', type: 'uint256'}], name: 'transfer', outputs: [{name: '', type: 'bool'}], payable: false, stateMutability: 'nonpayable', type: 'function'}]
    }
};
