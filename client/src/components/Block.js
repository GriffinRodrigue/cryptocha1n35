import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction'

class Block extends Component {
    state = { displayTransaction: false};

    toggleTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction});
    }

    get displaceTransaction () {
        const { data} = this.props.block;

        
        const striginfiedData = JSON.stringify(data);

        const dataDisplay = striginfiedData.length > 35 ?
         `${striginfiedData.substring(0,35)}...`:
         striginfiedData;

        if (this.state.displayTransaction) {
            return (
                <div>
                    {
                        data.map(transaction => (
                            <div key={transaction.id}>
                                <hr />
                                <Transaction transaction = {transaction}/>
                            </div>
                        ))
                    }
                <br />
                <Button 
                     bsStyle = "danger" 
                     bsSize="small" 
                     onClick={this.toggleTransaction}
                 >
                     Show Less
                 </Button>
                </div>
            )
        }
       
         return (<div>
             <div>Data: {dataDisplay}</div>
             <Button 
             bsStyle = "danger" 
             bsSize="small" 
             onClick={this.toggleTransaction}
             >
                 Show More
                 </Button>
             </div>);

    }



    render () {
      const { timestamp, hash } = this.props.block;
      
      const hashDisplay = `${hash.substring(0, 15)}...`;

       return (
           <div className = 'Block'>
               <div>Hash: {hashDisplay}</div>
               <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
               {this.displaceTransaction}
           </div>
       );
    }
};

export default Block;