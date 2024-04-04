const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const logger = require('../logger');
const connectDB = require('../models/db');
const { body, validationResult } = require('express-validator');

const JWT_SECRET = process.env.JWT_SECRET;
const extractdb = async () => {
    const db = await connectDB();
    const collection = db.collection('users');
    return { db, collection };
}

router.post('/register',
//validate request body
[
    body('email').isEmail().withMessage('Invalid email'),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one symbol'),
], async (req, res, next) => {
    logger.info('POST /register');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors: ', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {collection} = await extractdb();
        const {email, password} = req.body;
        //check if user already exists
        const emailExists = await collection.findOne({ email });
        if (emailExists){
            logger.error('User already exists');
            return res.status(400).json({error: 'Email already exists'});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = { email, password: hashedPassword, createdAt: new Date()};
        const result = await collection.insertOne(user);
        const token = jwt.sign({id: result.insertedId.toString()}, JWT_SECRET, {expiresIn: '1h'});
        logger.info('User registered successfully');
        res.status(201).json({token});
    } catch (error) {
        logger.error(`Error registering user: ${error}`)
        next(error);
    }
});

router.post('/login',
//validate email and password
[
    body('email').isEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res, next) => {
    logger.info('POST /login');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors: ', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {collection} = await extractdb();
        const {email, password} = req.body;
        const user = await collection.findOne({email});
        if (!user){
            logger.error('User not found');
            return res.status(404).json({error: 'User not found'});
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch){
            logger.error('Invalid password');
            return res.status(401).json({error: 'Invalid password'});
        }
        const token = jwt.sign({id: user._id.toString()}, JWT_SECRET, {expiresIn: '1h'});
        logger.info('User logged in successfully');
        return res.status(200).json({token});
    } catch (error) {
        logger.error(`Error logging in user: ${error}`)
        next(error);
    }
});

router.put('/update',[body('email').isEmail().withMessage('Invalid email')], async (req, res, next) => {
    logger.info('PUT /update');
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.error('Validation errors: ', errors.array());
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const {collection} = await extractdb();
        const {email, password} = req.body;
        const user = await collection.findOne({email});
        if (!user){
            logger.error('User not found');
            return res.status(404).json({error: 'User not found'});
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const result = await collection.updateOne({email}, {$set: {password: hashedPassword}});
        if (result.modifiedCount === 0){
            logger.error('Failed to update user');
            return res.status(500).json({error: 'Failed to update user'});
        }
        logger.info('User updated successfully');
        return res.status(200).json('User updated successfully');
    } catch (error) {
        logger.error(`Error updating user: ${error}`)
        next(error);
    }
});

module.exports = router;