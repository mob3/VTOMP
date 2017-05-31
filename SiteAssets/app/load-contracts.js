'use strict';
 
 define(['ko', "./fieldDict", "./load-user-attributes", "./crud/companies","./crud/profiles","./breeze-app-model", "datatables"], function(ko, appDict, userAttribs, companies, profiles, entityManager) {
 var self = {};
 var _moduleName = "load-contracts";
		
	//Holds information for the user vehicles.	
	 self.selectedVehicleOfCurrentUser = ko.observable();
	 self.vehiclesOfCurrentUser = ko.observableArray();
	 self.vehicles = {};
	 self.currentUser = ko.observable();
	 self.companyId= ko.observable();
	 
	 var editingUserEntity = null;
	 
	 /*
	  *Loads the vehicle information of the user from userAttribs.
	  */
	 userAttribs.userAttributesLoadedPromise.then(function() {
		 self.selectedVehicleOfCurrentUser(userAttribs.currentVehicle);
		 userAttribs.currentVehicle = self.selectedVehicleOfCurrentUser();
		 
		 //Load the vehicles from userAttribs and add to vehiclesOfCurrentUser.
		 $.each(userAttribs.vehiclesOfCurrentUser, function(key,val) {
			 console.log(key + ":" + val);
			 self.vehiclesOfCurrentUser.push({name: val});
		 });
		 
		 self.vehicles = userAttribs.vehicles;
	 
		 self.currentUser(userAttribs.profileName);
		 self.companyId("#/editcompany/" + userAttribs.companyIdOfCurrentUser);
		 
		 console.log("selected vehicle: " + self.selectedVehicleOfCurrentUser());
		 console.log("vehicles count: " + self.vehiclesOfCurrentUser().length);
		 
	 });
	 
	 /*
	 *	Updates the vehicle of the current user. 
	 */
	 self.change_vehicle = function(vehicle) {
		 //If vehicle selected is current don't update.
		 if(vehicle.name != self.selectedVehicleOfCurrentUser()) {
			self.selectedVehicleOfCurrentUser(vehicle.name);
			userAttribs.currentVehicle = vehicle.name;
			console.log("user attribs changed: " + userAttribs.currentVehicle);
			
			(entityManager.saveChanges().then(function(saveResults) {
				console.log(saveResults);
			}));
			
			
			updateVehicle();
			//console.log(self.preStatusArchived());
			
			//Reload the contracts.
			if (self.preStatusArchived()) {
					loadContracts(vtomp_Constants.STATUS_ARCHIVED, false);
			} else {
					loadContracts(vtomp_Constants.STATUS_ACTIVE, false);
			}
			
			//Reload the companies.
			companies.companiesLoaded = false;
			if (window.location.href.search("teamoverview") != -1) 
				companies.loadCompanies();
			
			//Reload the profiles.
			profiles.loadProfilesCalled = false;
			if (window.location.href.search("profiles") != -1) 
				profiles.loadProfiles();
		 }
	 };
	 
	 /*
	  * Updates currentVehicle for the user on server.
	  */
	 function updateVehicle() {
			var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists/GetByTitle(\'' 
								+ appDict.listDict["Profiles"] + '\')/items(' + userAttribs.profileListIdOfCurrentUser + ')';
			console.log(requestUri);
			
			var requestHeaders = { 
				'accept': 'application/json;odata=verbose'
				, 'X-RequestDigest': $('#__REQUESTDIGEST').val(), 
				'X-HTTP-Method': 'MERGE'
				, 'If-Match': "*"
				,"Content-Type": "application/json;odata=verbose"
				}; 
				
			//Send request to sharepoint server to update current vehicle. 
			var post = $.ajax({
				url: requestUri,
				method: "POST",
				data: JSON.stringify({ __metadata: { 'type': vtompSPRestClientTypeNameToServerDefault(appDict.listDict["Profiles"]) }, 'CurrentVehicle':  self.selectedVehicleOfCurrentUser()}),
				headers: requestHeaders 
			});
			
			post.then(function(data, textStatus, jqXHR) {})
			post.fail(function() {
				console.log("Update Failed");
			});	
	 }
	 
	 
	 /* Archived contracts loading */
	 self.preStatusPrePublished = ko.observable(false);
	 self.preStatusArchived = ko.observable(false);
	 self.preStatusArchived.subscribe(function(showArchived) {
 		 console.log("the new showArchived value is " + showArchived);  
 		 if (showArchived) {
				loadArchivedContractsRan = false;
 		 	 	Backbone.history.navigate('/contracts/archived', true);
		} else {
			loadActiveContractsRan = false;
			Backbone.history.navigate('', true);
		}
	 }, self);
	 self.resetRanCache = function() {
			console.log("Reset Ran Cache");
			loadArchivedContractsRan = false;
			loadActiveContractsRan = false;
			loadPrePublishedContractsRan = false;
	 };
	 var activeMethod = null;
	 
	var loadArchivedContractsRan = false;
	self.loadArchivedContracts = function() {
		console.log("Loading Archived Contracts");
		self.preStatusArchived(true);
		self.preStatusPrePublished(false);
		if (activeMethod == "loadArchivedContracts" || loadArchivedContractsRan ) {
			return;
		} else {
			activeMethod = "loadArchivedContracts"
			loadArchivedContractsRan = true;
			loadContracts(vtomp_Constants.STATUS_ARCHIVED, false);
		}
	};
	var loadActiveContractsRan = false;
	
	self.loadActiveContracts = function() {
		console.log("Loading Active Contracts");
		self.preStatusArchived(false);
		self.preStatusPrePublished(false);
		loadContracts(vtomp_Constants.STATUS_ACTIVE, false);
		if (activeMethod == "loadActiveContracts" || loadActiveContractsRan ) {
			return;
		} else {
			activeMethod = "loadActiveContracts"
			loadActiveContractsRan = true;
			userAttribs.userAttributesLoadedPromise.then(function() {
				loadContracts (vtomp_Constants.STATUS_ACTIVE, false );
			});
		} 
	};
	
	
	var loadPrePublishedContractsRan = false;
	
	self.loadPrePublishedContracts = function() {
		console.log("Loading prePublished Contracts");
		self.preStatusArchived(false);
		self.preStatusPrePublished(true);
		if (activeMethod == "loadPrePublishedContracts" || loadPrePublishedContractsRan ) {
			return;
		} else {
			activeMethod = "loadPrePublishedContracts"
			loadPrePublishedContractsRan = true;
			loadContracts (vtomp_Constants.STATUS_PREPUBLISHED, false);
		}
	};
	var tableLookup = new Object;
	tableLookup["loadArchivedContracts"] = "archivedContractsTable";
	tableLookup["loadActiveContracts"] = "activeContractsTable";
	tableLookup["loadPrePublishedContracts"] = "prepublishedContractsTable";
	
	
	
	/*
	 *Load the contracts depending on users current vehicle.
	 */
	function loadContracts (preStatusVal, isAdmin) {
		vtompPleaseWaitMsg.showPleaseWait(_moduleName);
	    var caml = "<View><Query>";
	    if (!isAdmin) {
			//If vehicle is 'All' load for each current vehicle.
			if (self.selectedVehicleOfCurrentUser() == "All") {
				console.log("All Vehicles requested");
				caml += "<Where><And><In><FieldRef Name='" + appDict.fieldDict["Vehicle"] + "' /><Values>";
				for (var i = 0; i < self.vehiclesOfCurrentUser().length; i++) {
					if (self.vehiclesOfCurrentUser()[i].name != "All") {
						caml += "<Value Type='Text'>" + self.vehiclesOfCurrentUser()[i].name + "</Value>";
					}
				}
				caml += "</Values></In><Eq><FieldRef Name='" + appDict.fieldDict["TeamingStatus"] 
		    	+ "'/><Value Type='Text'>" + preStatusVal + "</Value></Eq></And></Where>";
				console.log(caml);

			//Else load only the current vehicle.
			} else {
					console.log("current vehicle of user is " + self.selectedVehicleOfCurrentUser());
				caml += "<Where><And><In><FieldRef Name='" + appDict.fieldDict["Vehicle"] 
		    	+ "' /><Values>"
				caml += "<Value Type='Text'>" + self.selectedVehicleOfCurrentUser() + "</Value>";
		    	caml += "</Values></In><Eq><FieldRef Name='" + appDict.fieldDict["TeamingStatus"] 
		    	+ "'/><Value Type='Text'>" + preStatusVal + "</Value></Eq></And></Where>";
			}
		
		}
	    caml += "  </Query> <ViewFields><FieldRef Name='ID' /><FieldRef Name='"
		    + appDict.fieldDict["Vehicle"] + "' />"
			+ "<FieldRef Name='Title' /><FieldRef Name='" 
	    	+ appDict.fieldDict["SolicitationNumber"] + "' />"
			+ "<FieldRef Name='Customer' /><FieldRef Name='Status' /><FieldRef Name='RFI_x0020_Submission_x0020_Due_x' /></ViewFields></View>";
	    var listName = appDict.listDict["Contracts"];
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/GetItems";
	    var requestData = { query: { __metadata: { 'type': 'SP.CamlQuery' }, ViewXml: caml } };
		console.log(requestData);
	    var post = $.ajax({
	        url: endpoint,
	        type: "POST",
	        data: JSON.stringify(requestData),
	        dataType: 'json',
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	            "Accept": "application/json; odata=verbose",
	            "Content-Type": "application/json; odata=verbose"
	        },
	    });
	    post.then(initDataTable);
	    post.fail(vtompErrorHandler);
	}
	
	/*
	* Build the data table in the contracts page.
	*/
	function initDataTable(data, textStatus, jqXHR) {
		console.log(data);
		var tableSel = '#' + tableLookup[activeMethod];
		if ($.fn.DataTable.isDataTable(tableSel )) {
			$(tableSel ).DataTable().clear().destroy();
		}
		
		//Put the information from the query in the table.
		$(tableSel ).DataTable({
		"bPaginate": false,
	    "bLengthChange": false,
	    "bFilter": false,
	    "bSort": true,
	    "bInfo": false,
	    "bAutoWidth": false,
		 "aaData": data.d.results,
	            "aoColumns": [
					{"mData": "Title"
	                 , "mRender": function(title, type, full) {
							return '<a href="#/viewcontract/' + full.ID + '" >' + title + '</a>';
				      }                  
	                },
					{"mData": 'ContractId'
						, "mRender": function(contractid) {
							return self.vehicles[contractid];
						}
						},
					{"mData": appDict.fieldDict["SolicitationNumber"] },
					{"mData": 'Customer' },
					{"mData": 'Status' },
					{
	                	"mData": "RFI_x0020_Submission_x0020_Due_x"
	                	, "sType": "date"
	      				, "mRender": function(date, type, full) {
							if(date == null) {
								return "";
							}
				          return  new Date(date).toDateString();
				      }                  
				    }
				]
		});
		vtompPleaseWaitMsg.hidePleaseWait(_moduleName);
	}
	return self;
});
