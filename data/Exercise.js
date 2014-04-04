var async = require('async');

var conn = require(process.env.DATA_CONN);
var model = require(process.env.MODELS);
var difficulty = require(process.env.DATA_DIFFICULTY);
var musclegroup = require(process.env.DATA_MUSCLEGROUP);
var name = require(process.env.DATA_NAME);
var video = require(process.env.DATA_VIDEO);
var photo = require(process.env.DATA_PHOTO);

exports.getN = getN;
function getN(n,cb){
  conn.query('SELECT * FROM exercises LIMIT $1',[n],function(err,result){
    if(err){
      cb(err,undefined);
    }
    else{
      resultToExercises(result,cb);
    }
  });
}
function resultToExercises(result,cb){
  async.map(result.rows,rowToExercise,cb);
}
function rowToExercise(row,cb){
  var eid = row.id.toString();
  var did = row.difficulty_id;
  var mid = row.musclegroup_id;
  async.parallel({
    difficulty: function(callback){
      difficulty.getById(did,callback);
    },
    musclegroup: function(callback){
      musclegroup.getById(mid,callback);
    },
    names: function(callback){
      name.getByEidWid(eid,undefined,callback);
    },
    videos: function(callback){
      video.getByEidWid(eid,undefined,callback);
    },
    photos: function(callback){
      photo.getByEidWid(eid,undefined,callback);
    }
  },
  function(err,results){
    var exercise = new model.Exercise(
      row.id.toString(),
      row.description,
      results.difficulty,
      results.musclegroup,
      row.modified,
      results.names,
      results.videos,
      results.photos
    );
    console.log(JSON.stringify(exercise));
    cb(err,exercise);
  });
}
