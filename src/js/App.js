import React, {Component, Fragment} from 'react';
import './global';
import {utils} from 'web3';
import Web3 from './web3';
import Web3EthPersonal from 'web3-eth-personal'
import {getContract} from './contract';
import {PROVIDER} from './constants';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

export default class App extends Component {

  state = {
    sk: '0xd34428068334f2899909ebfac2b0098ad60755dc2b2bbcadcb18963d8ff51c2d',
    pk: '0x798D23d6a84b2EF7d23c4A25735ED55B72072c24',
    password: '',
    coinbase: null,
    balance: null,
    contract: null
  }

  onImportKey = async () => {
    const { sk, pk, password } = this.state;
    var personal = new Web3EthPersonal(PROVIDER);
    console.log(sk.substr(0,2));
    personal.importRawKey(sk.substr(0,2) !== '0x' ? `0x${sk}` : sk, password)

    const accs = await personal.getAccounts();
    console.log(accs);
    const coinbase = accs.find(c => c.toLowerCase() === (pk.substr(0,2) !== '0x' ? `0x${pk}` : pk).toLowerCase());

    console.log(coinbase);

    const balance = await Web3.eth.getBalance(coinbase);
    this.setState({coinbase, balance});
  }

  onClickContract = async () => {
    const { coinbase } = this.state;
    const contract = getContract(coinbase);
    console.log(contract);
    const supply = await contract.methods.totalSupply().call();
    const symbol = await contract.methods.symbol().call();
    const owner = await contract.methods.owner().call();
    const name = await contract.methods.name().call();
    const wolloBalance = await contract.methods.balanceOf(coinbase).call();

    this.setState({
      contract: {
        supply, symbol, owner, name, wolloBalance
      }
    })
  }

  onClickBurn = async () => {
    const { coinbase, contract } = this.state;
    try {
      const burn = await getContract(coinbase).methods.burn(contract.wolloBalance).send()
      console.log(burn);
      this.onClickContract();
    } catch (e) {
      console.log(e);
    }
  }

  render() {
    const { sk, pk, password, coinbase, balance, contract } = this.state;
    console.log(contract);
    return (
      <View style={styles.container}>
        {coinbase && <Fragment>
          <Text>Ethereum address:</Text>
          <Text>{coinbase}</Text>
          <Text>Balance: {utils.fromWei(balance, 'ether')}</Text>
          {!contract &&<Button onPress={this.onClickContract} title="Load Contract" />}
          {contract && <View style={{marginTop: 40}}>
            <Text style={{fontSize: 20}}>Contract Details</Text>
            <Text>Name: {contract.name}</Text>
            <Text>Symbol: {contract.symbol}</Text>
            <Text>Supply: {contract.supply}</Text>
            <Text>Owner: {contract.owner}</Text>
            <Text>Wollo Balance: {contract.wolloBalance}</Text>
            <Button onPress={this.onClickBurn} title="Burn Tokens" />
          </View>}
        </Fragment>}
        {!coinbase && <Fragment>
          <Text>Import your Private key</Text>
          <TextInput autoCapitalize="none" autoCorrect={false} style={{height: 40, padding: 5, borderColor: 'black', borderWidth: 1, width: '100%'}} data-id="sk" value={sk} onChangeText={text => this.setState({sk: text})} />
          <Text>Password</Text>
          <TextInput autoCapitalize="none" autoCorrect={false} style={{height: 40, padding: 5, borderColor: 'black', borderWidth: 1, width: '100%'}} type="password" data-id="password" value={password} onChangeText={text => this.setState({password: text})} />
          <Text>Public address</Text>
          <TextInput autoCapitalize="none" autoCorrect={false} style={{height: 40, padding: 5, borderColor: 'black', borderWidth: 1, width: '100%'}} data-id="pk" value={pk} onChangeText={text => this.setState({pk: text})} />
          <Button onPress={this.onImportKey} title="Import" />
        </Fragment>}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    padding: 20
  },
});
