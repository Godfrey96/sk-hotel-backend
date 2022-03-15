import exporess from 'express-async-handler';
import mongoose from 'mongoose';
import express from 'express';
import multer from 'multer';
import Room from '../models/roomModel.js';
import Category from '../models/categoryModel.js';

const router = express.Router();

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
};

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype];
        let uploadError = new Error('invalid image type');

        if (isValid) {
            uploadError = null;
        }
        cb(uploadError, 'uploads/');
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-');
        const extension = FILE_TYPE_MAP[file.mimetype];
        cb(null, `${fileName}-${Date.now()}.${extension}`);
    }
});

const uploadOptions = multer({ storage: storage });

// Create a new room
router.post('/', uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const file = req.file;
    if (!file) {
        return res.status(400).send('No image in the request');
    }

    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get('host')}/uploads/`;

    let room = new Room({
        name: req.body.name,
        description: req.body.description,
        image: `${basePath}${fileName}`,
        price: req.body.price,
        category: req.body.category,
        countInStock: req.body.countInStock,
        fromDate: req.body.fromDate,
        toDate: req.body.toDate,
    });

    room = await room.save();

    if (!room) return res.status(500).send('The room cannot be created');

    res.send(room);
});

// update an existing room
router.put('/:id', uploadOptions.single, async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Room Id');
    }
    const category = await Category.findById(req.body.category);
    if (!category) return res.status(400).send('Invalid Category');

    const room = await Room.findById(req.params.id);
    if (!room) return res.status(400).send('Invalid Room!');

    const file = req.file;
    let imagepath;

    if (file) {
        const fileName = file.filename;
        const basePath = `${req.protocol}://${req.get('host')}/uploads/`;
        imagepath = `${basePath}${fileName}`;
    } else {
        imagepath = room.image;
    }

    const updateRoom = await Room.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            description: req.body.description,
            image: imagepath,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            fromDate: req.body.fromDate,
            toDate: req.body.toDate,
        },
        { new: true }
    );

    if (!updateRoom) return res.status(500).send('the room cannot be updated!');

    res.send(updateRoom);
});

// Fetch all rooms
router.get('/', async (req, res) => {
    let filter = {};
    if (req.query.categories) {
        filter = { category: req.query.categories.split(',') };
    }

    const roomList = await Room.find(filter).populate('category');

    if (!roomList) {
        res.status(500).json({ success: false });
    }
    res.send(roomList);
});

// Fetch single room
router.get(`/:id`, async (req, res) => {
    const room = await Room.findById(req.params.id).populate('category');

    if (!room) {
        res.status(500).json({ success: false });
    }
    res.send(room);
});

// Delete a room
router.delete('/:id', (req, res) => {
    Room.findByIdAndRemove(req.params.id)
        .then((room) => {
            if (room) {
                return res.status(200).json({
                    success: true,
                    message: 'the room is deleted!'
                });
            } else {
                return res.status(404).json({ success: false, message: 'room not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
});

// get room count
router.get(`/get/count`, async (req, res) => {
    // const roomCount = await Room.countDocuments((count) => count);
    const roomCount = await Room.countDocuments({});

    if (!roomCount) {
        res.status(500).json({ success: false });
    }
    res.send({
        roomCount: roomCount
    });
});

// get latest four rooms
router.get(`/get/rooms/:count`, async (req, res) => {
    const count = req.params.count ? req.params.count : 0;
    const rooms = await Room.find().limit(+count).sort({ 'dateOrdered': -1 });

    if (!rooms) {
        res.status(500).json({ success: false });
    }
    res.send(rooms);
});

export default router