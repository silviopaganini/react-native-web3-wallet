import React from 'react';
import {StyleSheet, View, Modal, Text} from 'react-native';
import PropTypes from 'prop-types';

const Loading = ({message}) => (
    <Modal transparent visible={!!message} style={styles.container}>
        <View style={styles.inner}>
            <View style={styles.innerContainer}>
                <Text style={styles.h1}>{message}</Text>
            </View>
        </View>
    </Modal>
);

Loading.propTypes = {
    message: PropTypes.string
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    inner: {
        backgroundColor: 'rgba(0, 0, 0, .8)',
        justifyContent: 'center',
        flex: 1,
        padding: 20,
    },
    innerContainer: {
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center'
    },
    h1: {
        fontSize: 20,
        fontWeight: 'bold',
        padding: 10,
        justifyContent: 'center',
        color: 'black'
    }
});

export default Loading;
