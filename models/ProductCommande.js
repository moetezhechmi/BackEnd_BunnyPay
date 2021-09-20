const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productCommandeSchema = new Schema({
    quantite: {
        type: String
    },
    prod:{
        type: Schema.ObjectId,
        ref: 'product'
    }
});

var productCommandeModel = mongoose.model('ProductCommande', productCommandeSchema);
module.exports = {
    productCommandeModel: productCommandeModel,
    productCommandeSchema: productCommandeSchema
};