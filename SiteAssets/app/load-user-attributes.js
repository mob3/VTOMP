define(['underscore', "./fieldDict"], function(_, appDict) {

	var self = {};
	var _moduleName = "load-user-attributes";

	self.vehiclesOfCurrentUser = [];
	self.vehicles = {};
	self.currentVehicle = "";
	self.profileName = "";
	self.profileListIdOfCurrentUser = 0;
	self.isInAdminGroup = false;

    var listName = "Profiles";
    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
		+ "items?$select=ID,Title,Name," 
		+ appDict.fieldDict["Vehicle"] + "/Title," 
		+ appDict.fieldDict["Vehicle"] + "/ID," 
		+ appDict.fieldDict["Company"] + "/Title," 
		+ appDict.fieldDict["Company"] + "/ID," 
		+ appDict.fieldDict["User"] + "/ID," + appDict.fieldDict["User"] 
		+ "/Name," + appDict.fieldDict["User"] + "/EMail,"
		+ "CurrentVehicle"
		+ "&$expand=" 
		+ appDict.fieldDict["Vehicle"] + "," 
		+ appDict.fieldDict["Company"] + "," 
		+ appDict.fieldDict["User"] + "/ID"
		+ "&$filter=" + appDict.fieldDict["User"] + "/ID eq " + _spPageContextInfo.userId
		+ "&$top=1";
   
	console.log(endpoint);
	
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
    self.userAttributesLoadedPromise = new $.Deferred(); //userAttributesLoadedDeferred.promise();
    
    var vehicleLoadPromise = post.then(vtompappCollectProfileQueryResults).then(function() {	
		vtompPleaseWaitMsg.hidePleaseWait(_moduleName); 
	});
												
    post.fail(vtompErrorHandler);
    
    var isAdminLoadDeferred = $.Deferred();
    vtompDoSomethingWithGroupMembership(appDict.groupDict["Admins"], function(isAdmin) {
    	self.isInAdminGroup = isAdmin;
    	isAdminLoadDeferred.resolve();
    });
    
    $.when(vehicleLoadPromise, isAdminLoadDeferred ).done(function() {
    	self.userAttributesLoadedPromise.resolve();
    });
    
	/*
	 * Queries the vehicles from the given company.
	 */
	function vtompappQueryVehiclesFromProfileCompany(companyTitle) {
	   var listName = "Companies";
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
			+ "items?$select=ID,Title" 
			+ "," + appDict.fieldDict["Vehicle"] + "/Title" 
			+ "&$expand=" 
			+ appDict.fieldDict["Vehicle"] 
			+ "&$filter=Title eq '" + companyTitle + "'";
		console.log(endpoint);

	    return $.ajax({
	        url: endpoint,
	        type: "GET",
	  		dataType: "json",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	            "Accept": "application/json; odata=verbose",
	            "Content-Type": "application/json; odata=verbose"
	        },
	    });
	}
	
	/*
	 * Gets the vehicle data from the given company query.
	 */
	function vtompappCollectVehiclesFromProfileCompany(data, textStatus, jqXHR) {
		console.log(data);
		var vehicleTitles = [];
		if (data.d.results.length > 0 && data.d.results[0][appDict.fieldDict["Vehicle"]].results.length > 0) {
			$.each(data.d.results[0][appDict.fieldDict["Vehicle"]].results, function(key,val) {
				vehicleTitles.push(val.Title);
			});
		} else {
			vehicleTitles.push("noopnotavalidvehicletitlenoop");//adding bogus value to ensure array is not empty which may? cause problems in later caml queries
		}
		_.reduce(vehicleTitles, function(memo, val) { 
				if (memo.indexOf(val) == -1) {
					memo.unshift(val);
				}
				return memo;
			}, self.vehiclesOfCurrentUser);
	}
	
	/*
	 * Parse the data from the query on the user.
	 */
	function vtompappCollectProfileQueryResults(data, textStatus, jqXHR) {
		console.log(data);
		if (data.d.results.length > 0) {
			self.profileListIdOfCurrentUser = data.d.results[0].Id;
			self.profileName = data.d.results[0].Name;
			self.companyIdOfCurrentUser = data.d.results[0][appDict.fieldDict["Company"]].ID;
			var companyTitle = data.d.results[0][appDict.fieldDict["Company"]].Title;
			
			//Load all the vehicles. 
			$.each(data.d.results[0][appDict.fieldDict["Vehicle"]].results, function(key,val) {
				self.vehiclesOfCurrentUser.push(val.Title);
				self.vehicles[val.ID] = val.Title;
			});
			self.vehiclesOfCurrentUser.push("All");
			
			//Check if the user has a current vehicle.
			if (data.d.results[0]["CurrentVehicle"] != null) {
				self.currentVehicle = data.d.results[0]["CurrentVehicle"];
			} else {
				self.currentVehicle = self.vehiclesOfCurrentUser[0];
			}
						
		} else {
			self.profileListIdOfCurrentUser = 0;
			self.profileName = "";
			self.companyIdOfCurrentUser = 0;
			var companyTitle = "";
			self.vehiclesOfCurrentUser.push("noopnotavalidvehicletitlenoop");
			self.currentVehicle = "noopnotavalidcompanytitlenoop";
		}
		console.log("company id of user is " + self.companyIdOfCurrentUser);
		console.log("current vehicle of user is " + self.currentVehicle);
		return companyTitle;
	}

	return self;
});