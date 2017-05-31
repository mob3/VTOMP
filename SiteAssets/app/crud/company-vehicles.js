define(["../fieldDict", 'ko', "moment" 
, "./crudstate"
],function(appDict, ko, moment
, crudstate
){

	var self = {};

	self.companyId = null;
	self.editingCompanyEntity = null;

	function CompanyVehicle(id, title) {
		this.id = id;
		this.title = title;
	};

	self.selectedCompanyVehicles= ko.observableArray();
	self.availableCompanyVehicles = ko.observableArray();
	self.selectedAvailableCompanyVehicles  = ko.observable();

	crudstate.changeEvents.vehicleUpdated .actions.push(function (vehicleId) {
		if (self.companyId) {
			self.getCompanyVehicles();
		}
	});
	crudstate.changeEvents.vehicleDeleted.actions.push(function (vehicleId) {
		if (self.companyId) {
			self.getCompanyVehicles();
		}
	});
	crudstate.changeEvents.vehicleCreated.actions.push(function (vehicleId) {
		if (self.companyId) {
			self.getCompanyVehicles();
		}
	});
	
	function loadAvailableVehicles() {
	    var listName = "Vehicles";
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + appDict.listDict[listName]+ "')/"
			+ "items?$select=ID,Title" 
			+ "&$orderby=Title asc"
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
	    	self.availableCompanyVehicles .removeAll();
             $.each(data.d.results, function (key, val) {
             	if (!_.findWhere(self.selectedCompanyVehicles (), {title : val.Title}) ) {
		            var v = new CompanyVehicle(val.ID, val.Title);
		             self.availableCompanyVehicles .push(v);
		        }
            });
	    });
	
	};

	self.getCompanyVehicles = function() {
	    var listName = "Companies";
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + appDict.listDict[listName] + "')/"
			+ "items?$select=ID,Title" 
				+ "," + appDict.fieldDict["Vehicle"] + "/Id"
				+ "," + appDict.fieldDict["Vehicle"] + "/Title"
			+ "&$expand=" + appDict.fieldDict["Vehicle"] + "/Id"
		    + "&$filter=ID eq " + self.companyId;
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
	    	self.selectedCompanyVehicles .removeAll();
	    	var profile = data.d.results[0];
		      var vehicleArray = profile[appDict.fieldDict["Vehicle"]].results;
		      for (var j = 0; j < vehicleArray.length; j++) {
		            var v = new CompanyVehicle(vehicleArray [j].Id, vehicleArray [j].Title);
		             self.selectedCompanyVehicles .push(v);
		      }       
			loadAvailableVehicles();
	    }).fail(vtompErrorHandler);
	};
	
	self.removeCompanyVehicle = function(companyVehicle) {
	    var listName = "Companies";
		var etag = self.editingCompanyEntity.entityAspect.extraMetadata.etag;
		var newVehiclesValue = _.pluck(_.filter(self.selectedCompanyVehicles(), function(vehicle) { return vehicle.id != companyVehicle.id; }), 'id');
	    var data = {
	    	__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(listName)}
	    };
	    data[appDict.fieldDict["Vehicle"] + "Id"] = {"results" : newVehiclesValue};
		var post= jQuery.ajax({
		    url: _spPageContextInfo.webAbsoluteUrl +
		        "/_api/Web/Lists/getByTitle('" + appDict.listDict[listName] + "')/Items(" + self.companyId + ")",
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
			self.editingCompanyEntity.entityAspect.extraMetadata.etag =  jqXHR.getResponseHeader("Etag");
		    self.availableCompanyVehicles .push(companyVehicle);
			self.selectedCompanyVehicles .remove(function(v) {
				return companyVehicle.id == v.id;
			});
		}).fail(vtompErrorHandler);
	};
	
	self.addCompanyVehicle = function() {
	    var listName = "Companies";
		var etag = self.editingCompanyEntity.entityAspect.extraMetadata.etag;
		var newVehiclesValue = _.pluck(self.selectedCompanyVehicles(), 'id');
		newVehiclesValue.push(self.selectedAvailableCompanyVehicles ().id);
	    var data = {
	    	__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(listName)}
	    };
	    data[appDict.fieldDict["Vehicle"] + "Id"] = {"results" : newVehiclesValue};
		var post= jQuery.ajax({
		    url: _spPageContextInfo.webAbsoluteUrl +
		        "/_api/Web/Lists/getByTitle('" + appDict.listDict[listName] + "')/Items(" + self.companyId + ")",
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
			self.editingCompanyEntity.entityAspect.extraMetadata.etag =  jqXHR.getResponseHeader("Etag");
		    self.selectedCompanyVehicles .push(self.selectedAvailableCompanyVehicles ());
			self.availableCompanyVehicles .remove(function(v) {
				return self.selectedAvailableCompanyVehicles ().id == v.id;
			});
		}).fail(vtompErrorHandler);
	};
	
	return self;

});