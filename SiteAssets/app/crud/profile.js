define(["../fieldDict", 'ko', "moment"
, "../breeze-app-model"
, "./profile-company"
, "./profile-vehicles"
, "./profile-user"
, "./profiles"
 , "./crudstate"
],function(appDict, ko, moment
, entityManager
, profileCompany
, profileVehicle
, profileUser
, profiles
, crudstate
) {

	var _moduleName = "profile";
	var self = {};
	$.extend(self,profileCompany);
	$.extend(self,profileVehicle);
	$.extend(self,profileUser);
    var listName =  appDict.listDict["Profiles"];
    var userPeoplePickerDiv = 'ProfileEditUserPeoplePickerDiv';


	self.profileId = ko.observable();
	self.profileUser = ko.observable(new self.ProfileUser());

	self.viewProfileFields = {
		Title : ko.observable()
		, Created : ko.observable()
		, Modified : ko.observable()
		, Id : ko.observable()
		, Vehicles : ko.observable()
		, Name : ko.observable()
		, Company : ko.observable()
		, WorkPhone : ko.observable()
		, Email : ko.observable()
		, MobilePhone : ko.observable()
		, nameLink : ko.pureComputed(function() {
						return "mailto:" + vtompNullToBlank (self.viewProfileFields.Email());
					}, this)
	};
	self.editProfileFields= {
		Title : ko.observable()
		, Vehicles : ko.observable()
		, User : ko.observable()
		, Name : ko.observable()
		, WorkPhone : ko.observable()
		, Email : ko.observable()
		, MobilePhone : ko.observable()
		, EmailOpportunityUpdates: ko.observable()
	};
	
	var editingProfileEntity = null;
	
	profileCompany.setLastModified = function(date) {
		self.viewProfileFields.Modified(date);
	};
	profileVehicle.setLastModified = function(date) {
		self.viewProfileFields.Modified(date);
	};
	self.setLastModified = function(date) {
		self.viewProfileFields.Modified(date);
	};
	
	self.getSelectedProfile = function(profileId ) {
			if (profileId == self.profileId()) {
				return; //don't load again
			}
		self.profileId (profileId );
		profileCompany.profileId = profileId ;
		profileVehicle.profileId = profileId ;

		vtompPleaseWaitMsg.showPleaseWait(_moduleName);

		  entityManager.fetchEntityByKey("Profiles", profileId , true)
		  .then(function (data) {
		  		editingProfileEntity = data.entity;
		  		profileCompany.editingProfileEntity =editingProfileEntity;
		  		profileVehicle.editingProfileEntity =editingProfileEntity;
		  		
				self.viewProfileFields.Title(data.entity.Title);
				self.viewProfileFields.Created(data.entity.Created);
				self.viewProfileFields.Modified (data.entity.Modified );
				self.viewProfileFields.Name(data.entity[ appDict.fieldDict["Name"] ]);
				self.viewProfileFields.WorkPhone (data.entity[ appDict.fieldDict["WorkPhone"] ]);
				self.viewProfileFields.Email (data.entity[ appDict.fieldDict["Email"] ]);
				self.viewProfileFields.MobilePhone (data.entity[ appDict.fieldDict["MobilePhone"] ]);

				self.editProfileFields.Title(data.entity.Title);
				self.editProfileFields.Name(data.entity[ appDict.fieldDict["Name"] ]);
				self.editProfileFields.WorkPhone (data.entity[ appDict.fieldDict["WorkPhone"] ]);
				self.editProfileFields.Email (data.entity[ appDict.fieldDict["Email"] ]);
				self.editProfileFields.MobilePhone (data.entity[ appDict.fieldDict["MobilePhone"] ]);
				self.editProfileFields.EmailOpportunityUpdates(data.entity[ appDict.fieldDict["EmailOpportunityUpdates"] ] == "true" ? true : false);

				profileVehicle.getProfileVehicles();
		  }).then(function() {
		  			  queryProfileNavFields(profileId );
		  })
		  .fail(function() {
		 	 vtompErrorHandler(arguments);
		  });
		  
	};

	function queryProfileNavFields(profileId ) {
	    var listName = appDict.listDict["Profiles"];
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
			+ "items?$select="
			+ appDict.fieldDict["User"] + "/Name"
			+ "," + appDict.fieldDict["User"] + "/FirstName"
			+ "," + appDict.fieldDict["User"] + "/LastName"
			+ "," + appDict.fieldDict["User"] + "/EMail"
			+ "," + appDict.fieldDict["User"] + "/Id"
			+ "," + appDict.fieldDict["Vehicle"] + "/Title"
			+ "," + appDict.fieldDict["Company"] + "/Title"
			+ "," + appDict.fieldDict["Company"] + "/Id"
	
			+ "&$expand=" + appDict.fieldDict["User"] + "/Id"
			+ "," + appDict.fieldDict["Vehicle"] + "/Id"
			+ "," + appDict.fieldDict["Company"] + "/Id"
			+ "&$filter=ID eq " + profileId 
			+ "&$top=1"
	    ;
	    var post = $.ajax({
	        url: endpoint,
	        type: "GET",
	  		dataType: "json",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	            "Accept": "application/json; odata=verbose",
	            "Content-Type": "application/json; odata=verbose"
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {
             if (data.d.results.length > 0) {
             	var dat = data.d.results[0];
				editingProfileEntity.entityAspect.extraMetadata.etag =  dat.__metadata.etag;
		        // Get the user information
		        self.initializeProfileUser(dat[ appDict.fieldDict["User"]].FirstName, dat[ appDict.fieldDict["User"]].LastName
		        , dat[ appDict.fieldDict["User"]].EMail, dat[ appDict.fieldDict["User"]].Id, dat[ appDict.fieldDict["User"]].Name);

				if (dat[ appDict.fieldDict["Vehicle"]].results.length > 0) {
					var vehicleResults = dat[ appDict.fieldDict["Vehicle"]].results;
					var vehicles = _.reduce(vehicleResults.slice(1), function(memo, vehicle){ return memo + ", " + vehicle.Title}, vehicleResults [0].Title);
					self.viewProfileFields.Vehicles (vehicles );
				} else {
					self.viewProfileFields.Vehicles (null );
				}
				self.viewProfileFields.Company(dat[appDict.fieldDict["Company"]].Title);
				if (dat[appDict.fieldDict["Company"]].Id) {
					profileCompany.setSelectedCompany (dat[appDict.fieldDict["Company"]].Id);
				}
				if (!self.viewProfileFields.Email() && dat[ appDict.fieldDict["User"]] && dat[ appDict.fieldDict["User"]].EMail){
					self.viewProfileFields.Email(dat[ appDict.fieldDict["User"]].EMail);
				}
             }
	    });
		vtompPleaseWaitMsg.hidePleaseWait(_moduleName);
	};
	

	self.initializeProfileUser = function(firstName, lastName, email, id, userName ){
		 vtompInitializePeoplePicker(userPeoplePickerDiv);
        var profileUser = new self.ProfileUser(firstName, lastName, email, id, userName );
		self.profileUser (profileUser );
        
        if (userName) {
	        var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[userPeoplePickerDiv + "_TopSpan"];
	    	peoplePicker.AddUnresolvedUser({ Key: userName }, true); //.split('|')[1]
	    }
	};
	
	
	self.SaveProfile= function () {
		console.log("Saving Profile");
	    editingProfileEntity.Title = self.editProfileFields.Title();
	    editingProfileEntity[ appDict.fieldDict["Name"] ] = self.editProfileFields.Name();
	    editingProfileEntity[ appDict.fieldDict["WorkPhone"] ] = self.editProfileFields.WorkPhone();
	    editingProfileEntity[ appDict.fieldDict["Email"] ] = self.editProfileFields.Email();
	    editingProfileEntity[ appDict.fieldDict["MobilePhone"] ] = self.editProfileFields.MobilePhone();
	    editingProfileEntity[ appDict.fieldDict["EmailOpportunityUpdates"] ] = self.editProfileFields.EmailOpportunityUpdates() ? "true" : "false";

		//Save the changes to SharePoint through the entity manager.
	    entityManager.saveChanges()
	    	.then(function (saveResult) {
				self.viewProfileFields.Title(self.editProfileFields.Title());
				self.viewProfileFields.Name(self.editProfileFields.Name());
				self.viewProfileFields.WorkPhone(self.editProfileFields.WorkPhone());
				self.viewProfileFields.Email(self.editProfileFields.Email());
				self.viewProfileFields.MobilePhone(self.editProfileFields.MobilePhone());
				var modifiedDate = moment.utc(new Date()); //fixme: not same as on server
				self.viewProfileFields.Modified (modifiedDate.toDate());
				if (saveResult.entities.length){
					var profileId = saveResult.entities[0].Id;
					var etag = saveResult.entities[0].entityAspect.extraMetadata.etag;
					crudstate.changeEvents.companyPOCUpdated.fire(profileId, etag);
				}
				return $.when(saveResult);
		    })
			//Save the company profile as one profile has been updated. 
		    .then(profileCompany.saveProfileCompany )
		    .then(function(lastSaveResultMsg ) {
				var profileUserSaver = new profileUser.ProfileUserSaver(userPeoplePickerDiv, self.profileId(), self.profileUser().id
				, editingProfileEntity.entityAspect.extraMetadata.etag, lastSaveResultMsg  );
				var promise = profileUserSaver.saveProfileUser();
				return promise;
			})
		    .then(function(args ) {
		    	var data, textStatus, jqXHR , newProfileUser ;
		    	if (args instanceof Object) {
		    		data = args.length && args.shift(); textStatus = args.length && args.shift();
		    		jqXHR = args.length && args.shift(); newProfileUser = args.length && args.shift();
		    	} else if (typeof args === "string") {
		    		data = args;
		    	} else { throw "unexpected args type"; }
		    	var msg = (data == vtomp_Constants.NOTHING_TO_DO) ? "No changes to save" : "Item saved";
		    	if (jqXHR) {
					editingProfileEntity.entityAspect.extraMetadata.etag =  jqXHR.getResponseHeader("Etag");
					self.setLastModified(moment(jqXHR.getResponseHeader("Last-Modified").replace("GMT", "+0000"),'ddd, DD MMM YYYY HH:mm:ss Z').toDate());
					
					self.profileUser (newProfileUser );
		    	}
		    	
		    	vtompShowNotification(msg, true, function() {
			 			Backbone.history.navigate('/profiles', true);
					});
		    })
			.then( function() {
				//Reload the profiles. 
				profiles.loadProfilesCalled = false;
				profiles.loadProfiles();
			})
		    .fail(vtompErrorHandler);

	
	};

    self.DeleteProfile= function () {
		if (!confirm("Delete profile?")) {
			return;
		}
		
		//Set profile as deleted then save changes to update SharePoint.
		editingProfileEntity.entityAspect.setDeleted();
      	entityManager.saveChanges()
	        .then(function () {
				crudstate.changeEvents.profileDeleted.fire(self.profileId ());
				self.profileId ("");
				self.resetSelectedCompany();
				vtompShowNotification('Item deleted', true, function() {
		 			Backbone.history.navigate('/profiles' , true);
				});
	        })
		    .fail(vtompErrorHandler);
	};
	
	
	self.editProfileFields.Name.subscribe(function(newName) {
 		 console.log("the new newName is " + newName);  
	    editingProfileEntity[ appDict.fieldDict["Name"] ] = self.editProfileFields.Name();
	 }, self);

	
	return self ;
	

});