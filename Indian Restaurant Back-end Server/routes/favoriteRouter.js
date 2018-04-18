const express = require("express");
const bodyPaser = require("body-parser");
const Favorites = require('../models/favorite');
const mongoose = require("mongoose");
const authenticate = require('../authenticate');
const cors = require('../cors');

const favoriteRouter = express();
favoriteRouter.use(bodyPaser.json());

favoriteRouter
.options('*', cors.corsWithOptions, (req, res) => { res.sendStatus(200)})
.get('/', cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : req.user._id})
    .populate('user')
    .populate('dishes')
    .exec((err, favs) => {
        if(err) return next(err);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favs);
    })
})
.post('/', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : req.user._id})
    .then(favs => {
        if(favs){
            for(i = 0; i < req.body.length;i++){
                if(favs.dishes.indexOf(req.body[i]._id) < 0){
                    favs.dishes.push(req.body[i]);
                }
            }
            favs.save()
            .then( fav => {
                console.log("Favorite added " + fav );
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(fav);
            })
            .catch(err => { return next(err)});
        }else{
            Favorites.create({user : req.user._id})
            .then(fav => {
                // console.log("length: " + req.body.length);
                for(i = 0; i < req.body.length;i++){
                    fav.dishes.push(req.body[i]);
                }
                fav.save()
                .then( fav => {
                    console.log("Favorite created");
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                })
                .catch(err => { return next(err)})
            })
            .catch(err => {return next(err)});
        }
    })
    .catch(err => {return next(err)});
})
.put('/', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites/');
})
.delete('/', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({user : req.user._id}, (err, resp) => {
        if(err) return next(err);
        statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(resp);
    });
});

favoriteRouter
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200)})
.get('/:dishId', cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : req.user._id})
    .then( fav => {
        if(!fav) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.json({"exists" : false, "favorites" : fav});
        }else{
            if(fav.dishes.indexOf(req.params.dishId) < 0){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists" : false, "favorites" : fav});
            }else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.json({"exists" : true, "favorites" : fav});
            }
        }
    }, err => {return next(err)})
    .catch(err => {return next(err)});
})
.post('/:dishId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : req.user._id}, (err, fav) => {
        if(err) return next(err);
        if(fav){
            if(fav.dishes.indexOf(req.params.dishId) < 0){
                fav.dishes.push({"_id" : req.params.dishId});
                fav.save()
                .then(fav => {
                    console.log("Favorite created");
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                })
                .catch(err => {return next(err)})
            }
        }else{
            Favorites.create({user : req.user._id})
            .then(fav => {
                fav.dishes.push({"_id" : req.params.dishId});
                fav.save()
                .then(fav => {
                    console.log("Favorite created");
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                })
                .catch(err => {return next(err)})
            })
            .catch(err => {return next(err)});
        }
    })
})
.put('/:dishId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.end('PUT operation not supported on /favorites/:dishId');
})
.delete('/:dishId', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({user : req.user._id}, (err, fav) => {
        if(err) return next(err);

        var index = fav.dishes.indexOf(req.params.dishId);
        if(index >= 0){
            fav.dishes.splice(index, 1);
            fav.save()
            .then(fav => {
                Favorites.findById(fav._id)
                .populate('user')
                .populate('dishes')
                .then(fav => {
                    console.log("Dish" + req.params.dishId + " has been successfully remove from Favorites");
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(fav);
                }, err => {return next(err)})
                .catch(err => {return next(err)});
            })
            .catch(err => {return next(err)});
        }else{
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.end("Dish " + req.params._id + " not included in your Favorites" );
        }
    })
});

module.exports = favoriteRouter;