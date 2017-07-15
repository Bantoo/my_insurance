//link all required modules

var express = require('express');
var sessions = require('express-session');
var session;
var expressValidator = require('express-validator');
var path = require('path');
var bodyParser = require('body-parser');
var S = require('string');
var isemail = require('isemail');
var mongodb = require('mongodb')
var mongojs = require('mongojs');

db = 'insurance';
//mongodb.Db.connect('mongodb://localhost/insurance', function (err, theDb) {
 //   var db = mongojs(theDb, ['myCollection'])
 	//var db = mongojs("127.0.0.1:27017/"+db, collections);
    var dbAccess = mongojs("127.0.0.1:27017/"+db,['access']);
	var dbLogin = mongojs("127.0.0.1:27017/"+db,['login']);
	var dbLoginStatus = mongojs("127.0.0.1:27017/"+db,['login_status']);
	var dbCust = mongojs("127.0.0.1:27017/"+db,['my_cust']);
	var dbCustPolicy = mongojs("127.0.0.1:27017/"+db,['my_cust_policy']);
	var dbPolicyClaim = mongojs("127.0.0.1:27017/"+db,['my_policy_claim']);
//

//var dbAccess = mongojs('insurance',['access']);
//var dbLogin = mongojs('insurance',['login']);
//var dbLoginStatus = mongojs('insurance',['login_status']);
//var dbCust = mongojs('insurance',['my_cust']);
//var dbCustPolicy = mongojs('insurance',['my_cust_policy']);
//var dbPolicyClaim = mongojs('insurance',['my_policy_claim']);

var app = express();
var port = 5555;

//set path for public static directory

app.use(express.static(path.join(__dirname,'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(sessions({
	secret : 'awef7wy8uwq93iq12313!#@!@232',
	resave : false,
	saveUninitialized :true

}))
//set view
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

//Decklare global variable
app.use(function(req,res,next){
	app.locals.errors = null;
	app.locals.details = null;
	app.locals.error_msg = null;
	app.locals.inp_usr = null;
	app.locals.inp_key = null;
	app.locals.message = null;
	app.locals.message1 = null;
	app.locals.seqNo = null;
	next();
});



//expressValidator Copied from GITHUB Docs.

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

//write request and response function
app.get('/', function(req,res) {
	console.log("inside get")
	//res.send('Hello, I am Test1');
	session = req.session;
	if(session.uniqueId){
		res.render('loginDone',{
			whichUser:session.uniqueId
		});
	}
	else{
		res.render('login');
	}
	

});

//POST Method Goes here

app.post('/',function(req,res) {
	//console.log(req.body.key);
//Clicking Top link on the Page and redirect Codes
session = req.session;
	if(req.body.linkClicked === 'Change Password') {
		res.render('changePassword',{
			whichUser:session.uniqueId
		})
	}
	if(req.body.linkClicked === 'Customer Registration') {
		res.render('customerRegistration',{
			whichUser:session.uniqueId
		})
	}
	if(req.body.linkClicked === 'Edit Customer Details') {
		res.render('editCustomer',{
			whichUser:session.uniqueId
		})
	}
	if(req.body.linkClicked === 'Delete Customer') {
		res.render('deleteCustomer',{
			whichUser:session.uniqueId
		})
	}
	if(req.body.linkClicked === 'Policy Registration') {
		res.render('policyRegistration',{
			whichUser:session.uniqueId
		})
	}
	if(req.body.linkClicked === 'Policy Plans') {
		res.render('policyPlan',{
			whichUser:session.uniqueId
		})
	}
	if(req.body.linkClicked === 'Update Policy') {
		res.render('updatePolicy',{
			whichUser:session.uniqueId
		})
	}
	if(req.body.linkClicked === 'Claim Policy') {
		res.render('claimPolicy',{
			whichUser:session.uniqueId
		})
	}
	//List All Registered Customers
	if(req.body.linkClicked === 'List Registered Customers') {
		dbCust.my_cust.find(function(err,result){
			res.render('allCustomers',{
			whichUser:session.uniqueId,
			detail:result
		})
		})
	}
	//List All Registered Customers-policies
	if(req.body.linkClicked === 'List Registered Policies') {
		dbCust.my_cust_policy.find(function(err,result){
			res.render('allRegPolicy',{
			whichUser:session.uniqueId,
			detail:result
		})
		})
	}
//Check Access Level from DB
	if (req.body.home === 'home'){
		res.render('index');
	}

	if(req.body.clicked === 'Submit') {
		var inp_key = {
			auth_key : req.body.key
		}
			//console.log(auth_key);

		dbAccess.access.count(inp_key , function (err,result) {
 
			if (err){
				console.log(err);
				res.send('Unable to process Request this time:');
			}
			else{
				if(result === 1){
					//res.send('Login Sucess');
					res.render('login');
				}
				else {
					//res.send('Please Enter Valid User Name/Password.');
					console.log(inp_key); 
					res.render('index',{
						errors:inp_key
					});
				}
				
			}
		})
	}
//logout User


//Login Users

	if(req.body.clicked === 'Login') {
		var inp_key = {
			userId : req.body.userId,
			password : req.body.password
		}
		
		dbLogin.login.count(inp_key , function (err,result) {
 
			if (err){
				console.log(err);
				res.send('Unable to process Request this time:');
			}
			else{
				if(result === 1){
					console.log(' login Validated')
					loggedId = req.body.userId
				//Check for already logged flag
					dbLoginStatus.login_status.count({loginId : loggedId , status :"Y"}, function(err,result){
						if (err){
							console.log(err);
							res.send('Unable to process Request this time:');
						}
						else{
							if(result !== 0){
								res.render('login',{
								message:'User Already Logged Into Application'
								});
							}
							else{
								var inp_key ={
								loginId : loggedId,
								status : 'Y'
								}
								dbLoginStatus.login_status.insert(inp_key, function (err,result){
									if (err){
										console.log(err);
										res.send('Unable to process Request this time:');
									}
									else{

										session.uniqueId = loggedId;
										res.render('loginDone',{
											whichUser:session.uniqueId
										})
									}
								})
							}
						}
					})
					
				}
				else {
					//res.send('Please Enter Valid User Name/Password.');
					console.log(inp_key); 
					res.render('login',{
						errors:inp_key
					});
				}
				
			}
		})	
	}
	//Logged User
	if(req.body.logout) {
		console.log('logging Out')
		//var currentId =  S(req.body.logout).splitRight(' ', 1);
		//var currentId = currentId[1];
		var inp_key ={
			loginId : session.uniqueId
		}
		console.log(inp_key)
		dbLoginStatus.login_status.remove(inp_key,function (err,result){
			if (err){
				console.log(err);
				res.send('Unable to process Request this time:');
			}
			else{
				req.session.destroy(function(err){
					console.log('session destroyed during logout')
				})
				res.render('login')
			}
		})
	}
//Change Password Module
	if(req.body.clicked === 'Change Password') {
		var inp_key = {
		userId : req.body.userId,
		password : req.body.oldPassword
		}
		//console.log('inside Change')
		dbLogin.login.count(inp_key , function (err,result) {

			if (err){
				console.log(err);
				res.send('Unable to process Request this time:');
			}
			else{
				//console.log('Insde Else');
				console.log(result);
				if(result === 1){
					//console.log('user id Validated')
				
					if(req.body.confNewPassword !== req.body.newPassword){
						res.render('changePassword',{
						message:"Err : New Password and Confirm Password does Not Match.",
						whichUser : session.uniqueId
						});
					}
					else{

						if(req.body.oldPassword === req.body.newPassword){
							res.render('changePassword',{
							message:"Err : New Password and Old Password should not be Same.",
							whichUser : session.uniqueId
							});
						}
						else {	
//Update DB And set Success Message on a  Success Page
							var inp_criteria = {
								userId : req.body.userId
							};
							var updatedData = {
								userId : req.body.userId,
								password :req.body.newPassword
							};

							dbLogin.login.update(inp_criteria,updatedData,function(err,result){
								if (err){
									console.log(err);
									res.send('Unable to process Request this time:');
								}
								else{
									dbLoginStatus.login_status.remove({loginId :req.body.userId}, function (err,result){
										if (err){
											console.log(err);
											res.send('Unable to process Request this time:');
										}
										else{
											res.render('login',{
											message:"Password Changed Successfully, Please Login with New Password",
											whichUser : session.uniqueId
											})
										}
									})
								}
							})	
						}
					}
				}
				else{
				res.render('changePassword',{
					message:"Err : Invalid User ID or password",
					whichUser : session.uniqueId
					})
				}
			}
		})
			console.log('after else if')
	}

//reset Password
	if(req.body.clicked === 'Reset Password' ) {
		var inp_key = {
		userId : req.body.userId,
		}
		//console.log('inside Change')
		dbLogin.login.count(inp_key , function (err,result) {

			if (err){
				console.log(err);
				res.send('Unable to process Request this time:');
			}
			else{
				//console.log('Insde Else');
				console.log(result);
				if(result !== 0){

					var inp_criteria = {
						userId : req.body.userId
					};
					var updatedData = {
						password :"phi@123"
					};

					dbLogin.login.update(inp_criteria,{ $set : updatedData},function(err,result){
						if (err){
							console.log(err);
							res.send('Unable to process Request this time:');
						}
						else{
							dbLoginStatus.login_status.remove({loginId :req.body.userId}, function (err,result){
								if (err){
									console.log(err);
									res.send('Unable to process Request this time:');
								}
								else{
									res.render('login',{
									message:"Password Changed Successfully, Please Login with New Password",
									whichUser : session.uniqueId
									})
								}
							})
						}
					})
				}	
				else{
					res.render('changePassword',{
						message:"Err : Invalid User ID",
						whichUser : session.uniqueId
						})
				}
			}
		})
	}
//New Customer Registration Module

	if(req.body.clicked === 'Register' ) {
		//Frontend VAlidation
		console.log('inside new customer reg.')
		req.check('userName', 'Please Enter Customer Name').notEmpty();		
		req.check('mobileNo', 'Please Enter Valid Mobile Number').isInt();
		req.check('dateOfBirth', 'Date of birth needs to be a valid date').isDate({format: 'DD-MM-YYYY'});		

		var errors = req.validationErrors();
		if (errors) {
		  // do something with the errors
		  //console.log('err in email/password');
		  //console.log(errors);
		  //send error to frontend as error msg

		  res.render('customerRegistration',{
		  	errors : errors,
			whichUser : session.uniqueId
		  });
		}
		else{
			var email_valid = isemail.validate(req.body.email);
			//console.log(email_valid)
			//console.log(req.body.email)
			if (req.body.email==""){
				email_valid = "true";
			}
			if (email_valid){

				dbCust.my_cust.count(function(err,result){
					var seqNo = 1000+result;
					
				
					var newCustomer = {
						custId : seqNo,
						name : req.body.userName,
						dob : req.body.dateOfBirth,
						gender : req.body.gender,
						email : req.body.email,
						address : req.body.address,
						mobile : req.body.mobileNo,
						deleted : "N"
					}

					dbCust.my_cust.insert(newCustomer, function(err,result){

							if (err){
								res.render('customerRegistration' ,{
									error_msg : "Unable to add a customer, Please try again"
								})
							}
							else{
								res.render('successPage',{
											message:"Customer Added Successfully: Customer Id is "+seqNo,
											whichUser : session.uniqueId

								})
					
							}
					})
				})
			}
			else{
				res.render('customerRegistration',{
		  		message : "Invalid Email, please provide correct email id ",
				whichUser : session.uniqueId
		 		 });
			}
			//res.send('REGISTRATION START');
		}	
	}

//Edit Customer Page Based on Customer Id:
console.log(req.body.clicked)
	if(req.body.clicked === 'Fetch Customer'){

		var qCrit = {
			custId :1*req.body.custId2,
			deleted : "N"
		}
		//console.log(custId)
		//Check if custId exists or Not
		dbCust.my_cust.count(qCrit,function(err,result){
			if(err){
				console.log(err)
			}
			else{
				if(result === 0){
					res.render('editCustomer',{
						message1:"Customer Not Found",
						whichUser : session.uniqueId
					})
				}
				else{
					console.log('customer Found')
					dbCust.my_cust.find(qCrit,function(err,result){
						console.log(result)
					if(err){
						console.log(err)
					}
					else{
						res.render('editCustomer',{
							details : result,
							whichUser : session.uniqueId
						})
					}	
					})

				}
				
				//console.log(result)
			}
		})
	}

	if(req.body.clicked === 'Edit Customer' ) {
		//Frontend VAlidation
		//console.log('inside new customer reg.')
		req.check('userName', 'Please Enter Customer Name').notEmpty();		
		req.check('mobileNo', 'Please Enter Valid Mobile Number').isInt();
		req.check('dateOfBirth', 'Date of birth needs to be a valid date').isDate({format: 'DD-MM-YYYY'});		

		var errors = req.validationErrors();
		if (errors) {

		    res.render('editCustomer',{
		  	errors : errors,
			whichUser : session.uniqueId
		  });
		}
		else{
			var email_valid = isemail.validate(req.body.email);
			//console.log(email_valid)
			//console.log(req.body.email)
			if (req.body.email==""){
				email_valid = "true";
			}
			if (email_valid){
				var crit = {
					custId : 1*req.body.custId1,
					deleted : "N"
				}
			
				var newCustomer = {
					custId : 1*req.body.custId1,
					name : req.body.userName,
					dob : req.body.dateOfBirth,
					gender : req.body.gender,
					email : req.body.email,
					address : req.body.address,
					mobile : req.body.mobileNo,
					deleted : "N"
				}
				console.log(crit)
				console.log(newCustomer)

				dbCust.my_cust.update(crit,newCustomer, function(err,result){

						if (err){
							res.render('editCustomer' ,{
								error_msg : "Unable to add a customer, Please try again",
								whichUser : session.uniqueId
							})
						}
						else{
							res.render('successPage',{
										message:"Customer Updated Successfully",
										whichUser : session.uniqueId
							})
				
						}
				})
			}
			else{
				res.render('editCustomer',{
		  			message : "Invalid Email, please provide correct email id ",
					whichUser : session.uniqueId
		 		 });
			}
		}
			//res.send('REGISTRATION START');
	}

//Delete Customer
	if(req.body.clicked === 'Fetch Customer for Delete'){

		var qCrit = {
			custId :1*req.body.custId2,
			deleted : "N"
		}
		//console.log(custId)
		//Check if custId exists or Not
		dbCust.my_cust.count(qCrit,function(err,result){
			if(err){
				console.log(err)
			}
			else{
				if(result === 0){
					res.render('deleteCustomer',{
						message1:"Customer Not Found",
						whichUser : session.uniqueId
					})
				}
				else{
					console.log('customer Found')
					dbCust.my_cust.find(qCrit,function(err,result){
						console.log(result)
					if(err){
						console.log(err)
					}
					else{
						res.render('deleteCustomer',{
							details : result,
							whichUser : session.uniqueId
						})
					}	
					})

				}
				//console.log(result)
			}
		})
	}

	if(req.body.clicked === 'Delete Customer' ) {
		//Frontend VAlidation
		//console.log('inside new customer reg.')
		var crit = {
			custId : 1*req.body.custId1
		}
	
		var delCustomer = {
			custId : 1*req.body.custId1,
			name : req.body.userName,
			dob : req.body.dateOfBirth,
			gender : req.body.gender,
			email : req.body.email,
			address : req.body.address,
			mobile : req.body.mobileNo,
			deleted : "Y"
		}
		console.log(crit)
		console.log(delCustomer)

		dbCust.my_cust.update(crit,delCustomer, function(err,result){

			if (err){
				res.render('deleteCustomer' ,{
					error_msg : "Unable to delete a customer, Please try again",
					whichUser :session.uniqueId
				})
			}
			else{
				res.render('successPage',{
							message:"Customer Deleted Successfully",
							whichUser : session.uniqueId
				})
			}
		})
			//res.send('REGISTRATION START');
	}


	//CUstomer Policy Registration
	if(req.body.clicked === 'Register Policy' ) {
	//Frontend VAlidation
		console.log('inside new customer Policy reg.')
		req.check('custId', 'Please Enter Customer Name').notEmpty();		
		req.check('policyType', 'Please choose Valid Policy').notEmpty();
		req.check('terms', 'Please Enter Terms in MOnths').isInt();
		req.check('sumInsured', 'Please Enter Valid Amount').isInt();


		var errors = req.validationErrors();
		if (errors) {
	
		  res.render('policyRegistration',{
		  	errors : errors,
			whichUser : session.uniqueId
		  });
		}
		else{
//Check for Cust Id
			var crit = {
				custId : 1*req.body.custId,
				deleted :"N"
			}
			console.log(crit)
			dbCust.my_cust.count(crit,function(err,result){
				if (result == 0){
					res.render('policyRegistration',{
	  					message : "Invalid Customer Id",
						whichUser : session.uniqueId
	  				});
				}
				else{
					dbCustPolicy.my_cust_policy.count(function(err,result){
						var seqNo = 50000+result;
						
						var newCustomerPolicy = {
							policyRegId : seqNo,
							custId : req.body.custId,
							policyType: req.body.policyType,
							terms : req.body.terms,
							sumInsured : req.body.sumInsured,
							nominee : req.body.nominee,
							Status : "O"
						}
						console.log(newCustomerPolicy)
						dbCustPolicy.my_cust_policy.insert(newCustomerPolicy, function(err,result){

							if (err){
								res.render('customerRegistration' ,{
									error_msg : "Unable to add a customer Policy, Please try again"
								})
							}
							else{
								res.render('successPage',{
										message:"Policy Linked Successfully, Customer ID:"+ req.body.custId +"And Policy Id :"+seqNo,
										whichUser : session.uniqueId
								})
							}
						})
					})
				}
			})
		}
			//res.send('REGISTRATION START');
	}

//Code for Policy Update
	if(req.body.clicked === 'Fetch Policy For Update'){

		var qCrit = {
			policyRegId :1*req.body.policyId2
		}
		
		//Check if policyId exists or Not
		dbCust.my_cust_policy.count(qCrit,function(err,result){
			if(err){
				console.log(err)
			}
			else{
				if(result === 0){
					res.render('updatePolicy',{
						message1:"Policy Id Not Found",
						whichUser : session.uniqueId
					})
				}
				else{
					console.log('Policy Id Found')
					dbCust.my_cust_policy.find(qCrit,function(err,result){
						console.log(result)
					if(err){
						console.log(err)
					}
					else{
						res.render('updatePolicy',{
							details : result,
							whichUser : session.uniqueId
						})
					}	
					})

				}
				
				//console.log(result)
			}
		})
	}

	if(req.body.clicked === 'Update Policy' ) {
		var crit = {
			policyRegId : 1*req.body.policyId1
		}
		dbCust.my_cust_policy.update(crit,{ $set : {Status :req.body.policyStatus} }, function(err,result){
			if (err){
				res.render('updatePolicy' ,{
					error_msg : "Unable to Update Policy Status, Please try again",
					whichUser : session.uniqueId
				})
			}
			else{
				res.render('successPage',{
							message:"Policy Updated Successfully",
							whichUser : session.uniqueId
				})
			}
		})
			//res.send('REGISTRATION START');
	}	

//register for Claim
	if(req.body.clicked === 'Apply Claim' ) {
	//Frontend VAlidation
		console.log('inside new Apply Claim.')
		req.check('policyRegId', 'Please Enter Policy Registration Id').notEmpty();
		req.check('claimDate', 'Date of birth needs to be a valid date').isDate({format: 'DD-MM-YYYY'});		
		req.check('claimType', 'Please choose Nature of Claim ').notEmpty();
		req.check('approverId', 'Please Enter Valid Approver ID ').notEmpty();

		var errors = req.validationErrors();
		if (errors) {
	
		  res.render('claimPolicy',{
		  	errors : errors,
			whichUser : session.uniqueId
		  });
		}
		else{
//Check for Cust Id
			var crit = {
				policyRegId : 1*req.body.policyRegId,
			}
			console.log(crit)
			dbCust.my_cust_policy.count(crit,function(err,result){
				if (result == 0){
					res.render('claimPolicy',{
	  					message : "Invalid Policy Registration Id",
						whichUser : session.uniqueId
	  				});
				}
				else{
					var crit = {
						policyRegId : req.body.policyRegId,
						Status : "I"
					}
					
					dbPolicyClaim.my_policy_claim.count(crit,function(err,result){
						if(result == 0){
							dbCustPolicy.my_policy_claim.count(function(err,result){
								var seqNo = 15005+result;
								
								var newPolicyClaim = {
									claimId : seqNo,
									policyRegId : req.body.policyRegId,
									claimDate: req.body.claimDate,
									claimType : req.body.claimType,
									approverId :req.body.approverId,
									Status : "I"
								}
								console.log(newPolicyClaim)
								dbPolicyClaim.my_policy_claim.insert(newPolicyClaim, function(err,result){

									if (err){
										res.render('claimPolicy' ,{
											message : "Unable to add a customer Policy, Please try again",
											whichUser : session.uniqueId
										})
									}
									else{
										res.render('successPage',{
										message:"Claim Submitted Successfully, Policy ID:"+ req.body.policyRegId +"And Claim Id :"+seqNo,
										whichUser : session.uniqueId

										})
									}
								})
							})
						}
						else{
							res.render('claimPolicy' ,{
											message : "A Claim Already Initiated for this Policy ID",
											whichUser : session.uniqueId
							})

						}
					})
				}
			})
		}
			//res.send('REGISTRATION START');
	}

});


//run the port
app.listen(port, function(){
	console.log('app is running on port: '+port);
});
