const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Product = require('./product').productSchema;
 
const shopSchema = new Schema ({
   name: {
        type: String
    },
    description: {
        type: String
    },
    latitude: {
        type: String
    },
     longitude: {
        type: String
    },
     street: {
        type: String
    },
    town: {
        type: String
    },
    governorate: {
        type: String
    },
    logo:{
        type: String
    },
    
    Owner : {
        type: Schema.ObjectId,
        ref: 'Trader'
    },

    product: [Product],
});

shopSchema.methods.getShop=function () {
    return({
        _id: this._id,
        name: this.name,
        description: this.description,
        latitude: this.latitude,
        longitude: this.longitude,
        street: this.street,
        town: this.town,
        governorate: this.governorate,
        Owner: traderId

    })
};

var shopModel = mongoose.model('shop', shopSchema);
module.exports = {
    shopModel : shopModel,
    shopSchema : shopSchema
};