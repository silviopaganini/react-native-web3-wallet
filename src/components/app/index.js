import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
    Button,
    FormLabel,
    FormInput,
    FormValidationMessage
} from 'react-native-elements';
import {Text, Modal, View, ScrollView, Linking} from 'react-native';
import {utils} from 'web3';
import {
    userLogin,
    // getActivity
} from '../../actions/eth';
import styles from './styles';
import {transfer, burn, changeNetwork} from '../../actions/contract';
import {checkUserCache} from '../../actions/eth';
import {loadContent, loadLocalStorage} from '../../actions/content';
import {clear} from '../../utils/storage';
import Loading from '../loading';
import Network from '../network';
import {ENV} from '../../constants/config';

class App extends Component {

  state = {
      burnInput: '5',
      mnemonic: 'elephant merit raven monkey path outer paddle bounce exist fringe pet dry',
      pk: '0x798D23d6a84b2EF7d23c4A25735ED55B72072c24',
      errorImportingAccount: false,
      modal: {
          visible: false,
          message: '',
      },
      estimatedCost: null,
  }

  componentWillMount() {
      // clear('burning');

      this.props.changeNetwork(ENV);

  }

  componentWillReceiveProps(nextProps) {
      if (nextProps.contract.instance && !this.props.contract.instance) {
          nextProps.loadLocalStorage();
          nextProps.loadContent();
      }
      if (nextProps.localStorage && !this.props.localStorage) {
          nextProps.checkUserCache();
      }
  }

  onImportKey = () => {
      const {mnemonic, pk} = this.state;
      if (pk === '' || mnemonic === '') {
          this.setState({errorImportingAccount: true});
          return;
      }
      this.props.userLogin(mnemonic, pk);
  }

  onChangePublicKey = (text) => {
      this.setState({pk: text.substr(0, 2) !== '0x' ? `0x${text}` : text});
  }

  onChangeMnemonic = (mnemonic) => {
      this.setState({mnemonic});
  }

  onSubmitBurn = async () => {
      const {localStorage, contract, user} = this.props;
      const {burnInput} = this.state;
      if (localStorage.transactionHash && localStorage.value) {
          this.props.burn(Number(localStorage.value));
          return;
      }

      this.setState({
          modal: {
              visible: true,
              message: 'Please wait, estimating gas cost...',
          }
      });

      try {
          const gasPrice = await this.props.web3.eth.getGasPrice();
          const estimatedGas = await contract.instance.methods.burn(burnInput).estimateGas({from: user.coinbase});
          this.setState({
              estimatedCost: `${utils.fromWei(String(estimatedGas * gasPrice), 'ether')} ETH`,
          });

          this.setState({
              modal: {
                  visible: true,
                  message: 'confirm'
              }
          });
      } catch (err) {
          console.log(err);
      }
  }

  onConfirmedSubmitBurn = () => {
      this.closeModal();
      this.props.burn(Number(this.state.burnInput));
  }

  closeModal = () => {
      this.setState({
          modal: {
              visible: false,
              message: ''
          }
      });
  }

  render() {
      const {
          estimatedCost,
          mnemonic,
          pk,
          burnInput,
          errorImportingAccount,
      } = this.state;
      const {
          loading,
          contract,
          user,
          events,
          web3,
          contentReady,
          localStorage,
      } = this.props;

      if (!contentReady || !localStorage || !contract.instance) {
          return (
              <View style={styles.loading}>
                  <Text>Loading</Text>
              </View>
          );
      }

      const stellar = (localStorage.stellar && localStorage.started) ? localStorage.stellar : (user.stellar ? user.stellar : null);
      const tx = localStorage.transactionHash || events.get('transactionHash');

      return (
          <ScrollView style={styles.container}>
              {contract.network && <Network />}

              {contract.instance &&
                  <View style={styles.sectionView}>
                      <Text style={[styles.sectionHeading, styles.tokenTitle]}>ERC20 Token Props ({contract.symbol})</Text>
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

                  {localStorage.complete && localStorage.started &&
                      <View style={styles.subSectionView}>
                          <Text style={styles.subSectionHeading}>Your tokens were already burned</Text>
                          <Text>Check your information below</Text>
                      </View>
                  }

                  {!localStorage.complete && localStorage.started &&
                      <View style={styles.subSectionView}>
                          <Text>Your burning process has already started, click on the button below to resume the process</Text>
                          <Button titleStyle={styles.buttonTitleStyle} buttonStyle={styles.buttonStyle} onPress={this.onSubmitBurn} title="Resume process"/>
                      </View>
                  }

                  {!localStorage.complete && !localStorage.started && user.balance > 0 && user.coinbase.toLowerCase() !== contract.owner.toLowerCase() &&
                      <View style={styles.subSectionView}>
                          <Text style={styles.subSectionHeading}>Claim Stellar tokens</Text>
                          <Text>Total supply and user supply should decrease</Text>
                          <FormLabel>Amount of Tokens to burn</FormLabel>
                          <FormInput value={burnInput} onChangeText={text => this.setState({burnInput: text.toString()})}/>
                          <Button titleStyle={styles.buttonTitleStyle} buttonStyle={styles.buttonStyle} disabled={user.coinbase === ''} onPress={this.onSubmitBurn} title="Claim Tokens"/>
                      </View>
                  }

                  {stellar &&
                      <View style={styles.subSectionView}>
                          <Text style={styles.subSectionHeading}>Ethereum Transaction Hash</Text>
                          <Text>{tx}</Text>
                          <Text style={styles.subSectionHeading}>Stellar Account</Text>
                          <Text>Secret Key: {stellar.sk}</Text>
                          <Text>Public Key: {stellar.pk}</Text>
                          {localStorage.complete && <Button titleStyle={styles.buttonTitleStyle} buttonStyle={styles.buttonStyle} onPress={() => {
                              Linking.openURL(`https://horizon-testnet.stellar.org/accounts/${stellar.pk}`);
                          }} title="View on Stellar Network" />}
                      </View>
                  }

                  {!user.coinbase && web3 &&
                      <View style={styles.subSectionView}>
                          <Text style={styles.subSectionHeading}>Let's import your account</Text>
                          <FormLabel>Fill in your 12 memorable words (seed)</FormLabel>
                          <FormInput
                              containerStyle={styles.inputTextArea}
                              inputStyle={styles.inputFieldTextArea}
                              multiline={true}
                              numberOfLines={3}
                              value={mnemonic}
                              onChangeText={this.onChangeMnemonic}
                          />

                          <FormLabel>Fill in the Public address of your wallet</FormLabel>
                          <FormInput
                              containerStyle={styles.inputTextArea}
                              inputStyle={styles.inputFieldTextArea}
                              value={pk}
                              multiline={true}
                              numberOfLines={3}
                              onChangeText={this.onChangePublicKey}
                          />

                          {errorImportingAccount && <FormValidationMessage>All fields required</FormValidationMessage>}
                          <Button titleStyle={styles.buttonTitleStyle} buttonStyle={[styles.buttonStyle, styles.importAccountButton]} onPress={this.onImportKey} title="Import" />
                      </View>
                  }
              </View>

              <Loading message={loading} />
              <Modal animationType="slide" visible={this.state.modal.visible}>
                  <View style={styles.modalConfirm}>
                      {this.state.modal.message === 'confirm' &&
                          <Fragment>
                              <Text style={styles.modalTitle}>The estimated gas for this transaction is</Text>
                              <Text style={[styles.modalTitle, styles.modalTitleCost]}>{estimatedCost}</Text>
                              <Text>Are you sure you want to burn your tokens? They will be automatically converted into Stellar Wollo Tokens</Text>
                              <View>
                                  <Button titleStyle={styles.buttonTitleStyle} buttonStyle={[styles.buttonStyle, styles.buttonGreen]} onPress={this.onConfirmedSubmitBurn} title="Let's do this" />
                                  <Button titleStyle={styles.buttonTitleStyle} buttonStyle={[styles.buttonStyle, styles.buttonRed]} onPress={this.closeModal} title="No" />
                              </View>
                          </Fragment>
                      }

                      {this.state.modal.message !== 'confirm' && this.state.modal.message !== '' &&
                              <Fragment>
                                  <Text>{this.state.modal.message}</Text>
                              </Fragment>
                      }
                  </View>
              </Modal>
          </ScrollView>
      );
  }
}

export default connect(({user, web3, events, contract, content}) => ({
    user,
    events,
    contract,
    localStorage: content.get('localStorage'),
    web3: web3.instance,
    contentReady: content.get('loaded'),
    loading: events.get('loading')
}), {
    userLogin,
    loadContent,
    changeNetwork,
    checkUserCache,
    loadLocalStorage,
    transfer,
    burn,
},
)(App);
