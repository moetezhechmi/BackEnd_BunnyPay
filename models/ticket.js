const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 
const ticketSchema = new Schema ({
   code: {
        type: String
    },
    montant: {
        type: String
    },
    
     used: {
        type: String
    },
    
    Owner : {
        type: Schema.ObjectId,
        ref: 'Trader'
    },

});

ticketSchema.methods.getShop=function () {
    return({
        _id: this._id,
        code: this.code,
        montant: this.montant,
        used: this.used,
        Owner: traderId

    })
};

var ticketModel = mongoose.model('ticket', ticketSchema);
module.exports = {
    ticketModel : ticketModel,
    ticketSchema : ticketSchema
};