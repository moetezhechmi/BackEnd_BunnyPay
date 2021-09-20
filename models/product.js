const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const productSchema = new Schema({
    name: {
        type: String
    },
    price: {
        type: String
    },
    quantite: {
        type: String
    },
    photo: {
        type: String
    },
    category: {
        type: String
    },

    ShopId: {
        type: Schema.ObjectId,
        ref: 'Shop'
    },

});
productSchema.methods.getProduct = function() {
    return ({
        _id: this._id,
        name: this.name,
        price: this.price,
        quantite: this.quantite,
        ShopId: shopId
    })
};
var productModel = mongoose.model('product', productSchema);
module.exports = {
    productModel: productModel,
    productSchema: productSchema
};