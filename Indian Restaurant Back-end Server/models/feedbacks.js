const mongoose = require('mongoose');
const schema = mongoose.Schema;

var FeedbackInfoSchema = new schema({
    firstname : {
        type : String
    },
    lastname : {
        type : String
    },
    telnum : {
        type : String
    },
    email : {
        type : String
    },
    agree : {
        type : Boolean
    },
    contacttype : {
        type : String
    },
    message : {
        type : String
    }
},{
    timestamps : true
});

var FeedbackSchema = new schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        require : true
    },
    feedbackInfo : [FeedbackInfoSchema]
},{
    timestamps : true
});

module.exports = mongoose.model('Feedback', FeedbackSchema);