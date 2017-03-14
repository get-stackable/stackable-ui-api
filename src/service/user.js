import mongoose from 'mongoose-fill';

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: false,
        index: true,
    },
    password: {
        type: String,
        required: true,
    },
}, {
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt',
    },
});

export default mongoose.model('User', UserSchema);


// const users = [
//     'ava',
//     'boyd',
//     'raylan',
//     'winona',
// ];
//
// export const getUsers = () => users;
//
// export const getFirstUser = () => users[0];
