const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
const Shop = require('./shop').shopSchema;
const Ticket = require('./ticket').ticketSchema;
const Commande = require('./commande').commandeSchema;

const traderSchema = new Schema({

    firstname: {
        type: String,
        trim: true,
        require: true,
    },
    lastname: {
        type: String,
        trim: true,
        require: true,
    },
    email: {
        type: String,
        trim: true,
        require: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String
    },
    password: {
        type: String,
        require: true,
    },
    photo: {
        type: String
    },
    solde: {
        type: String
    },
    resetLink: {
        data: String,
        default: ''
    },


    /*
    adress: {
        type: String
    },
    description: {
        type: String
    },
    paymee_account: {
        type: String
    },
    */
    verified: {
        type: String
    },
    shop: [Shop],
    ticket: [Ticket],
    commande: [Commande],


}, { timestamps: true });


traderSchema.methods.getTrader = function() {
    return ({
        _id: this._id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        phone: this.phone,
        password: this.password,
        photo: this.photo,
        solde: this.solde,
        /*
        adress: this.adress,
        description: this.description,
        paymee_account: this.paymee_account
        */


    })
};
traderSchema.methods.getShop = function() {
    return ({

        shop: this.shop
            /*
            adress: this.adress,
            description: this.description,
            paymee_account: this.paymee_account
            */


    })
};





traderSchema.pre('save', function(next) {
    var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function(err, salt) {
            if (err) {
                return next(err);
            }

            bcrypt.hash(user.password, salt, null, function(err, hash) {
                if (err) {
                    return next(err);
                }
                if (user.password) {
                    user.password = hash;
                }
                next();
            });
        });
    } else {
        return next();
    }
});

traderSchema.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

//const User = module.exports = mongoose.model('User', userSchema);
var traderModel = mongoose.model('Trader', traderSchema);
module.exports = {
    traderModel: traderModel,
    traderSchema: traderSchema
};