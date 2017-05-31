	'use strict';

define(["../fieldDict"], function(appDict) {

	var self = {}, lookups = {}, moduleName = "crudmetamodel";

	self.appVehicles = [];
	self.appVehiclesLoadPromise = null;
	
	function AppVehicle(id, title) {
		this.id = id;
		this.title = title;
	};

	function loadAvailableVehicles() {
	    var listName = "Vehicles";
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + appDict.listDict[listName]+ "')/"
			+ "items?$select=ID,Title" 
			+ "&$orderby=Title asc"
	    ;
		//vtompPleaseWaitMsg.showPleaseWait(moduleName);
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
	    	self.appVehicles.splice(0,self.appVehicles.length); //empty array
             $.each(data.d.results, function (key, val) {
		            var v = new AppVehicle(val.ID, val.Title);
		             self.appVehicles .push(v);
            });
			vtompPleaseWaitMsg.hidePleaseWait(moduleName);
	    });
		self.appVehiclesLoadPromise = post;
	};
	loadAvailableVehicles();

		self.loadLookupsRan = false;
	self.LoadLookups =function() {
			return new Promise(function(resolve, reject) {
				if (!self.loadLookupsRan) {
					// Make sure the SharePoint script file 'sp.js' is loaded before your
					// code runs.
 					//vtompPleaseWaitMsg.showPleaseWait(moduleName);
					var promiseMethods = { resolve : resolve, reject : reject };
					SP.SOD.executeFunc('sp.js', 'SP.ClientContext', $.proxy(self.sharePointReady, promiseMethods ));
					self.loadLookupsRan =true;
				} else {
					resolve(lookups);
				}
			});
		};
// Create an instance of the current context.
		self.sharePointReady=function () {
		    var clientContext = SP.ClientContext.get_current();
		    var web = clientContext.get_web();
		
		  //  clientContext.load(web);
		    // Get the list
			var contractsList= web.get_lists().getByTitle(appDict.listDict["Contracts"]);
			
			this.PreStatusChoiceField = clientContext.castTo(contractsList.get_fields().getByInternalNameOrTitle(appDict.fieldDict["PreStatus"]),SP.FieldChoice);
			clientContext.load(this.PreStatusChoiceField );
		
			this.EmailToTeamChoiceField = clientContext.castTo(contractsList.get_fields().getByInternalNameOrTitle(appDict.fieldDict["EmailToTeam"]),SP.FieldChoice);
			clientContext.load(this.EmailToTeamChoiceField );
		
			this.TrackingStatusChoiceField = clientContext.castTo(contractsList.get_fields().getByInternalNameOrTitle(appDict.fieldDict["TrackingStatus"]),SP.FieldChoice);
			clientContext.load(this.TrackingStatusChoiceField );
		
			this.CompetitionTypeChoiceField = clientContext.castTo(contractsList.get_fields().getByInternalNameOrTitle(appDict.fieldDict["CompetitionType"]),SP.FieldChoice);
			clientContext.load(this.CompetitionTypeChoiceField);
		
			this.TeamingStatusChoiceField = clientContext.castTo(contractsList.get_fields().getByInternalNameOrTitle(appDict.fieldDict["TeamingStatus"]),SP.FieldChoice);
			clientContext.load(this.TeamingStatusChoiceField);
		
			this.ClearanceRequirementChoiceField = clientContext.castTo(contractsList.get_fields().getByInternalNameOrTitle(appDict.fieldDict["ClearanceRequirement"]),SP.FieldChoice);
			clientContext.load(this.ClearanceRequirementChoiceField);
		
			var companiesList= web.get_lists().getByTitle(appDict.listDict["Companies"]);

			this.BusinessSizeChoiceField = clientContext.castTo(companiesList.get_fields().getByInternalNameOrTitle(appDict.companyFieldsDict["BusinessSize"]),SP.FieldChoice);
			clientContext.load(this.BusinessSizeChoiceField);
		
			this.FacilityClearanceLevelChoiceField = clientContext.castTo(companiesList.get_fields().getByInternalNameOrTitle(appDict.companyFieldsDict["FacilityClearanceLevel"]),SP.FieldChoice);
			clientContext.load(this.FacilityClearanceLevelChoiceField);
		
			this.ContractorLevelChoiceField = clientContext.castTo(companiesList.get_fields().getByInternalNameOrTitle(appDict.companyFieldsDict["ContractorLevel"]),SP.FieldChoice);
			clientContext.load(this.ContractorLevelChoiceField);
		
			this.DHSComponentExperienceChoiceField = clientContext.castTo(companiesList.get_fields().getByInternalNameOrTitle(appDict.companyFieldsDict["DHSComponentExperience"]),SP.FieldChoice);
			clientContext.load(this.DHSComponentExperienceChoiceField);
		
			clientContext.executeQueryAsync(Function.createDelegate(this , self.onSuccessMethod),Function.createDelegate(this , self.onFailureMethod));
			   // clientContext.executeQueryAsync(onRequestSucceeded, onRequestFailed);
	   };
	   self.onSuccessMethod = function (sender, args) {
			lookups.PreStatusChoiceFieldChoiceValues = this.PreStatusChoiceField.get_choices();
			lookups.EmailToTeamChoiceFieldChoiceValues = this.EmailToTeamChoiceField.get_choices();
			lookups.TrackingStatusChoiceFieldChoiceValues = this.TrackingStatusChoiceField.get_choices();
			lookups.CompetitionTypeChoiceFieldChoiceValues = this.CompetitionTypeChoiceField.get_choices();
			
			lookups.TeamingStatusChoiceFieldChoiceValues = this.TeamingStatusChoiceField.get_choices();
			
			lookups.ClearanceRequirementChoiceFieldChoiceValues = this.ClearanceRequirementChoiceField.get_choices();

			lookups.BusinessSizeChoiceFieldChoiceValues = this.BusinessSizeChoiceField.get_choices();
			lookups.FacilityClearanceLevelChoiceFieldChoiceValues = this.FacilityClearanceLevelChoiceField.get_choices();
			lookups.ContractorLevelChoiceFieldChoiceValues = this.ContractorLevelChoiceField.get_choices();
			lookups.DHSComponentExperienceChoiceFieldChoiceValues = this.DHSComponentExperienceChoiceField.get_choices();

		
			
			//myChoicesfield.Choices  – >will give you all choices
			
			//myChoicesfield.DefaultValue  -> will give you the default choice value
			vtompPleaseWaitMsg.hidePleaseWait(moduleName);
			this.resolve(lookups);
		};
		self.onFailureMethod = function(sender, args) {
			vtompPleaseWaitMsg.hidePleaseWait(moduleName);
			this.reject(args);
		//	alert("Error " + args);
		};
	return self;
});