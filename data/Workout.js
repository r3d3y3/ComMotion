var async = require('async');

var model = require(process.env.MODELS);
var validate = require(process.env.VALIDATE);

var conn = require(process.env.DATA_CONN);
var exerciseInstance = require(process.env.DATA_EXERCISEINSTANCE);
var timer = require(process.env.DATA_TIMER);
var video = require(process.env.DATA_VIDEO);
var photo = require(process.env.DATA_PHOTO);
var exercise = require(process.env.DATA_EXERCISE);

exports.getById = getById;
exports.getLimitN = getLimitN;
exports.searchByNameDescriptionFilterByDifficultyId = searchByNameDescriptionFilterByDifficultyId;
exports.searchForExercisesAndWorkoutsByNameDescriptionFilterByDifficultyId = searchForExercisesAndWorkoutsByNameDescriptionFilterByDifficultyId;
exports.init = init;

function getById(query,cb){
  var id = parseInt(query.id,10);
  if(id<=0){
    return cb(Error.create('query.id invalid'),undefined);
  }
  conn.query('SELECT w.id,w.name,w.description,w.difficulty_id,w.creator_id,w.created,d.name AS d_name FROM workouts AS w,difficulties AS d WHERE w.difficulty_id=d.id AND w.id=$1',[id],function(err,result){
    if(err){
      return cb(err,undefined);
    }
    resultToWorkouts(result,cb);
  });
}
function getLimitN(query,cb){
  var n = parseInt(query.n,10);
  if(isNaN(n) || n<0){
    return cb(Error.create('query.n invalid'),undefined);
  }
  conn.query('SELECT w.id,w.name,w.description,w.difficulty_id,w.creator_id,w.created,d.name AS d_name FROM workouts AS w,difficulties AS d WHERE w.difficulty_id=d.id LIMIT $1',[n],function(err,result){
    if(err){
      return cb(err,undefined);
    }
    resultToWorkouts(result,cb);
  });
}
function searchByNameDescriptionFilterByDifficultyId(query,cb){
  if(!query.search){
    return cb(Error.create('query.search undefined'),undefined);
  }
  query.search = '%'+query.search+'%';
  var did = parseInt(query.difficultyId);
  if(isNaN(did) || did <= 0){
    var statement = 'SELECT w.id,w.name,w.description,w.difficulty_id,w.creator_id,w.created,d.name AS d_name FROM workouts AS w,difficulties AS d WHERE w.difficulty_id=d.id AND (w.name LIKE $1 OR w.description LIKE $1)';
    var params = [query.search];
  }else{
    var statement = 'SELECT w.id,w.name,w.description,w.difficulty_id,w.creator_id,w.created,d.name AS d_name FROM workouts AS w,difficulties AS d WHERE w.difficulty_id=d.id AND w.difficulty_id=$1 AND (w.name LIKE $2 OR w.description LIKE $2)';
    var params = [did,query.search];
  }
  conn.query(statement,params,function(err,result){
    if(err){
      return cb(err,undefined);
    }
    resultToWorkouts(result,cb);
  });
}
function searchForExercisesAndWorkoutsByNameDescriptionFilterByDifficultyId(query,cb){
  async.parallel({
    exercises: function(callback){
      exercise.searchByNameDescriptionFilterByDifficultyId(query,callback);
    },
    workouts: function(callback){
      searchByNameDescriptionFilterByDifficultyId(query,callback);
    }
  },
  function(err,results){
    if(err){
      return cb(err,undefined);
    }
    cb(undefined,{exercises: results.exercises,workouts: results.workouts});
  });
}
function init(query,cb){
  if(!query.workout){
    return cb(Error.create('query.workout undefined'),undefined);
  }
  validate.workout(query.workout,function afterValidation(err,workout){
    if(err){
      return cb(err,undefined);
    }
    if(workout.id){
      var statement = 'UPDATE workouts SET name=$1,description=$2,difficulty_id=$3 WHERE id=$4 RETURNING id,created';
      var params = [
        workout.name,
        workout.description,
        workout.difficulty.id,
        workout.id
      ];
    }else{
      return cb(Error.create('workout insertion not implemented'),undefined);
    }
    conn.query(statement,params,function afterUpdateOrInsert(err,result){
      if(err){
        return cb(err,undefined);
      }
      workout.id = result.rows[0].id.toString();
      workout.created = result.rows[0].created;
      async.parallel({
        videos: function(callback){
          var videos = workout.videos.map(function(video,index,videos){
            video.workoutId = workout.id;
            return video;
          });
         async.map(videos,video.initNoValidate,callback);
        },
        photos: function(callback){
          var photos = workout.photos.map(function(photo,index,photos){
            photo.workoutId = workout.id;
            return photo;
          });
         async.map(photos,photo.initNoValidate,callback);
        }
      },
      function afterChildObjectInit(err,results){
        if(err){
          return cb(err,undefined);
        }
        workout.videos = results.videos;
        workout.photos = results.photos;
        cb(undefined,workout);
      });
    });
  });
}
function resultToWorkouts(result,cb){
  async.map(result.rows,rowToWorkout,cb);
}
function rowToWorkout(row,cb){
  var wid = row.id.toString();
  async.parallel({
    videos: function(callback){
      video.getByEidWid({eid: undefined,wid: wid},callback);
    },
    photos: function(callback){
      photo.getByEidWid({eid: undefined,wid: wid},callback);
    },
    exerciseInstances: function(callback){
      exerciseInstance.getByWorkoutId({workoutId: wid},callback);
    },
    timers: function(callback){
      timer.getByWorkoutId({workoutId: wid},callback);
    }
  },
  function(err,results){
    if(err){
      return cb(err,undefined);
    }
    var sequence = results.exerciseInstances.concat(results.timers);
    sequence.sort(function(wc1,wc2){
      if(wc1.order < wc2.order){
        return -1;
      }else if(wc1.order > wc2.order){
        return 1;
      }
      return 0;
    });
    var workout = new model.Workout(
      wid,
      row.name,
      new model.Difficulty(row.difficulty_id,row.d_name),
      row.creator_id.toString(),
      row.created,
      row.description,
      results.photos,
      results.videos,
      sequence
    );
    cb(undefined,workout);
  });
}
