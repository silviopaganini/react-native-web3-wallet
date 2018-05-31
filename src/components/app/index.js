import React, {Component} from 'react';
import {connect} from 'react-redux';
import {
    Button,
    FormLabel,
    FormInput,
    FormValidationMessage
} from 'react-native-elements';
import {Text, StyleSheet, View, ScrollView, Linking} from 'react-native';
import {createStellarAccount} from '../../actions/stellar';
import {
    getWallet,
    userLogin,
    getBalance,
    // getActivity
} from '../../actions/eth';
import {getContract, transfer, burn} from '../../actions/contract';
import {loadContent} from '../../actions/content';
import Loading from '../loading';
import Network from '../network';

class App extends Component {

  state = {
      sk: '0xd34428068334f2899909ebfac2b0098ad60755dc2b2bbcadcb18963d8ff51c2d',
      burnInput: '5',
      errorPrivateKey: false,
  }

  componentDidMount() {
      this.props.loadContent();
  }

  onImportKey = () => {
      const {sk} = this.state;
      if (sk === '') {
          this.setState({errorPrivateKey: true});
          return;
      }
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
      const {sk, burnInput, errorPrivateKey} = this.state;
      const {
          loading,
          contract,
          user,
          events,
          contentReady,
      } = this.props;

      if (!contentReady) {
          return (
              <View style={styles.loading}>
                  <Text>Loading</Text>
              </View>
          );
      }

      return (
          <ScrollView style={styles.container}>
              <Network />

              {contract.instance &&
                  <View style={styles.sectionView}>
                      <Text style={styles.sectionHeading}>ERC20 Token Props ({contract.symbol})</Text>
                      <View>
                          <Text>Address: {contract.address}</Text>
                          <Text>Token Name: {contract.name}</Text>
                          <Text>Supply:{contract.supply}</Text>
                      </View>
                  </View>
              }

              <View style={styles.sectionView}>
                  {user.coinbase &&
                      <View style={styles.subSectionView}>
                          <Text style={styles.sectionHeading}>User details</Text>
                          <Text>Address: {user.coinbase}</Text>
                          <Text>Current Wallet Token Balance: {user.balance}</Text>
                      </View>
                  }

                  {user.balance > 0 && user.coinbase.toLowerCase() !== contract.owner.toLowerCase() &&
                      <View style={styles.subSectionView}>
                          <Text style={styles.subSectionHeading}>Claim Stellar tokens</Text>
                          <Text>Total supply and user supply should decrease</Text>
                          <FormLabel>Amount of Tokens to burn</FormLabel>
                          <FormInput value={burnInput} onChangeText={text => this.setState({burnInput: text.toString()})}/>
                          <Button titleStyle={styles.buttonTitleStyle} buttonStyle={styles.buttonStyle} disabled={user.coinbase === ''} onPress={this.onSubmitBurn} title="Claim Tokens"/>
                      </View>
                  }

                  {user.stellar &&
                      <View style={styles.subSectionView}>
                          <Text style={styles.subSectionHeading}>Transaction Hash</Text>
                          <Text>{events.get('transactionHash')}</Text>
                          <Text style={styles.subSectionHeading}>Stellar Account</Text>
                          <Text>Secret Key: {user.stellar.sk}</Text>
                          <Text>Public Key: {user.stellar.pk}</Text>
                          <Button titleStyle={styles.buttonTitleStyle} buttonStyle={styles.buttonStyle} onPress={() => {
                              Linking.openURL(`https://horizon-testnet.stellar.org/accounts/${user.stellar.pk}`);
                          }} title="View on Stellar Network" />
                      </View>
                  }

                  {!user.coinbase &&
                      <View style={styles.subSectionView}>
                          <FormLabel>Input your private key</FormLabel>
                          <FormInput value={sk} onChangeText={this.onChangeTextField}/>
                          {errorPrivateKey && <FormValidationMessage>Field required</FormValidationMessage>}
                          <Button titleStyle={styles.buttonTitleStyle} buttonStyle={styles.buttonStyle} onPress={this.onImportKey} title="Import" />
                      </View>
                  }
              </View>

              <Loading message={loading} />
          </ScrollView>
      );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    sectionView: {
        margin: 0,
        marginBottom: 20,
        padding: 0,
    },
    subSectionView: {
        margin: 0,
        padding: 0,
        marginBottom: 20,
        left: 0,
    },
    sectionHeading: {
        fontSize: 20,
        fontWeight: '600'
    },
    subSectionHeading: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 20,
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inputPrivateKey: {
        height: 40,
        padding: 10,
        borderColor: 'black',
        marginTop: 20,
        marginBottom: 20,
        borderWidth: 1,
        width: '100%'
    },
    buttonStyle: {
        borderColor: 'transparent',
        borderWidth: 0,
        borderRadius: 10,
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
        paddingBottom: 10,
        margin: 0,
        marginTop: 20,
        maxWidth: 300,
        backgroundColor: '#003278',
    },
    buttonTitleStyle: {
        fontWeight: '600',
    }
});

export default connect(({user, events, contract, content}) => ({
    user,
    events,
    contract,
    contentReady: content.get('loaded'),
    loading: events.get('loading')
}), {
    getWallet,
    userLogin,
    getBalance,
    loadContent,
    getContract,
    transfer,
    burn,
    createStellarAccount
},
)(App);
