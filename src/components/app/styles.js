import { StyleSheet } from 'react-native';
export default StyleSheet.create({
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
