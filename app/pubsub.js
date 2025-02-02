const redis = require('redis');

const CHANNELS = {
    TEST: 'TEST',
    BLOCKCHAIN: 'BLOCKCHAIN',
    TRANSACTION: 'TRANSACTION'
};

class PubSub {
    constructor ({blockchain, transactionPool, redisUrl}) {
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.publisher = redis.createClient(redisUrl);
        this.subscriber = redis.createClient(redisUrl);

        this.subscribeToChannels();
            

        this.subscriber.on(
            'message',
            (channel, message) => this.handleMessage(channel, message)
        );
    }

    handleMessage(channel, message) {
       console.log(`Message recieved. Channel: ${channel}. Message: ${message}`); 

       const parsedMessage = JSON.parse(message);

       switch(channel) {
           case CHANNELS.BLOCKCHAIN:
                this.blockchain.replaceChain(parsedMessage, true, () => {
                    this.transactionPool.clearBlockchainTransactions({
                        chain: parsedMessage
                    })
                });
                break;
            case CHANNELS.TRANSACTION:
                this.transactionPool.setTransaction(parsedMessage);
                break;
            default:
                return;
       }
    }

    subscribeToChannels() {
        Object.values(CHANNELS).forEach(channel => {
            this.subscriber.subscribe(channel);
        })
    }

    publish({channel, message}) {
        this.subscriber.unsubscribe(channel, () => {
            this.publisher.publish(channel, message, () => {
                this.subscriber.subscribe(channel);
            });
           
        })
        
    }

    broadcastChain() {
        this.publish({
            channel:CHANNELS.BLOCKCHAIN,
            message: JSON.stringify( this.blockchain.chain)
        })
    }

    broadcastTransaction(transaction) {
        this.publish({
            channel: CHANNELS.TRANSACTION,
            message: JSON.stringify(transaction)
        })
    }
}

module.exports = PubSub;



// const PubNub = require('pubnub');
// const credentials = {
//     publishKey: 'pub-c-776bad0d-b1ad-40f7-88da-44449a051d00',
//     subscribeKey: 'sub-c-304e3152-b980-11ea-afa6-debb908608d9',
//     secretKey: 'sec-c-NGQyYmRlNWMtZjkxYS00N2E0LThiNGMtNDgxMjI0MTk5Mjlj'
// };

// const CHANNELS = {
//     TEST: 'TEST',
//     BLOCKCHAIN: 'BLOCKCHAIN',
//     TRANSACTION: 'TRANSACTION'
//   };
  
//   class PubSub {
//     constructor({ blockchain, transactionPool, wallet }) {
//       this.blockchain = blockchain;
//       this.transactionPool = transactionPool;
//       this.wallet = wallet;
  
//       this.pubnub = new PubNub(credentials);
  
//       this.pubnub.subscribe({ channels: Object.values(CHANNELS) });
  
//       this.pubnub.addListener(this.listener());
//     }
  
//     broadcastChain() {
//       this.publish({
//         channel: CHANNELS.BLOCKCHAIN,
//         message: JSON.stringify(this.blockchain.chain)
//       });
//     }
  
//     broadcastTransaction(transaction) {
//       this.publish({
//         channel: CHANNELS.TRANSACTION,
//         message: JSON.stringify(transaction)
//       });
//     }
  
//     subscribeToChannels() {
//       this.pubnub.subscribe({
//         channels: [Object.values(CHANNELS)]
//       });
//     }
  
//     listener() {
//       return {
//         message: messageObject => {
//           const { channel, message } = messageObject;
  
//           console.log(`Message received. Channel: ${channel}. Message: ${message}`);
//           const parsedMessage = JSON.parse(message);
  
//           switch(channel) {
//             case CHANNELS.BLOCKCHAIN:
//               this.blockchain.replaceChain(parsedMessage, true, () => {
//                 this.transactionPool.clearBlockchainTransactions(
//                   { chain: parsedMessage.chain }
//                 );
//               });
//               break;
//             case CHANNELS.TRANSACTION:
//               if (!this.transactionPool.existingTransaction({
//                 inputAddress: this.wallet.publicKey
//               })) {
//                 this.transactionPool.setTransaction(parsedMessage);
//               }
//               break;
//             default:
//               return;
//           }
//         }
//       }
//     }
  
//     publish({ channel, message }) {
//       // there is an unsubscribe function in pubnub
//       // but it doesn't have a callback that fires after success
//       // therefore, redundant publishes to the same local subscriber will be accepted as noisy no-ops
//       this.pubnub.publish({ message, channel });
//     }
  
//     broadcastChain() {
//       this.publish({
//         channel: CHANNELS.BLOCKCHAIN,
//         message: JSON.stringify(this.blockchain.chain)
//       });
//     }
  
//     broadcastTransaction(transaction) {
//       this.publish({
//         channel: CHANNELS.TRANSACTION,
//         message: JSON.stringify(transaction)
//       });
//     }
//   }
  
//   module.exports = PubSub;