const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs')
const UserSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First Name field is required']
    },
    lastName: {
        type: String,
        required: [true, 'Last Name field is required']
    },
    email: {
        type: String,
        required: [true, 'Email field is required']
    },
    password: {
        type: String,
        required: [true, 'Password field is required']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    }
});

UserSchema.pre('save', function(next){
    const user = this;
    if(this.isModified('password') || this.isNew){
        bcryptjs.genSalt(10, function(err, salt){
            if(err){
                return next(err);
            }
            bcryptjs.hash(user.password, salt, function(err, hash){
                if(err){
                    return next(err);
                }
                user.password = hash;
                next();
            });
        });
    }
});

module.exports = mongoose.model('users', UserSchema);