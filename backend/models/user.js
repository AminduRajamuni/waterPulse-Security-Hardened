import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    // Not required at the schema level: Google-only accounts have no password.
    // The password/email register() flow still enforces this itself.
    password: { type: String, required: false, default: null },
    role: {
        type: String,
        enum: ['citizen', 'authority', 'admin'],
        default: 'citizen'
    },
    // Set when this account was linked to (or created via) Google Sign-In.
    googleId: { type: String, unique: true, sparse: true },
    phoneNumber: {
        type: String,
        required: false,
        unique: true,
        sparse: true, // allows multiple users without a phone number (e.g. Google sign-ups)
        validate: {
            validator: function(v) {
                if (!v) return true;
                // Sri Lankan mobile number regex: allows 0 or +94 prefix and ensures 10 digits
                return /^(?:0|94|\+94)?7(?:0|1|2|4|5|6|7|8)\d{7}$/.test(v);
            },
            message: props => `${props.value} is not a valid Sri Lankan phone number!`
        }
    },
    location: {
        city: String,
        district: String 
    },
    joinedAt: { type: Date, default: Date.now }
});

const User = mongoose.model("User", userSchema);
export default User;
