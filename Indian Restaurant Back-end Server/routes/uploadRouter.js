const express = require("express");
const bodyPaser = require("body-parser");
const authenticate = require('../authenticate');
const multer = require("multer");
const cors = require('../cors');
const uploadRouter = express();
uploadRouter.use(bodyPaser.json());

const storage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename : (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if(!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    cb(null, true);
};

const upload = multer({storage : storage, fileFilter : imageFileFilter});

uploadRouter.route("/")
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)})
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Get operation not support on /imageUpload");
})
.post(cors.corsWithOptions, authenticate.verifyUser, upload.single('imageFile'),(req, res, next) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json(req.file);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Put operation not support on /imageUpload");
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("Delete operation not support on /imageUpload");
})

module.exports = uploadRouter;
