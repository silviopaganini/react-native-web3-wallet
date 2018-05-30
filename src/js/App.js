import React, {Component, Fragment} from 'react';
import './global';
import {utils} from 'web3';
import Web3 from './web3';
import {getContract} from './contract';
import {CONTRACT_ADDRESS} from './constants';
import {StyleSheet, Text, View, TextInput, Button} from 'react-native';

export default class App extends Component {

  state = {
      sk: '0xd34428068334f2899909ebfac2b0098ad60755dc2b2bbcadcb18963d8ff51c2d',
      coinbase: null,
      balance: null,
      contract: null,
      contractInfo: null,
      burningInfo: null
  }

  onImportKey = async () => {
      const {sk} = this.state;
      const account = Web3.eth.accounts.privateKeyToAccount(sk);
      const coinbase = account.address;
      const balance = await Web3.eth.getBalance(coinbase);
      this.setState({coinbase, balance});
  }

  updateInfo = async () => {
      const {coinbase, contract} = this.state;
      if (!contract) {
          return;
      }
      try {
          const supply = await contract.methods.totalSupply().call();
          const symbol = await contract.methods.symbol().call();
          const owner = await contract.methods.owner().call();
          const name = await contract.methods.name().call();
          const wolloBalance = await contract.methods.balanceOf(coinbase).call();
          const balance = await Web3.eth.getBalance(coinbase);

          this.setState({
              burningInfo: null,
              balance,
              contractInfo: {
                  supply, symbol, owner, name, wolloBalance
              }
          });
      } catch (e) {
          console.log(e);
      }
  }

  onClickContract = async () => {
      const {coinbase} = this.state;
      const contract = getContract(coinbase);
      console.log(contract);

      this.setState({
          burningInfo: null,
          contract
      }, this.updateInfo);
  }

  onClickBurn = async () => {
      const {coinbase} = this.state;
      try {
          const gasPrice = await Web3.eth.getGasPrice();
          const estimatedGas = await Web3.eth.estimateGas({from: coinbase, to: CONTRACT_ADDRESS});
          this.setState({
              burningInfo: {
                  estimatedCost: estimatedGas * gasPrice,
              }
          });
          console.log(estimatedGas);
      } catch (e) {
          console.log(e);
      }
  }

  onClickConfirmBurn = async () => {
      const {contract} = this.state;
      try {
          console.log(contract);
          const burn = await contract.methods.burn(50).send();
          console.log(burn);
          this.updateInfo();
      } catch (e) {
          console.log(e);
      }
  }

  onChangeTextField = (text) => {
      this.setState({sk: text.substr(0, 2) !== '0x' ? `0x${text}` : text});
  }

  render() {
      const {sk, coinbase, balance, contract, contractInfo, burningInfo} = this.state;
      return (
          <View style={styles.container}>
              {coinbase &&
                  <Fragment>
                      <Text>Ethereum address:</Text>
                      <Text>{coinbase}</Text>
                      <Text>Balance: {utils.fromWei(balance, 'ether')} ETH</Text>
                      {!contract && <Button onPress={this.onClickContract} title="Load Contract" />}
                      {contractInfo &&
                          <View style={{marginTop: 40}}>
                              <Text style={{fontSize: 20}}>Contract Details</Text>
                              <Text>Name: {contractInfo.name}</Text>
                              <Text>Symbol: {contractInfo.symbol}</Text>
                              <Text>Supply: {contractInfo.supply}</Text>
                              <Text>Owner: {contractInfo.owner}</Text>
                              <Text>Wollo Balance: {contractInfo.wolloBalance}</Text>
                              {!(burningInfo && burningInfo.estimatedCost) && contractInfo.wolloBalance > 0 && <Button onPress={this.onClickBurn} title="Burn 50 Tokens" />}
                              {burningInfo && burningInfo.estimatedCost && <Fragment>
                                  <Text style={{color: 'red'}}>{`Estimated Gas cost: ${utils.fromWei(burningInfo.estimatedCost.toString(), 'ether')} ETH`}</Text>
                                  <Button onPress={this.onClickConfirmBurn} title="Confirm Burn 50 Tokens" />
                              </Fragment>}
                          </View>
                      }
                  </Fragment>
              }
              {!coinbase && <Fragment>
                  <Text>Import your Private key</Text>
                  <TextInput
                      autoCapitalize="none"
                      autoCorrect={false}
                      defaultValue="0x"
                      style={{height: 40, padding: 10, borderColor: 'black', borderWidth: 1, width: '100%'}}
                      multiline={true}
                      numberOfLines={2}
                      value={sk}
                      onChangeText={this.onChangeTextField}
                  />
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
