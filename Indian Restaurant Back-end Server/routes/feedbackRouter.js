const express = require("express");
const bodyPaser = require("body-parser");
const Feedbacks = require('../models/feedbacks');
const mongoose = require("mongoose");
const authenticate = require('../authenticate');
const cors = require('../cors');

const feedbackRouter = express();
feedbackRouter.use(bodyPaser.json());

feedbackRouter
.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200)})
.get('/', cors.cors, authenticate.verifyUser, (req, res, next) => {
    Feedbacks.findOne({user : req.user._id})
    .exec((err, fbs) => {
        if(err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fbs);
    })
})

.post('/', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Feedbacks.findOneAndRemove({user : req.user._id}, (err, resp) => {
        if(err) return next(err);
        Feedbacks.findOne({user : req.user._id})
        .then(fbs => {
            if(fbs){
            fbs.feedbackInfo.push(req.body);
            fbs.save()
            .then( fbs => {
                console.log("Feedback added " + fbs );
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fbs);
            })
            .catch(err => { return next(err)});
            }else{
                Feedbacks.create({user : req.user._id})
                .then(fbs => {
                    fbs.feedbackInfo.push(req.body);
                    fbs.save()
                    .then( fbs => {
                        console.log("Feedback created");
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(fbs);
                    })
                    .catch(err => { return next(err)})
                })
                .catch(err => {return next(err)});
            }
        })
        .catch(err => {return next(err)});
    });
})

.put('/', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites/');
})

.delete('/', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Feedbacks.findOneAndRemove({user : req.user._id}, (err, resp) => {
        if(err) return next(err);
        statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    });
});

module.exports = feedbackRouter;