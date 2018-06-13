import Config from 'react-native-config';

export const ENV = Config.NETWORK || 'ropsten';
export const NUM_VALIDATIONS = Config.VALIDATIONS || 7;
