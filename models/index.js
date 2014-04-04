exports.Exercise = function(id,description,difficulty,musclegroup,modified,names,videos,photos){
	this.id = id;
	this.description = description;
  this.difficulty = difficulty;
  this.musclegroup = musclegroup;
  this.modified = modified;
  this.names = names;
  this.videos = videos;
  this.photos = photos;
};

exports.Name = function(id,name,votes,exerciseId,workoutId){
  this.id = id;
  this.name = name;
  this.votes = votes;
  this.exerciseId = exerciseId;
  this.workoutId = workoutId;
};

exports.Photo = function(id,filename,exerciseId,workoutId){
  this.id = id;
  this.filename = filename;
  this.exerciseId = exerciseId;
  this.workoutId = workoutId;
};

exports.Video = function(id,url,exerciseId,workoutId){
  this.id = id;
  this.url = url;
  this.exerciseId = exerciseId;
  this.workoutId = workoutId;
};

exports.Difficulty = function(id,name){
  this.id = id;
  this.name = name;
};

exports.Musclegroup = function(id,name){
  this.id = id;
  this.name = name;
};