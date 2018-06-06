import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {
    Button,
    FormLabel,
    FormInput,
    FormValidationMessage
} from 'react-native-elements';
import {Text, Modal, StyleSheet, View, ScrollView, Linking} from 'react-native';
import {utils} from 'web3';
import {
    userLogin,
    // getActivity
} from '../../actions/eth';
import {transfer, burn, changeNetwork} from '../../actions/contract';
import {checkUserCache} from '../../actions/eth';
import {loadContent} from '../../actions/content';
import {
    clear,
    load
} from '../../utils/storage';
import Loading from '../loading';
import Network from '../network';

class App extends Component {

  state = {
      burnInput: '5',
      transactionHash: null,
      mnemonic: 'elephant merit raven monkey path outer paddle bounce exist fringe pet dry',
      pk: '0x798D23d6a84b2EF7d23c4A25735ED55B72072c24',
      errorImportingAccount: false,
      modal: {
          visible: false,
          message: '',
      },
      estimatedCost: null
  }

  async componentDidMount() {
      // clear('burning');
      this.loadedInfo = await load('burning');
      console.log(this.loadedInfo);
      this.props.loadContent();
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

  async componentWillReceiveProps () {
      this.loadedInfo = await load('burning');
      if (this.loadedInfo.started && this.loadedInfo.value) {
          this.setState({
              burnInput: this.loadedInfo.value,
              disableBurnInput: true
          });
      }

      if (this.loadedInfo.transactionHash) {
          this.setState({
              transactionHash: this.loadedInfo.transactionHash
          });
      }
  }

  onSubmitBurn = async () => {
      const {contract, user} = this.props;
      const {burnInput} = this.state;

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
          transactionHash
      } = this.state;
      const {
          loading,
          contract,
          user,
          events,
          web3,
          contentReady,
      } = this.props;


      if (!contentReady || !this.loadedInfo) {
          return (
              <View style={styles.loading}>
                  <Text>Loading</Text>
              </View>
          );
      }

      const stellar = (this.loadedInfo.stellar && this.loadedInfo.started) ? this.loadedInfo.stellar : (user.stellar ? user.stellar : null);

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

                  {this.loadedInfo.complete && this.loadedInfo.started &&
                      <View style={styles.subSectionView}>
                          <Text style={styles.subSectionHeading}>Your tokens were already burned</Text>
                          <Text>Check your information below</Text>
                      </View>
                  }

                  {!this.loadedInfo.complete && this.loadedInfo.started &&
                      <View style={styles.subSectionView}>
                          <Text>Your burning process has already started, click on the button below to resume the process</Text>
                          <Button titleStyle={styles.buttonTitleStyle} buttonStyle={styles.buttonStyle} onPress={this.onSubmitBurn} title="Resume process"/>
                      </View>
                  }

                  {!this.loadedInfo.complete && !this.loadedInfo.started && user.balance > 0 && user.coinbase.toLowerCase() !== contract.owner.toLowerCase() &&
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
                          <Text>{transactionHash || events.get('transactionHash')}</Text>
                          <Text style={styles.subSectionHeading}>Stellar Account</Text>
                          <Text>Secret Key: {stellar.sk}</Text>
                          <Text>Public Key: {stellar.pk}</Text>
                          {this.loadedInfo.complete && <Button titleStyle={styles.buttonTitleStyle} buttonStyle={styles.buttonStyle} onPress={() => {
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
    },
    tokenTitle: {
        marginTop: 20,
        fontSize: 22,
    },
    inputTextArea: {
        marginBottom: 20,
    },
    modalConfirm: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    modalTitleCost: {
        marginBottom: 30,
    },
    buttonGreen: {
        width: 200,
        alignSelf: 'center',
        backgroundColor: 'green',
        marginBottom: 10,
    },
    buttonRed: {
        width: 200,
        alignSelf: 'center',
        backgroundColor: 'red'
    },
    inputFieldTextArea: {
        maxWidth: '95%',
        marginTop: 8,
        paddingBottom: 8,
        color: 'black'
    },
    importAccountButton: {
        alignSelf: 'center',
        width: 200
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

export default connect(({user, web3, events, contract, content}) => ({
    user,
    events,
    contract,
    web3: web3.instance,
    contentReady: content.get('loaded'),
    loading: events.get('loading')
}), {
    userLogin,
    loadContent,
    changeNetwork,
    checkUserCache,
    transfer,
    burn,
},
)(App);
