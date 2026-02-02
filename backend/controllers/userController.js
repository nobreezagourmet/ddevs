const asyncHandler = require('express-async-handler');
const generateToken = require('../utils/generateToken');
const User = require('../models/User');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(401).json({ success: false });
        }
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false, 
            message: error.message || 'Authentication failed' 
        });
    }
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists'
            });
        }

        const user = await User.create({
            name,
            email,
            phone,
            password,
        });

        if (user) {
            return res.status(201).json({ 
                success: true,
                message: 'User created successfully',
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user._id, user.isAdmin)
                }
            });
        } else {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid user data'
            });
        }
    } catch (error) {
        return res.status(error.status || 500).json({ 
            success: false, 
            message: error.message || 'Registration failed' 
        });
    }
});

module.exports = { authUser, registerUser };