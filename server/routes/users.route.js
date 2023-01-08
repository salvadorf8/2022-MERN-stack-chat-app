const router = require('express').Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('../cloudinary');

const User = require('../models/user.model');
const authMiddleware = require('../middlewares/auth.middleware');

// user registration
router.post('/register', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (user) {
            res.status(422).send({
                success: false,
                message: 'User already exists'
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        req.body.password = hashedPassword;

        const newUser = new User(req.body);

        await newUser.save();

        res.send({
            success: true,
            message: 'User created successfully'
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
});

// user login
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.send({
                success: false,
                message: 'User does not exist'
            });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);

        if (!validPassword) {
            return res.send({
                success: false,
                message: 'Invalid password'
            });
        }

        // generated jwts will include an iat (issed at) claim by default unless noTimestamp is specified
        // iat will be used over timestamp
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.send({
            success: true,
            message: 'User logged in successfully',
            data: token
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
});

// get current user
router.get('/get-current-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });

        res.send({
            success: true,
            message: 'User fetched successfully ',
            data: user
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
});

router.get('/get-all-users', authMiddleware, async (req, res) => {
    try {
        const allUsers = await User.find({ _id: { $ne: req.body.userId } });

        res.send({
            success: true,
            message: 'Users fetched successfully',

            data: allUsers
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
});

// update user profile picture
router.post('/update-profile-picture', authMiddleware, async (req, res) => {
    try {
        const image = req.body.image;

        // upload image to cloudinary and get url
        const uploadedImage = await cloudinary.v2.uploader.upload(image, {
            folder: 'chat-app'
        });

        // update user profile picture
        const user = await User.findOneAndUpdate({ _id: req.body.userId }, { profilePic: uploadedImage.secure_url }, { new: true });

        res.send({
            success: true,
            message: 'Profile picture updated successfully',
            data: user
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message
        });
    }
});

module.exports = router;
