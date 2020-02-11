let passport = require('passport');
let User = require('../models/user');
let LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator');

passport.use('local.signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    }, (req, email, password, done) => {
        done('blah');

        
        

        
    }
));