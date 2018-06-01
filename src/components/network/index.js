import React, {Component} from 'react';
import {connect} from 'react-redux';
import {View, StyleSheet} from 'react-native';
import {Dropdown} from 'react-native-material-dropdown';
import {changeNetwork} from '../../actions/contract';

const colors = {
    blue: '#2465e1',
    gold: '#e7a218',
    forest: '#039396',
    purple: '#690496',
    darkRed: '#e91550',
    lightRed: '#ff6666',
    darkGrey: '#7d8082',
    lightGrey: '#aeaeae',
};

const getNetwork = (netId) => {
    switch (netId) {
        case '1':
        case 'mainnet':
            return {label: 'mainnet', id: netId, color: colors.forest, copy: 'Mainet'};
        case '2':
        case 'morden':
            return {label: 'morden', id: netId, color: colors.darkGrey, copy: 'Morden (deprecated) test network'};
        case '3':
        case 'ropsten':
            return {label: 'ropsten', id: netId, color: colors.darkRed, copy: 'Ropsten test network.'};
        case '4':
        case 'rinkeby':
            return {label: 'rinkeby', id: netId, color: colors.gold, copy: 'Rinkeby test network.'};
        case '42':
        case 'kovan':
            return {label: 'kovan', id: netId, color: colors.purple, copy: 'Kovan test network.'};
        default:
            return {label: 'local', id: netId, color: colors.blue, copy: 'Private network.'};
    }
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        height: 30,
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 30,
        maxWidth: 185,
    },
    copy: {
        color: 'white'
    },
    dropdown: {
        width: 200,
        marginLeft: 20,
        marginBottom: 20,
    }
});

class Network extends Component {

    onChangeText = (network) => {
        this.props.changeNetwork(network);
    }

    render () {
        const network = getNetwork(this.props.network);

        const data = [{
            label: 'Private network', value: 'local',
        }, {
            label: 'Ropsten network', value: 'ropsten',
        }
        ];

        return (
            <View style={[styles.container]}>
                <Dropdown
                    containerStyle={[styles.dropdown]}
                    textColor={network.color}
                    value={network.label}
                    dropdownMargins={{min: 15, max: 30}}
                    onChangeText={this.onChangeText}
                    data={data}
                />
            </View>
        );
    }
}

export default connect(({contract, web3}) => ({
    network: contract.get('network'),
    web3: web3.instance
}), {
    changeNetwork
})(Network);
