const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
const Child = require('./child').childSchema;

const parentSchema = new Schema({

    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    phone: {
        type: String
    },
    password: {
        type: String
    },
    photo: {
        type: String
    },
    solde: {
        type: String
    },
    verified: {
        type: String
    },
    child: [Child],
});

parentSchema.methods.getParent = function() {
    return ({
        _id: this._id,
        firstname: this.firstname,
        lastname: this.lastname,
        email: this.email,
        phone: this.phone,
        password: this.password,
        photo: this.photo,
        solde: this.solde


    })
};

parentSchema.methods.getShortInfoUser = function() {
    return ({
        email: this.email

    })
};



parentSchema.pre('save', function(next) {
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

parentSchema.methods.comparePassword = function(passw, cb) {
    bcrypt.compare(passw, this.password, function(err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};

//const User = module.exports = mongoose.model('User', userSchema);
var parentModel = mongoose.model('Parent', parentSchema);
module.exports = {
    parentModel: parentModel,
    parentSchema: parentSchema
};