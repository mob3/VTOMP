define(['ko', "moment"
, "../fieldDict"],function(ko, moment, appDict) {

	var self = {};
	
	self.ProfileUser = function(firstName, lastName, email, id, userName ) {
		this.firstName= firstName;
		this.lastName=lastName;
		this.email=email;
		this.id=id;
		this.userName =userName ;
		var self = this;
		
		this.getFullName = function() {
	        var fullName =vtompNullToBlank(self.firstName) + ' ' + vtompNullToBlank (self.lastName);
	        fullName = fullName.trim();
	        if (!fullName && self.userName) {
	        	// perhaps AD profile hasn't been synced to SP profiles service yet, so show user name
	        	var start = self.userName.indexOf("|");
	        	if (start != -1) {
	        		fullName = self.userName.substring(start + 1);
	        	}
	        }
			return fullName;
		};
	}

	self.ProfileUserSaver = function(userPeoplePickerDiv, profileId, profileUserId, etag, lastSaveResultMsg ) {
		
		this.saveProfileUser = function() {

			var saveDeff= $.Deferred();
	
			getUserInfo().then(function(newProfileUser ) {
		    	if (profileUserId == newProfileUser.id) {
		    		var textStatus = (lastSaveResultMsg != vtomp_Constants.NOTHING_TO_DO) ? "previous changes made" : vtomp_Constants.NOTHING_TO_DO;
					saveDeff.resolve(textStatus);
					return;
		    	}	
		    	
				var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists/getByTitle(\'' 
								+ appDict.listDict["Profiles"] + '\')/items(' + profileId  + ')';
				var requestData= { 
				__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(appDict.listDict["Profiles"])}
				}; 
				requestData[appDict.fieldDict["User"] + "Id"] = newProfileUser.id ? newProfileUser.id : null;
				//var etag = self.editingProfileEntity.entityAspect.extraMetadata.etag;
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
			    post.then(function(data, textStatus, jqXHR) {
			    	console.log("resolving for " +data);
					saveDeff.resolve([data, textStatus, jqXHR, newProfileUser ]);
				}).fail(function(jqXHR, textStatus, errorThrown ) {
					saveDeff.reject(textStatus  + errorThrown );
				});
			});
			var retpromise = saveDeff.promise();
			return retpromise;
		};

		// Query the picker for user information.
		function getUserInfo() {
			var getUserInfoDeff= $.Deferred();
			var newProfileUser = new self.ProfileUser();
		
			var loadedUser = null;
		    var context = new SP.ClientContext.get_current();
		    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[userPeoplePickerDiv + "_TopSpan"];
		    var users = peoplePicker.GetAllUserInfo();
		    if (users.length > 0) {
		    	var loginName = users[0].Key;
			    var user = context.get_web().ensureUser(loginName);
			    context.load(user);
			    loadedUser = user;
		    } 
			
			var ensureUsersSuccess = function() {
				if (loadedUser) {
					newProfileUser.id= loadedUser.get_id();
					newProfileUser.firstName= loadedUser.get_title();
					newProfileUser.email= loadedUser.get_email();
					newProfileUser.userName = loadedUser.get_loginName();
				}
				getUserInfoDeff.resolve(newProfileUser );
			}
		
		    context.executeQueryAsync(
		         Function.createDelegate(null, ensureUsersSuccess ), 
		         Function.createDelegate(null, function(err) {
						getUserInfoDeff.reject(err.status + " - " + err.statusText);
		        	 }
		         )
		    );
			return getUserInfoDeff;
		}
	};
	return self;
});