
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCommande = require('./ProductCommande').productCommandeSchema;
 
const commandeSchema = new Schema ({
   
    child : {
        type: Schema.ObjectId,
        ref: 'Child'
    },
    shop : {
        type: Schema.ObjectId,
        ref: 'Shop'
    },
    product: [productCommande],
    date : {
        type: Date,
        default: Date.now()
    },
    total : {
        type: Number,
        
    },
    



});


var commandeModel = mongoose.model('commande', commandeSchema);
module.exports = {
    commandeModel : commandeModel,
    commandeSchema : commandeSchema
};