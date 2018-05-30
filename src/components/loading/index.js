import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import PropTypes from 'prop-types';

const Loading = ({message}) => {
    if (!message) {
        return null;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>{message}</Text>
        </View>
    );
};

Loading.propTypes = {
    message: PropTypes.string
};

const styles = StyleSheet.create({
    container: {
      zIndex: 1000,
        backgroundColor: 'rgba(0, 0, 0, .8)',
        justifyContent: 'center',
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
    },
    h1: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10,
        color: 'white'
    }
});

export default Loading;
