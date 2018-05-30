import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {Text, Button} from 'react-native-elements';
import {StyleSheet, View, TextInput, Linking} from 'react-native';
import {createStellarAccount} from '../../actions/stellar';
import {
    getWallet,
    userLogin,
    getBalance,
    // getActivity
} from '../../actions/eth';
import {getContract, transfer, burn} from '../../actions/contract';
import Loading from '../loading';

class App extends Component {

  state = {
      sk: '0xd34428068334f2899909ebfac2b0098ad60755dc2b2bbcadcb18963d8ff51c2d',
      burnInput: '50'
  }

  onImportKey = () => {
      console.log('on import key');
      const {sk} = this.state;
      this.props.userLogin(sk);
  }

  onChangeTextField = (text) => {
      this.setState({sk: text.substr(0, 2) !== '0x' ? `0x${text}` : text});
  }

  onSubmit = (e) => {
      e.preventDefault();
      this.props.transfer(
          this.state.accountToSendTokens,
          this.state.tokensToSend
      );
  }

  onSubmitBurn = (e) => {
      e.preventDefault();

      this.props.createStellarAccount();
      this.props.burn(Number(this.state.burnInput));
  }

  render() {
      const {sk, burnInput} = this.state;
      const {
          loading,
          contract,
          user,
          events,
      } = this.props;

      console.log(loading);

      return (
          <View style={styles.container}>
              {contract.instance &&
                  <View>
                      <Text h4>ERC20 Token Props ({contract.symbol})</Text>
                      <View>
                          <Text h5>Address: {contract.address}</Text>
                          <Text>Token Name: {contract.name}</Text>
                          <Text>Supply:{contract.supply}</Text>
                      </View>
                  </View>
              }

              <View>
                  <Text h4>User details</Text>
                  {user.coinbase && <Fragment>
                      <View>
                          <Text h5>Address: {user.coinbase}</Text>
                          <Text>Current Wallet Token Balance: {user.balance}</Text>
                          <Button disabled={user.coinbase === ''} onPress={this.props.getBalance} title="Refresh Balance" />
                      </View>
                  </Fragment>}

                  {user.balance > 0 && user.coinbase.toLowerCase() !== contract.owner.toLowerCase() && <Fragment>
                      <View>
                          <Text h4>Claim Stellar tokens</Text>
                          <Text>Total supply and user supply should decrease</Text>
                          <TextInput onChangeText={text => this.setState({burnInput: text.toString()})} name="burnInput" placeholder={user.balance.toString()} value={burnInput} />
                          <Button disabled={user.coinbase === ''} onPress={this.onSubmitBurn} title="Claim Tokens"/>
                      </View>
                  </Fragment>}

                  {user.stellar && <Fragment>
                      <View>
                          <Text h5>Transaction Hash</Text>
                          <Text>{events.get('transactionHash')}</Text>
                          <Text h4>Stellar Account</Text>
                          <Text>Secret Key: {user.stellar.sk}</Text>
                          <Text>Public Key: <Button onPress={() => {
                              Linking.openURL(`https://horizon-testnet.stellar.org/accounts/${user.stellar.pk}`);
                          }} title={user.stellar.pk} />
                          </Text>
                      </View>
                  </Fragment>}

              </View>

              {!user.coinbase && <Fragment>
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

              <Loading message={loading} />
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

export default connect(({user, events, contract}) => ({
    user,
    events,
    contract,
    loading: events.get('loading')
}), {
    getWallet,
    userLogin,
    getBalance,
    // getActivity,
    getContract,
    transfer,
    burn,
    createStellarAccount
},
)(App);
