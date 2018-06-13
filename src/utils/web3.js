import {ENV} from '../constants/config';

export const watchConfirmations = ({
    web3,
    transactionHash,
    validations,
    onValidatedBlock,
}) => new Promise((resolve, reject) => {
    let loop = 0;
    let timeout = 0;
    let validatedBlocks = 0;

    const checkConfirmations = async (receipt) => {
        clearTimeout(timeout);
        timeout = 0;
        const blockNumber = await web3.eth.getBlockNumber();
        if (blockNumber - receipt.blockNumber > validatedBlocks) {
            validatedBlocks = blockNumber - receipt.blockNumber;
            if (onValidatedBlock) {
                onValidatedBlock(validatedBlocks);
            }
        }

        if (ENV === 'local') {
            resolve(receipt);
            return;
        }

        if (validatedBlocks >= validations) {
            resolve(receipt);
            return;
        }

        loop++;
        timeout = setTimeout(checkConfirmations, 2000, receipt);
    };

    const loopCheckConfirmation = async () => {
        clearTimeout(timeout);
        timeout = 0;
        console.log('loopCheckConfirmation');
        console.log(loop);

        try {
            const receipt = await web3.eth.getTransaction(transactionHash);
            console.log(receipt);
            if (receipt.blockNumber) {
                loop = 0;
                clearTimeout(timeout);
                checkConfirmations(receipt);
                // const blockNumber = await web3.eth.getBlockNumber();
                // console.log(blockNumber, receipt.blockNumber, blockNumber - receipt.blockNumber);
            } else {
                loop++;
                timeout = setTimeout(loopCheckConfirmation, 2000);
            }
        } catch (e) {
            console.log(e);
            reject(e);
        }
    };

    loopCheckConfirmation();
});
