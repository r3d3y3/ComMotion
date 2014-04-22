var data = require(process.env.DATA);

exports.profile_about = function(req, res){
	userId = req.session.user.id;
	var activities
	data.activitiesGetByUserId({id: userId}, function aftergetActivities(err, retActivities){
	activities = retActivities;
	});

	data.userGetById( {id: userId},function afterGet(err, user){
    res.render('profile/about',
      {
        title: 'Profile About',
        user: user,
		activities: activities,
        err: err
      });
  });
};


exports.others_user_profile_about = function(req, res){
	userId = req.currentuser;
	var activities
	data.activitiesGetByUserId({id: userId}, function aftergetActivities(err, retActivities){
	activities = retActivities;
	});

	data.userGetById( {id: userId},function afterGet(err, user){
    res.render('profile/about',
      {
        title: 'Profile About',
        user: user,
		activities: activities,
        err: err
      });
  });
};

exports.profile_posts = function(req, res){
	userId = req.session.user.id;
	data.userGetById( {id: userId},function afterGet(err, user){
    res.render('profile/myposts',
      {
        title: 'Profile Posts',
        user: user,
        err: err
      });
  });
};
/*
exports.profile_creations = function(req, res){
     res.render('profile/mycreations', {title: 'Profile Creations'});
};
*/
exports.profile_followers = function(req, res){


	userId = req.session.user.id;
	data.userGetById( {id: userId},function afterGet(err, user){

		data.usergetFollowersUsernameAndAvatars({userId: userId}, function afterGet2(err, followers){

		res.render('profile/followers',
   	   {
        title: 'Profile Followers',
        user: user,
		followers: followers,
        err: err
     	 });
		});



  });

};

exports.profile_following = function (req, res){
	userId = req.session.user.id;
	data.userGetById( {id: userId},function afterGet(err, user){

		data.usergetFollowingUsernameAndAvatars({userId: userId}, function afterGet2(err, follows){

			res.render('profile/following',
			  {
				title: 'Profile Following',
				user: user,
				follows: follows,
				err: err
			  });

		});
  });

};
