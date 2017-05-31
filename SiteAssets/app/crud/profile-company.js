define(['ko', "../fieldDict", "moment"
 , "./crudstate"
 , "./available-companies"
],function(ko, appDict, moment
, crudstate
, availableCompanies
) {

	var self = {};

	self.profileId = null;
	self.editingProfileEntity = null;
	self.setLastModified = null


	self.availableCompanies = ko.observableArray();
	self.selectedCompanyForEdit = ko.observable();
	self.selectedCompanyForRead = ko.observable(availableCompanies.ProfileCompany.emptyOne()); //need to initialize this for view


	self.skipCompanyPOCsChangedAction = false;
	function fireCompanyPOCsChangedEvent() {
		self.skipCompanyPOCsChangedAction = true;
		crudstate.changeEvents.companyPOCsChanged.fire(function() {
			self.skipCompanyPOCsChangedAction = false;
		});
	}
	
	crudstate.changeEvents.companyPOCsChanged.actions.push(function () {
		if (self.profileId && !self.skipCompanyPOCsChangedAction ) {
			self.selectedCompanyForEdit (null);
			self.selectedCompanyForRead (availableCompanies.ProfileCompany.emptyOne());
			loadProfileCompany(self.profileId);
		}
	});
	crudstate.changeEvents.companyDeleted.actions.push(function (companyId) {
		if (self.profileId && self.selectedCompanyForEdit() && self.selectedCompanyForEdit().id == companyId) {
			self.selectedCompanyForEdit (null);
			self.selectedCompanyForRead (availableCompanies.ProfileCompany.emptyOne());
		}
	});

	self.resetSelectedCompany = function() {
		self.selectedCompanyForEdit(null);
		self.selectedCompanyForRead(availableCompanies.ProfileCompany.emptyOne());
	};

	self.setSelectedCompany = function(companyId) {
		var currentCompany = ko.utils.arrayFirst(self.availableCompanies(), function(co) {
			return co.id == companyId;
		});
		if (currentCompany ) {
			self.selectedCompanyForEdit (currentCompany );
			self.selectedCompanyForRead (_.clone(currentCompany) );
		}
	};
	
	self.saveProfileCompany = function(saveResult) {
		    	if (self.selectedCompanyForRead().equals(self.selectedCompanyForEdit())) {
		    		var msg = saveResult.entities.length ? "previous changes made" : vtomp_Constants.NOTHING_TO_DO;
		    		return $.when(msg);
		    	}	
				var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists/getByTitle(\'' 
								+ appDict.listDict["Profiles"] + '\')/items(' + self.profileId  + ')';
				var requestData= { 
				__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(appDict.listDict["Profiles"])}
				}; 
				requestData[appDict.fieldDict["Company"] + "Id"] = self.selectedCompanyForEdit() ? self.selectedCompanyForEdit().id : null;
				var etag = self.editingProfileEntity.entityAspect.extraMetadata.etag;
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
					self.setLastModified(moment(jqXHR.getResponseHeader("Last-Modified").replace("GMT", "+0000"),'ddd, DD MMM YYYY HH:mm:ss Z').toDate());
					var savedLastCompanyId = self.selectedCompanyForRead().id;
					if (self.selectedCompanyForEdit()) {
						self.selectedCompanyForRead (_.clone(self.selectedCompanyForEdit()) );
					} else {
						self.selectedCompanyForRead (availableCompanies.ProfileCompany.emptyOne());
					}
					
					//delete any associated RelProfilesCompanies records
					var itemsToDelete = [];
					$.when(getRelItemsToDelete(itemsToDelete, savedLastCompanyId)).then(function () {
					    $.when.apply($, itemsToDelete).then(function(){
							fireCompanyPOCsChangedEvent();
					        saveDeff.resolve(textStatus);
					    });
					});
				}).fail(function(jqXHR, textStatus, errorThrown ) {
					saveDeff.reject(textStatus  + errorThrown );
				});
				return saveDeff.promise();
		    };
	
	function getRelItemsToDelete(itemsToDelete, savedLastCompanyId) {
		if (!savedLastCompanyId) {
			return $.when(); //an already resolved promise
		}
		var listName = "RelProfilesCompanies";
	    var requestUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getByTitle('" + appDict.listDict[listName]+ "')/" //items?$filter=Age eq 30 and Country eq 'US'")
						+ "items?$select="
					+ "Profile/Id,Company/Id"
					+ "&$expand=Profile/Id,Company/Id"
		    		+ "&$filter=Company/Id eq " + savedLastCompanyId + " and Profile/Id eq " + self.profileId;

	    //Return and ajax request (promise)
	    return $.ajax({
	        url: requestUrl,
	        type: "GET",
	        headers: {
	            "accept": "application/json;odata=verbose",
	        },
	        success: function(result) {
	            $.each(result.d.results, function(index, item){
	                //Note that we push the ajax-request to the array
	                //that has been declared a bit down
	                itemsToDelete.push(deleteItem(item));
	            });            
	        },
	        error: vtompErrorHandler
	    });    
	}
	
	function deleteItem (item) {
	    //All SP.ListItems holds metadata that can be accessed in the '__metadata' attribute
	    var requestUrl = item.__metadata.uri;
	
	    return $.ajax({
	        url: requestUrl,
	        type: "POST",
	        headers: {
	            "accept": "application/json;odata=verbose",
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	            "IF-MATCH": item.__metadata.etag,
	            "X-HTTP-Method": "DELETE"
	        },
	        success: function() {
	            console.log("Item with ID " + item.__metadata.id + " successfully deleted!");
	        },
	        error: vtompErrorHandler
	    });    
	}

	function loadProfileCompany(profileId ) {
	    var listName = appDict.listDict["Profiles"];
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
			+ "items?$select="
			+ appDict.fieldDict["Company"] + "/Id"
	
			+ "&$expand=" + appDict.fieldDict["Company"] + "/Id"
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
				self.editingProfileEntity.entityAspect.extraMetadata.etag =  dat.__metadata.etag;
				if (dat[appDict.fieldDict["Company"]].Id) {
					self.setSelectedCompany (dat[appDict.fieldDict["Company"]].Id);
				}
             }
	    });
	};


	availableCompanies.loadAvailableCompanies(self.availableCompanies);
	return self;

});