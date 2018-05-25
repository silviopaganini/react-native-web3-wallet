import React, {Component} from 'react';
import './global';
import Web3 from 'web3';
import Web3Personal from 'web3-eth-personal';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';

export default class App extends Component {

  state = {
    sk: '0x199b807b78df2badc56f596661aa8728801e378642a84a654e1c7b6d9e5e3966',
    pk: '0xdB0C4Ffc5E462bcEDEd3076adDF761Eff88256A4',
    password: ''
  }

  componentDidMount() {
    this.web3 = new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:7545'));
    this.web3.eth.getBlock('latest').then(console.log)
    console.log(this.web3);

    // var originalBalance = web3.eth.getBalance(coinbase).toNumber();
    // document.getElementById('coinbase').innerText = 'coinbase: ' + coinbase;
    // document.getElementById('original').innerText = ' original balance: ' + originalBalance + '    watching...';
    // web3.eth.filter('latest').watch(function() {
    //     var currentBalance = web3.eth.getBalance(coinbase).toNumber();
    //     document.getElementById("current").innerText = 'current: ' + currentBalance;
    //     document.getElementById("diff").innerText = 'diff:    ' + (currentBalance - originalBalance);
    // });
  }

  onChangeField = (event) => {
    console.log(event.target);
    // this.setState({[event.currentTarget.dataset.id] : event.currentTarget.value})
  }

  onImportKey = async () => {
    const { sk, pk, password } = this.state;
    const personal = new Web3Personal('http://127.0.0.1:7545');
    console.log(personal);
    personal.importRawKey(sk, password)

    const accs = await personal.getAccounts();
    console.log(accs.find(c => c === pk));

    console.log(this.web3.eth.coinbase);
  }

  render() {
    const { sk, pk, password } = this.state;
    return (
      <View style={styles.container}>
        <Text>Import your Private key</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} style={{height: 40, padding: 5, borderColor: 'black', borderWidth: 1, width: '100%'}} data-id="sk" value={sk} onChangeText={text => this.setState({sk: text})} />
        <Text>Password</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} style={{height: 40, padding: 5, borderColor: 'black', borderWidth: 1, width: '100%'}} type="password" data-id="password" value={password} onChangeText={text => this.setState({password: text})} />
        <Text>Public address</Text>
        <TextInput autoCapitalize="none" autoCorrect={false} style={{height: 40, padding: 5, borderColor: 'black', borderWidth: 1, width: '100%'}} data-id="pk" value={pk} onChangeText={text => this.setState({pk: text})} />
        <Button onPress={this.onImportKey} title="Import" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    // alignItems: 'center',
    justifyContent: 'center',
    padding: 20
  },
});
