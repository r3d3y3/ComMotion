var conn = require(process.env.DATA_CONN);
var model = require(process.env.MODELS);

exports.getById = getById;
function getById(id,cb){
  conn.query('SELECT * FROM musclegroups WHERE id=$1',[id],function(err,result){
    if(err){
      cb(err,undefined);
    }
    else{
      var row = result.rows[0];
      rowToMusclegroup(row,cb)
    }
  });
}
function rowToMusclegroup(row,cb){
  cb(undefined,new model.Musclegroup(row.id.toString(),row.name));
}