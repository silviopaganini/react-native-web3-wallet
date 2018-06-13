import {AsyncStorage} from 'react-native';

const getKey = key => `@PigzbeStore:${key}`;

export const load = async key => {
    let value = null;

    try {
        value = await AsyncStorage.getItem(getKey(key));
        if (value) {
            value = JSON.parse(value);
        }
    } catch (error) {
        console.error(error);
    }

    return value && typeof value === 'object' ? value : {};
};

export const save = async (key, ob) => {
    try {
        await AsyncStorage.setItem(getKey(key), JSON.stringify(ob));
    } catch (error) {
        console.error(error);
    }
};

export const clear = async key => {
    await AsyncStorage.removeItem(getKey(key));
};
