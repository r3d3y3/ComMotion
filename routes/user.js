
/*
 * GET users listing.
 */

exports.landing = function(req, res){
  res.render('landing', {title: 'Landing'});
};


exports.signup = function(req, res){
  res.render('signup', {title: 'Sign Up'});
};


