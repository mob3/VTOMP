define(["../fieldDict", 'ko', "moment"
, "../breeze-app-model"
, "./profile-company"
, "./profile-vehicles"
, "./profile-user"
 , "./crudstate"
 , "./available-companies"
],function(appDict, ko, moment
, entityManager
, profileCompany
, profileVehicle
, profileUser
, crudstate
, availableCompanies
) {

	var _moduleName = "create-profile";
	var self = {};
    var listName =  appDict.listDict["Profiles"];

	self.editProfileFields= {
		Title : ko.observable()
		, Vehicles : ko.observable()
		, User : ko.observable()
		, Name : ko.observable()
		, WorkPhone : ko.observable()
		, Email : ko.observable()
		, MobilePhone : ko.observable()
	};
	
	self.editingProfileEntity = null;
	
	self.availableCompanies = ko.observableArray();
	self.selectedCompanyForEdit = ko.observable();
	self.profileId = null;
    var userPeoplePickerDiv = 'ProfileCreateUserPeoplePickerDiv';

	
	self.SaveProfile= function () {
    	var profileType = entityManager.metadataStore.getEntityType(appDict.listDict["Profiles"]);
    	if (!self.editingProfileEntity) {
  			self.editingProfileEntity= entityManager.createEntity(profileType );
  		}
	    self.editingProfileEntity.Title = self.editProfileFields.Title();
	    self.editingProfileEntity[ appDict.fieldDict["Name"] ] = self.editProfileFields.Name();
	    self.editingProfileEntity[ appDict.fieldDict["WorkPhone"] ] = self.editProfileFields.WorkPhone();
	    self.editingProfileEntity[ appDict.fieldDict["Email"] ] = self.editProfileFields.Email();
	    self.editingProfileEntity[ appDict.fieldDict["MobilePhone"] ] = self.editProfileFields.MobilePhone();

	    entityManager.saveChanges()
		    .then(saveProfileCompany )
		    .then(function(lastSaveResultMsg ) {
				var profileUserSaver = new profileUser.ProfileUserSaver(userPeoplePickerDiv, self.profileId, null
				, self.editingProfileEntity.entityAspect.extraMetadata.etag, lastSaveResultMsg  );
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
					entityManager.detachEntity(self.editingProfileEntity);
					crudstate.changeEvents.profileCreated .fire(self.profileId );

					vtompShowNotification(self.editProfileFields.Name() + " successfully added!", true, function() {
			 			Backbone.history.navigate('/profiles', true);
					});
		    	} else {
			    	vtompShowNotification(msg, true);
		    	}
		    })
		    .fail(vtompErrorHandler);
	
	};

	
	var saveProfileCompany = function(saveResult) {

	    	if (!self.selectedCompanyForEdit () || !self.selectedCompanyForEdit ().id) {
	    		return saveResult.entities.length ? "previous changes made" : vtomp_Constants.NOTHING_TO_DO;
	    	}	
			self.profileId = saveResult.entities[0].Id;
			var etag = saveResult.entities[0].entityAspect.extraMetadata.etag;
			var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists/getByTitle(\'' 
							+ appDict.listDict["Profiles"] + '\')/items(' + self.profileId   + ')';
			var requestData= { 
			__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(appDict.listDict["Profiles"])}
			}; 
			requestData[appDict.fieldDict["Company"] + "Id"] = self.selectedCompanyForEdit().id;
			var etag = etag ;
		    var post = $.ajax({
		        url: requestUri 
		        , type: "POST",
		        data: JSON.stringify(requestData),
		        headers: {
		            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
		            "Accept": "application/json; odata=verbose"
		            ,'X-HTTP-Method': 'MERGE'
		            , 'If-Match': etag
		            ,"Content-Type": "application/json; odata=verbose"
		        },
		    });
		    var saveDeff= $.Deferred();
		    post.then(function(data, textStatus, jqXHR) {
				self.editingProfileEntity.entityAspect.extraMetadata.etag =  jqXHR.getResponseHeader("Etag");
		        saveDeff.resolve(textStatus);
			})
		    post.fail(function(jqXHR, textStatus, errorThrown ) {
					saveDeff.reject(textStatus  + errorThrown );
				});
			return saveDeff;
	};
	
	self.initializeCreateProfile = function() {
		availableCompanies.loadAvailableCompanies(self.availableCompanies);
		 vtompInitializePeoplePicker(userPeoplePickerDiv);
	};
	
		
	return self ;
	

});