import React, {Component} from 'react';
import Web3 from '../../constants/web3';
import {View, StyleSheet, Text} from 'react-native';

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
            return {id: netId, color: colors.forest, copy: 'Mainet'};
        case '2':
            return {id: netId, color: colors.darkGrey, copy: 'Morden (deprecated) test network'};
        case '3':
            return {id: netId, color: colors.darkRed, copy: 'Ropsten test network.'};
        case '4':
            return {id: netId, color: colors.gold, copy: 'Rinkeby test network.'};
        case '42':
            return {id: netId, color: colors.purple, copy: 'Kovan test network.'};
        default:
            return {id: netId, color: colors.blue, copy: 'Private network.'};
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
        marginBottom: 20,
        maxWidth: 185,
    },
    copy: {
        color: 'white'
    }
});

export default class Network extends Component {
  state = {
      network: ''
  }

  async componentDidMount() {
      try {
          const netId = await Web3.eth.net.getId();
          this.setState({network: getNetwork(netId.toString())});
      } catch (e) {
          console.log(e);
      }
  }

  render () {
      const backgroundColor = {backgroundColor: this.state.network.color};
      return (
          <View style={[styles.container, backgroundColor]}>
              <Text style={styles.copy}>{this.state.network.copy}</Text>
          </View>
      );
  }
}
