const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const { Schema } = mongoose;
const app = express();

app.use(bodyParser.urlencoded({extended: true}));
//app.use(express.static("public"));

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/interviewTest", {useNewUrlParser: true, useUnifiedTopology: true});

//-----------------------------candidate Schema-------------------------------------------------////////
const candidateSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
     name: {type: String},
     emailAddress: {type: String},
     firstRound : {type: Number},
     secondRound : {type: Number},
     thirdRound : {type: Number},
     averageScore : {type: Number}
}
    ,
    { collection: 'candidates' }
    );


const Candidate = mongoose.model('candidates', candidateSchema);

//-----------------------------------API for Candidate------------------------------------------------//////

app.route("/candidate")

 .get(function(req, res){
    Candidate.find(function(err, foundCandidate){
    if (!err) {
      res.send(foundCandidate);
  }
    else{
      res.send(err);
    }
  });
  })

 .post(function(req, res)
   {
     const newCandidate = new Candidate({
        _id:new mongoose.Types.ObjectId(),
        name:req.body.name,
        emailAddress:req.body.emailAddress,
        firstRound : req.body.firstRound ,
        secondRound : req.body.secondRound,
        thirdRound : req.body.thirdRound,
        averageScore : req.body.averageScore
        

     });
     newCandidate.save(function(err){
       if (!err) {
         res.send("Successfully Added a new Candidate.");
       }
       else{
         res.send(err);
       }
     });
   });

   //-----------------------------API TO GET AVERAGE SCORE-----------------------------------//

app.route("/averageScore")
.get(function(req, res){

    Candidate.aggregate([{ $group : {
       _id:"$id", 
       average_Score_firstRound : { $avg: "$firstRound" },
       average_Score_secondRound : { $avg: "$secondRound" }, 
       average_Score_thirdRound : { $avg: "$thirdRound" }}}],
    
   function(err, found){

  if(found){
    res.send(found);
  }
  else{
    res.send("Average score was not found.");
  }
});
});

//-----------------------------API TO GET HIGHEST SCORE-----------------------------------//
app.route("/highestScore")
.get(function(req, res){

    Candidate.aggregate([{$group : { 
      _id:null, 
      highestScore: { $max : { $sum: ["$firstRound","$secondRound","$thirdRound"]} },
      
    }}

],
    
   function(err, found){

  if(found){
    res.send(found);
  }
  else{
    res.send("highest score was not match.");
  }
});
}); 

//-----------------------------API TO GET TOTAL SCORE-----------------------------------//

app.route("/totalscoreallCandidate")
.get(function(req, res){

    Candidate.aggregate([{ $project:  {
       name:"$name",
       emailAddress:"$emailAddress",
       totalScore: { $max : { $sum: ["$firstRound","$secondRound","$thirdRound"]} },
      averageScore:{$max : { $avg: ["$firstRound","$secondRound","$thirdRound"]}}
      }}
],
    
   function(err, found){

  if(found){
    res.send(found);
  }
  else{
    res.send("Highest Score All candidate was not found.");
  }
});
});


app.listen(8080, function() {
  console.log("Server started on port 8080");
});
