const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + file.originalname;
        cb(null, uniqueName);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Only JPEG and PNG files allowed'), false);
    }
};

const upload = multer({
    storage, // file storage configuration
    fileFilter, // setting restrictions
    limits: { fileSize: 5 * 1024 * 1024 } // size limiting
});

module.exports = upload;