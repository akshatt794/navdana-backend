const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    DOB: {
        type: Date,
    },

    // always customer cahnges applicable only database level
    role: {
        type: String,
        enum: ['customer', 'manager', 'admin'],
        default: 'customer'
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address']
    },

    phoneNumber: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
                return /^\d{10}$/.test(v); // Adjust for your country
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },

    orders: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order'
        }
    ]

}, { timestamps: true });

// Pre middleware function save
userSchema.pre("save", async function (next) {
    const thisUser = this;
    if (!thisUser.isModified("password")) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPwd = await bcrypt.hash(thisUser.password, salt);

        thisUser.password = hashedPwd;
        next(); //move on to mongoose to do db operation
    } catch (err) {
        next(err);
    }

});

userSchema.pre("findOneAndUpdate", async function (next) {
    const update = this.getUpdate();

    if (update.password) {
        try {
            const salt = await bcrypt.genSalt(10);
            const hashedPwd = await bcrypt.hash(update.password, salt);
            update.password = hashedPwd;
        } catch (err) {
            return next(err);
        }
    }

    next();
});

userSchema.methods.comparePassword = async function (mypwd) {
    try {
        const isMatch = await bcrypt.compare(mypwd, this.password);
        return isMatch;
    } catch (err) {
        throw err;
    }
}

const User = mongoose.model("Users", userSchema);

module.exports = User;

