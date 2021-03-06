var conn = require(process.env.DATA_CONN);
var common = require(process.env.DATA_COMMON);
var model = require(process.env.MODELS);
var validate = require(process.env.VALIDATE);

exports.getByEidWid = getByEidWid;
exports.init = init;

//internal only
exports.initNoValidate = initNoValidate;
exports.deleteByExerciseIdAndIdNotInSet = deleteByExerciseIdAndIdNotInSet;

function getByEidWid(query,cb){
  var eid = parseInt(query.eid,10);
  var wid = parseInt(query.wid,10);
  if((eid>0 && wid>0) || (eid<=0 && wid<=0)){
    return cb(Error.create('define query.eid xor query.wid'),undefined);
  }
  if(eid){
    var statement = 'SELECT * FROM names WHERE exercise_id=$1 ORDER BY votes DESC';
  }else{
    var statement = 'SELECT * FROM names WHERE workout_id=$1 ORDER BY votes DESC';
  }
  conn.query(statement,[eid],function(err,result){
    if(err){
      return cb(err,undefined);
    }
    resultToNames(result,cb);
  });
}
function resultToNames(result,cb){
  cb(undefined,result.rows.map(function(row,index,rows){
    return new model.Name(row.id,row.name,row.votes,row.exercise_id,row.workout_id);
  }));
}
function init(query,cb){
  if(!query.name){
    return cb(Error.create('query.name undefined'),undefined);
  }
  validate.name(query.name,function afterValidation(err,name){
    if(err){
      cb(err,undefined);
      return;
    }
    initNoValidate(name,cb);
  });
}
function initNoValidate(name,cb){
  if(name.id){
    var statement = 'UPDATE names SET name=$1,exercise_id=$2,workout_id=$3 WHERE id=$4 RETURNING id,votes';
    var params = [
      name.name,
      name.exerciseId,
      name.workoutId,
      name.id
    ];
  }else{
    var statement = 'INSERT INTO names (name,exercise_id,workout_id) VALUES($1,$2,$3) RETURNING id,votes';
    var params = [
      name.name,
      name.exerciseId,
      name.workoutId,
    ];
  }
  conn.query(statement,params,function afterUpdateOrInsert(err,result){
    if(err){
      cb(err,undefined);
      return;
    }
    name.id = result.rows[0].id.toString();
    name.votes = result.rows[0].votes;
    cb(undefined,name);
  });
}
function vote(query,cb){
  //changing votes should be done separately
}
function deleteByExerciseIdAndIdNotInSet(query,cb){
  var table = 'names';
  common.deleteByExerciseIdAndIdNotInSet(query,table,cb);
}
