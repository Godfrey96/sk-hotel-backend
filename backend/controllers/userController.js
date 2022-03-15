import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import User from '../models/userModel.js';

// register a new user
const registerUser = asyncHandler(async (req, res) => {
    let user = new User({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
    });

    const userExists = await User.findOne({ email: req.body.email });
    if (userExists) {
        res.status(400)
        throw new Error('User already exists')
    }

    user = await user.save();

    if (!user) {
        return res.status(400).send('the user cannot be created!');
    }
    res.send(user);
});

// Login user & get token
const loginUser = asyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.JWT_SECRET;

    if (!user) {
        return res.status(400).send('The user not found');
    }

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        res.json({
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            token: generateToken(user._id)
        });
    } else {
        res.status(401)
        throw new Error('Invalid email or password')
    }
});

// update an existing user
const updateUser = asyncHandler(async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword
    if (req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(req.params.id,
        {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
        },
        { new: true }
    )
    if (!user) {
        return res.status(404).send('the user cannot be updated!');
    }
    res.send(user);
})

// Fetch all users
const getUsers = asyncHandler(async (req, res) => {
    const userList = await User.find().select('-passwordHash');

    if (!userList) {
        res.status(500).json({ success: false })
    }
    res.status(200).send(userList)
})

// get single user
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
        res.status(500).json({ message: 'The user with the given ID was not found.' });
    }
    res.status(200).send(user);
})

// Delete user
const deleteUser = asyncHandler(async (req, res) => {
    User.findByIdAndRemove(req.params.id).then(user => {
        if (user) {
            return res.status(200).json({ success: true, message: 'the user is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'user not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: err })
    })
})

// Get users count
const GetUserCount = asyncHandler(async (req, res) => {
    const userCount = await User.countDocuments({})

    if (!userCount) {
        res.status(500).json({ success: false })
    }
    res.send({
        userCount: userCount
    });
})

export {
    registerUser,
    loginUser,
    updateUser,
    getUserById,
    getUsers,
    deleteUser,
    GetUserCount
}