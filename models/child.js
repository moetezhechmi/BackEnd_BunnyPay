const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const childSchema = new Schema({
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    age: {
        type: String
    },
    sexe: {
        type: String
    },
    etat: {
        type: String
    },
    accepted: {
        type: String
    },

    solde: {
        type: String
    },
    photo: {
        type: String
    },
    tagId: {
        type: String
    },


    hisParent: {
        type: Schema.ObjectId,
        ref: 'Parent'
    },





});

childSchema.methods.getComments = function() {
    return ({
        _id: this._id,
        firstname: this.firstname,
        lastname: this.lastname,
        age: this.age,
        sexe: this.sexe,
        etat: this.etat,
        accepted: this.accepted,
        hisParent: parentId

    })
};

var childModel = mongoose.model('child', childSchema);
module.exports = {
    childModel: childModel,
    childSchema: childSchema
};