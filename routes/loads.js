const express = require('express');
const router = express.Router();
const logger = require('../logger');
const connectDB = require('../models/db');
const { ObjectId } = require('mongodb');
const authorize = require('../middleware/authorize');

const extractdb = async () => {
    const db = await connectDB();
    const collection = db.collection('loads');
    return { db, collection };
}

//get all loads
router.get('/', async (req, res, next) => {
    logger.info('GET /loads');
    try {
        const { collection } = await extractdb();
        const loads = await collection.find({}).toArray();
        if (loads.length === 0) {
            res.status(200).send('There are no loads available at this time');
            return;
        }
        res.status(200).json(loads);
    } catch (error) {
        logger.error('Something went wrong: ', error);
        next(error);
    }

});

//get load by id
router.get('/:id', async (req, res, next) => {
    logger.info('GET /loads/:id');
    try {
        const { collection } = await extractdb();
        const load = await collection.findOne({ _id: new ObjectId(req.params.id) });
        console.log(req.params.id);
        console.log(load);
        if (!load) {
            res.status(404).send('Load not found');
            return;
        }
        res.status(200).json(load);
    } catch (error) {
        logger.error('Something went wrong: ', error);
        next(error);
    }
});


//create a new load
router.post('/', authorize, async (req, res, next) => {
    logger.info('POST /loads');
    try {
        const { collection } = await extractdb();
        const load = req.body;
        if( !load.origin || !load.destination || !load.product || !load.weight || !load.type){
            logger.error('Missing required fields');
            return res.status(400).json({error: 'Missing required fields'});
        }
        const dateAdded = Math.floor(new Date().getTime() / 1000)
        load.dateAdded = dateAdded;
        const result = await collection.insertOne(load);
        if (result.insertedId === null) {
            res.status(500).send('Failed to create load');
            return;
        }
        res.status(201).json('load created');
    } catch (error) {
        logger.error('Something went wrong: ', error);
        next(error);
    }
});

//update a load
router.put('/:id', authorize, async (req, res, next) => {
    logger.info('PUT /loads/:id');
    try {
        const { collection } = await extractdb();
        const load = req.body;
        if( !load.origin || !load.destination || !load.product || !load.weight || !load.type){
            logger.error('Missing required fields');
            return res.status(400).json({error: 'Missing required fields'});
        }
        const result = await collection.updateOne({ _id: new ObjectId(req.params.id) }, { $set: load });
        console.log(result.modifiedCount);
        if (result.modifiedCount === 0) {
            res.status(500).send('Failed to update load');
            return;
        }
        res.status(200).json('load updated');
    } catch (error) {
        logger.error('Something went wrong: ', error);
        next(error);
    }
});

//delete a load

router.delete('/:id', authorize, async (req, res, next) => {
    logger.info('DELETE /loads/:id');
    try {
        const { collection } = await extractdb();
        const result = await collection.deleteMany({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) {
            res.status(500).send('Failed to delete load');
            return;
        }
        res.status(200).json('load deleted');
    } catch (error) {
        logger.error('Something went wrong: ', error);
        next(error);
    }
});

module.exports = router;