define(['ko'
, "../fieldDict"
 , "./crudstate"
],function(ko
, appDict
, crudstate
){

	var self = {};
	
	self.companyId = null;

	self.CompanyPOC = function(name, title, workPhone, mobilePhone, email, resturi, etag, id) {
		this.name = name;
		this.title = title;
		this.workPhone = workPhone;
		this.mobilePhone = mobilePhone;
		this.email = email;
		this.resturi= resturi;
		this.etag= etag;
		this.id=id;
		this.pocType=ko.observable();
		this.relCompanyPOC=ko.observable();
		this.isPrimary = ko.computed(function() {
			return this.pocType() == "Primary";
		}, this);
		this.isSecondary = ko.computed(function() {
			return this.pocType() == "Secondary";
		}, this);
		this.editUrl="#/editprofile/" + id;
	};
	self.RelCompanyPOC = function(resturi, etag) {
		this.resturi=resturi;
		this.etag=etag;


	};
	self.selectedCompanyPOCs = ko.observableArray();
	self.availableCompanyPOCs = ko.observableArray();
	self.selectedAvailableCompanyPOCs = ko.observable();
	self.skipCompanyPOCsChangedAction = false;
	
	crudstate.changeEvents.companyPOCUpdated.actions.push(function (profileId, etag) {
		if (self.companyId) {
			var changedPOC = findPOCInLists(profileId);
			if (changedPOC) {
				changedPOC.etag = etag;
			}
		}
	});
	crudstate.changeEvents.profileDeleted.actions.push(function (profileId) {
		if (self.companyId) {
			var changedPOC = findPOCInLists(profileId);
			if (changedPOC) {
				resetAllPOCs();
			}
		}
	});
	crudstate.changeEvents.companyPOCsChanged.actions.push(function () {
		if (self.companyId && !self.skipCompanyPOCsChangedAction ) {
			resetAllPOCs();
		}
	});
	function findPOCInLists(profileId) {
		var changedPOC = ko.utils.arrayFirst(self.selectedCompanyPOCs(), function(poc) {
			return poc.id == profileId;
		});
		if (!changedPOC) { //check availables
			changedPOC = ko.utils.arrayFirst(self.availableCompanyPOCs(), function(poc) {
				return poc.id == profileId;
			});
		}
		return changedPOC ;
	}
	function resetAllPOCs() {
		self.selectedCompanyPOCs.removeAll();
		self.availableCompanyPOCs.removeAll();
		self.selectedAvailableCompanyPOCs(null);
		self.getCompanyPOCs(self.companyId);
	}
	function fireCompanyPOCsChangedEvent() {
		self.skipCompanyPOCsChangedAction = true;
		crudstate.changeEvents.companyPOCsChanged.fire(function() {
			self.skipCompanyPOCsChangedAction = false;
		});
	}
	
	self.addAvailablePOCtoCompanyPOCs = function() {
		var poc = self.selectedAvailableCompanyPOCs();
	    var listName = "Profiles";
	    var data = {
	    	__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(listName)}
	    	, 'CompanyId' : self.companyId
	    };
	    var post = $.ajax({
	        url: poc .resturi,
	  		data: JSON.stringify(data),
	        type: "POST",
	        headers: {
		        Accept: "application/json;odata=verbose"
		        , "Content-Type": "application/json;odata=verbose"
	            , "X-RequestDigest": $("#__REQUESTDIGEST").val()
				, 'X-HTTP-Method': 'MERGE'
				, 'If-Match': poc .etag// || "*" 
	        }
	    });
	    post.then(function(data, textStatus, jqXHR) {

			self.availableCompanyPOCs .remove(function(availablePOC) {
				return availablePOC.name == poc.name;
			});
			poc .etag = jqXHR.getResponseHeader("Etag");
	    	self.selectedCompanyPOCs.push(poc );
			fireCompanyPOCsChangedEvent();
			vtompShowNotification('POC Added to company', true);
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
		});
	}
	self.setCompanyPOCType = function(type, companyPOC) {
		var currentPOC = ko.utils.arrayFirst(self.selectedCompanyPOCs(), function(poc) {
			return poc.pocType() == type;
		});
		if (currentPOC) {
			self.removeCompanyPOCRel(currentPOC);
		}
	
	    var listName = "RelProfilesCompanies";
	    var data = {
	    	__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(listName)}
	    	, 'POCType' : type //'Secondary'
	    };
	    var resturi = companyPOC.relCompanyPOC() ? companyPOC.relCompanyPOC().resturi
	    					: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
				+ "items";
		var headers = {
		        Accept: "application/json;odata=verbose"
		        , "Content-Type": "application/json;odata=verbose"
	           , "X-RequestDigest": $("#__REQUESTDIGEST").val()
	        };
	    if ( companyPOC.relCompanyPOC() ) {
	    	headers['X-HTTP-Method'] = 'MERGE';
	    	headers['If-Match'] = companyPOC.relCompanyPOC().etag;
	    } else {
	    	data['CompanyId'] = self.companyId;
	    	data['ProfileId'] = companyPOC.id;
	    }
	    var post = $.ajax({
	        url: resturi ,
	        type: "POST",
	  		data: JSON.stringify(data),
	        headers: headers
	    });
	    post.then(function(data, textStatus, jqXHR) {
	    	if ( !companyPOC.relCompanyPOC() ) {
		    	var val = data.d;
				var rel = new self.RelCompanyPOC(val.__metadata.uri
	             							, val.__metadata.etag);
				companyPOC.relCompanyPOC(rel);
			} else {
				companyPOC.relCompanyPOC().etag = jqXHR.getResponseHeader("Etag");
			}
			companyPOC.pocType(type);
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
		});
	};
	self.removeCompanyPOCRel = function(companyPOC) {
	    var post = $.ajax({
	        url: companyPOC.relCompanyPOC().resturi,
	        type: "POST",
	        headers: {
		        Accept: "application/json;odata=verbose"
		        , "Content-Type": "application/json;odata=verbose"
	           , "X-RequestDigest": $("#__REQUESTDIGEST").val()
				, 'X-HTTP-Method': 'DELETE'
				, 'If-Match': companyPOC.relCompanyPOC().etag //|| "*" 
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {
			companyPOC.relCompanyPOC(null);
			companyPOC.pocType(null);
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
		});
		return post;
	};
	self.removeCompanyPOC = function(companyPOC, event, skipNotice) {
		if (!skipNotice && !confirm("remove " + companyPOC.name + "?")) {
			return;
		}
		if (companyPOC.pocType()) {
			self.removeCompanyPOCRel(companyPOC)
				.then(function(data, textStatus, jqXHR) {
					self.removeCompanyPOC(companyPOC, null, true);
				});
			return;
		}
	    var listName = "Profiles";
	    var data = {
	    	__metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(listName)}
	    	, 'CompanyId' : null
	    };
	    var post = $.ajax({
	        url: companyPOC.resturi,
	        type: "POST",
	  		data: JSON.stringify(data),
	        headers: {
		        Accept: "application/json;odata=verbose"
		        , "Content-Type": "application/json;odata=verbose"
	           , "X-RequestDigest": $("#__REQUESTDIGEST").val()
				, 'X-HTTP-Method': 'MERGE'
				, 'If-Match': companyPOC.etag //|| "*" 
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {

			self.selectedCompanyPOCs .remove(function(selectedCompanyPOC) {
				return selectedCompanyPOC.name == companyPOC.name;
			});
			companyPOC.etag = jqXHR.getResponseHeader("Etag");
	    	self.availableCompanyPOCs .push(companyPOC);
			fireCompanyPOCsChangedEvent();
			vtompShowNotification('POC removed from company', true);
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
		});

	};

	self.getPrimaryAndSecondaryCompanyPOCs = function(companyId) {
		    var listName = "RelProfilesCompanies";
		    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
				+ "items?$select="
				+ "Profile/Name,Profile/Title,POCType,Company/Id"
				+ ",Profile/" + appDict.fieldDict["WorkPhone"]
				+ ",Profile/" + appDict.fieldDict["Email"]
				+ ",Profile/" + appDict.fieldDict["MobilePhone"]

				+ "&$expand=Profile/Id,Company/Id"
				+ "&$filter=Company/Id eq " + companyId
		    ;
		    var getpocs = $.ajax({
		        url: endpoint,
		        type: "GET",
		  		dataType: "json",
		        headers: {
		            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
		            "Accept": "application/json; odata=verbose",
		            "Content-Type": "application/json; odata=verbose"
		        },
		    });
			return getpocs;
	};
	
	self.getCompanyPOCs = function(companyId) {
	    var listName = "Profiles";
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
			+ "items?$select=ID,Title,Name,Company/Id" 
				+ "," + appDict.fieldDict["WorkPhone"]
				+ "," + appDict.fieldDict["Email"]
				+ "," + appDict.fieldDict["MobilePhone"]
			+ "&$expand=Company/Id"
			+ "&$filter=Company/Id eq " + companyId
			+ "&$orderby=Name asc"
	    ;
	    var getpocs= $.ajax({
	        url: endpoint,
	        type: "GET",
	  		dataType: "json",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	            "Accept": "application/json; odata=verbose",
	            "Content-Type": "application/json; odata=verbose"
	        },
	    });
	    getpocs.then(function(data, textStatus, jqXHR) {
	    	self.selectedCompanyPOCs.removeAll();
             $.each(data.d.results, function (key, val) {
	            var poc = new self.CompanyPOC(val.Name, val.Title
	             	, val[appDict.fieldDict["WorkPhone"]]
	             	, val[appDict.fieldDict["MobilePhone"]]
	             	, val[appDict.fieldDict["Email"]]
	             	, val.__metadata.uri
	             	, val.__metadata.etag
	             	, val.Id
	             	);
	             self.selectedCompanyPOCs.push(poc);
            });
            loadAvailablePOCs ();
	    })
	    .then(function() {
		    var listName = "RelProfilesCompanies";
		    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
					+ "items?$select="
					+ "Profile/Name,Profile/Title,POCType,Company/Id"
					+ "&$expand=Profile/Id,Company/Id"
		    		+ "&$filter=Company/Id eq " + self.companyId;
	
		    var post = $.ajax({
		        url: endpoint,
		        type: "GET",
		        headers: {
		            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
		            "Accept": "application/json; odata=verbose",
		            "Content-Type": "application/json; odata=verbose"
		        },
		    });
		    post.then(function(data, textStatus, jqXHR) {
				    	$.each(data.d.results, function (key, val) {
				    		var poc = _.findWhere(self.selectedCompanyPOCs(), {name: val.Profile.Name});
				    		if (poc) {
					    		var rel = new self.RelCompanyPOC(val.__metadata.uri
		             							, val.__metadata.etag);
								poc.pocType(val.POCType);
								poc.relCompanyPOC(rel);
							}
						});
		    });
			post.fail(vtompErrorHandler);
	    });
	};
	
	var updateProfileCompanyRelTypes = function() {
	
	};

	var loadAvailablePOCs = function() {
	    var listName = "Profiles";
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
			+ "items?$select=ID,Title,Name,Company/Id" 
				+ "," + appDict.fieldDict["WorkPhone"]
				+ "," + appDict.fieldDict["Email"]
				+ "," + appDict.fieldDict["MobilePhone"]
			+ "&$expand=Company/Id"
			+ "&$orderby=Name asc"
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
	    	self.availableCompanyPOCs.removeAll();
             $.each(data.d.results, function (key, val) {
             	if (!_.findWhere(self.selectedCompanyPOCs(), {name: val.Name }) && !val.Company.Id) {
		            var poc = new self.CompanyPOC(val.Name, val.Title
		             	, val[appDict.fieldDict["WorkPhone"]]
		             	, val[appDict.fieldDict["MobilePhone"]]
		             	, val[appDict.fieldDict["Email"]]
		             	, val.__metadata.uri
		             	, val.__metadata.etag
		             	, val.Id
		             	);
		             self.availableCompanyPOCs.push(poc );
				}
            });
	    });
	
	};
	
	return self;
});