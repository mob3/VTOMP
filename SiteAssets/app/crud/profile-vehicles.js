define(["../fieldDict", 'ko', "moment"
 , "./crudmetamodel"
],function(appDict, ko, moment 			
, crudmetamodel
){

	var self = {};

	self.profileId = null;
	self.editingProfileEntity = null;
	self.setLastModified = null

	function ProfileVehicle(id, title) {
		this.id = id;
		this.title = title;
	};

	self.selectedVehicles = ko.observableArray();
	self.availableVehicles = ko.observableArray();
	self.selectedAvailableVehicles = ko.observable();


	loadAvailableVehicles();

	function loadAvailableVehicles() {
    	self.availableVehicles .removeAll();
		crudmetamodel.appVehiclesLoadPromise.then(function() {
			$.each(crudmetamodel.appVehicles, function(key, val) {
	         	if (!_.findWhere(self.selectedVehicles (), {title : val.title }) ) {
		            var v = new ProfileVehicle(val.id, val.title );
		             self.availableVehicles .push(v);
		        }
			});
		});
	};

	self.getProfileVehicles = function() {
	    var listName = "Profiles";
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + appDict.listDict[listName] + "')/"
			+ "items?$select=ID,Title" 
				+ "," + appDict.fieldDict["Vehicle"] + "/Id"
				+ "," + appDict.fieldDict["Vehicle"] + "/Title"
			+ "&$expand=" + appDict.fieldDict["Vehicle"] + "/Id"
		    + "&$filter=ID eq " + self.profileId;
	    ;
	    var call = $.ajax({
	        url: endpoint,
	        type: "GET",
	  		dataType: "json",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	            "Accept": "application/json; odata=verbose",
	            "Content-Type": "application/json; odata=verbose"
	        },
	    });
	    call .done(function(data, textStatus, jqXHR) {
	    	self.selectedVehicles .removeAll();
	    	var profile = data.d.results[0];
		      var vehicleArray = profile[appDict.fieldDict["Vehicle"]].results;
		      for (var j = 0; j < vehicleArray.length; j++) {
		            var v = new ProfileVehicle(vehicleArray [j].Id, vehicleArray [j].Title);
		             self.selectedVehicles .push(v);
		      }       
			loadAvailableVehicles();
	    }).fail(vtompErrorHandler);
	};
	
	self.removeVehicle = function(profileVehicle) {
	    var listName = "Profiles";
		var etag = self.editingProfileEntity.entityAspect.extraMetadata.etag;
		var newVehiclesValue = _.pluck(_.filter(self.selectedVehicles(), function(vehicle) { return vehicle.id != profileVehicle.id; }), 'id');
	    var data = {
	    	__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(listName)}
	    };
	    data[appDict.fieldDict["Vehicle"] + "Id"] = {"results" : newVehiclesValue};
		var post= jQuery.ajax({
		    url: _spPageContextInfo.webAbsoluteUrl +
		        "/_api/Web/Lists/getByTitle('" + appDict.listDict[listName] + "')/Items(" + self.profileId + ")",
		    type: "POST",
		    data: JSON.stringify(data),
		    headers: {
		        Accept: "application/json;odata=verbose",
		        "Content-Type": "application/json;odata=verbose",
		        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
		        "IF-MATCH": etag ,
		        "X-Http-Method": "PATCH"
		    }
		});
	    post.then(function(data, textStatus, jqXHR) {
			self.editingProfileEntity.entityAspect.extraMetadata.etag =  jqXHR.getResponseHeader("Etag");
			self.setLastModified(moment(jqXHR.getResponseHeader("Last-Modified").replace("GMT", "+0000"),'ddd, DD MMM YYYY HH:mm:ss Z').toDate());
		    self.availableVehicles .push(profileVehicle);
			self.selectedVehicles .remove(function(v) {
				return profileVehicle.id == v.id;
			});
		}).fail(vtompErrorHandler);
	};
	
	self.addVehicle = function() {
	    var listName = "Profiles";
		var etag = self.editingProfileEntity.entityAspect.extraMetadata.etag;
		var newVehiclesValue = _.pluck(self.selectedVehicles(), 'id');
		console.log(newVehiclesValue);
		newVehiclesValue.push(self.selectedAvailableVehicles().id);
	    var data = {
	    	__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(listName)}
	    };
	    data[appDict.fieldDict["Vehicle"] + "Id"] = {"results" : newVehiclesValue};
		var post= jQuery.ajax({
		    url: _spPageContextInfo.webAbsoluteUrl +
		        "/_api/Web/Lists/getByTitle('" + appDict.listDict[listName] + "')/Items(" + self.profileId + ")",
		    type: "POST",
		    data: JSON.stringify(data),
		    headers: {
		        Accept: "application/json;odata=verbose",
		        "Content-Type": "application/json;odata=verbose",
		        "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
		        "IF-MATCH": etag ,
		        "X-Http-Method": "PATCH"
		    }
		});
	    post.then(function(data, textStatus, jqXHR) {
			self.editingProfileEntity.entityAspect.extraMetadata.etag =  jqXHR.getResponseHeader("Etag");
			self.setLastModified(moment(jqXHR.getResponseHeader("Last-Modified").replace("GMT", "+0000"),'ddd, DD MMM YYYY HH:mm:ss Z').toDate());
		    self.selectedVehicles .push(self.selectedAvailableVehicles());
			self.availableVehicles .remove(function(v) {
				return self.selectedAvailableVehicles().id == v.id;
			});
		}).fail(vtompErrorHandler);
	};
	
	return self;

});