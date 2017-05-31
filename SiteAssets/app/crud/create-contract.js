define(["../breeze-app-model", "../fieldDict", 'ko', "moment", "backbone"

// ,"../bbnav"
 , "../apputil"
, "../load-user-attributes"
 , "./crudmetamodel"
 , "./vehicles"
],function(entityManager, appDict, ko, moment, Backbone
//	, bbnav
 			, appUtil
, userAttribs
 			, crudmetamodel
			, vehicles
){

	var self = {};

	function ContractVehicle(id, title) {
		this.id = id;
		this.title = title;
	};
	
	var peopleFields=["NewContractCaptureManager", "NewContractProgramManager", "NewContractTeamingCoordinator"];

    self.PreStatusChoices= ko.observableArray();//choices);
    self.EmailToTeamChoices= ko.observableArray();//choices);
    self.TrackingStatusChoices= ko.observableArray();//choices);
    self.CompetitionTypeChoices = ko.observableArray();//["SDVOSB", "Small Business", "8(a)"]);
    self.TeamingStatusChoices = ko.observableArray();//choices);
    self.ClearanceRequirementChoices= ko.observableArray();//choices);

	self.availableVehicles = ko.observableArray();
	self.selectedVehicleForEdit = ko.observable();
	self.holdOn = ko.observable();

	function loadAvailableVehicles() {
    	self.availableVehicles .removeAll();
    	userAttribs.userAttributesLoadedPromise.then(function() {
	    	crudmetamodel.appVehiclesLoadPromise.then(function() {
				$.each(userAttribs.vehiclesOfCurrentUser, function(key, val) {
					var appVehicle;
		         	if (appVehicle = _.findWhere(crudmetamodel.appVehicles, {title : val}) ) {
			            var v = new ContractVehicle(appVehicle.id, appVehicle.title );
			             self.availableVehicles .push(v);
			        }
				});
	    	});
    	});
	};
	
	function sometimesThough() {
		console.log("sometimesThough");
	};

	self.editFields = {
	    Title : ko.observable(),
	    StatusObj : ko.observable(),//this.statusChoices.find("id", {"id" : "Won", "name" : "Won"})),
	    Status : ko.observable(),//self.StatusObj().name);
	    SolicitationNumber : ko.observable(),
	    Customer : ko.observable(),
	    Created : ko.observable(),
	    Description : ko.observable(),
	    EmailNote: ko.observable(),
	    DueDate : ko.observable() //Due Date
        , CompetitionType : ko.observableArray()//["SDVOSB", "8(a)"])
        , CustomerAgencyShort : ko.observable()
        , PartnerResponseNeededBy : ko.observable()
        , ReferenceNumber : ko.observable()
        , TeamingStatus : ko.observable()
        , TypeofSolicitation : ko.observable()
        , ProjectStart : ko.observable()
        , ProjectEnd : ko.observable()
        , PlaceofPerformance : ko.observable()
        , LOEEstimate: ko.observable()
        , IncumbentContractors: ko.observable()
        , DateReleased: ko.observable()
        , ClearanceRequirement: ko.observable()
        , TrackingStatus: ko.observable()
        , PreStatus: ko.observable()
        , EmailToTeam: ko.observable("Do NOT Email")
	};


	self.initCreateContract = function() {
		loadAvailableVehicles();
		initializePeoplePickers();	
		initializeDatePickers();
		crudmetamodel.LoadLookups()
			.then(function(lookups){
				self.PreStatusChoices(lookups.PreStatusChoiceFieldChoiceValues);
				self.EmailToTeamChoices(lookups.EmailToTeamChoiceFieldChoiceValues);
				self.TrackingStatusChoices(lookups.TrackingStatusChoiceFieldChoiceValues);
				self.CompetitionTypeChoices(lookups.CompetitionTypeChoiceFieldChoiceValues);
				self.TeamingStatusChoices(lookups.TeamingStatusChoiceFieldChoiceValues);
				self.ClearanceRequirementChoices(lookups.ClearanceRequirementChoiceFieldChoiceValues);
			}, function(errorArgs) {
							vtompShowNotification("Error " + errorArgs, false);
			})
	};
	
    self.SaveContract= function () {
		getUserInfo(function(peopleIds) { //Other_x0020_POC_x0020_1Id) {
		    var listName = "Contracts";
			var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists/getByTitle(\'' 
			+ appDict.listDict[listName] + '\')/items'; 
				
			var type =vtompSPRestClientTypeNameToServerDefault(appDict.listDict[listName]);
			var requestHeaders = { 
			'Accept': 'application/json;odata=verbose'
			, 'X-RequestDigest': $('#__REQUESTDIGEST').val()
			 }; 
			var contractData = { 
			__metadata: { 'type': type }
			, Title: self.editFields.Title() 
			, Customer: self.editFields.Customer()
			, Description: self.editFields.Description()
			}; 
			contractData[appDict.fieldDict["CompetitionType"]] = {
					"__metadata": { type: "Collection(Edm.String)" },
					results: self.editFields.CompetitionType()
				};
			if (self.editFields.DueDate()) {
				contractData[appDict.fieldDict["DueDate"]] = moment(self.editFields.DueDate()).format('MM-DD-YYYY');
			}
			contractData[appDict.fieldDict["EmailNote"]] = self.editFields.EmailNote();
			contractData[appDict.fieldDict["SolicitationNumber"]] = self.editFields.SolicitationNumber();
			contractData[appDict.fieldDict["CustomerAgencyShort"]] = self.editFields.CustomerAgencyShort();
			if (self.editFields.PartnerResponseNeededBy()) {
				contractData[appDict.fieldDict["PartnerResponseNeededBy"]] = moment(self.editFields.PartnerResponseNeededBy()).format('MM-DD-YYYY');
			}
			contractData[appDict.fieldDict["ReferenceNumber"]] = self.editFields.ReferenceNumber();
			contractData[appDict.fieldDict["TeamingStatus"]] = self.editFields.TeamingStatus();
			contractData[appDict.fieldDict["TrackingStatus"]] = self.editFields.TrackingStatus();
			contractData[appDict.fieldDict["PreStatus"]] = self.editFields.PreStatus();
			contractData[appDict.fieldDict["EmailToTeam"]] = self.editFields.EmailToTeam();
			contractData[appDict.fieldDict["TypeofSolicitation"]] = self.editFields.TypeofSolicitation();
			contractData[appDict.fieldDict["CaptureManager"]+"Id"] = peopleIds["NewContractCaptureManager"];
			contractData[appDict.fieldDict["ProgramManager"]+"Id"] = peopleIds["NewContractProgramManager"];
			contractData[appDict.fieldDict["TeamingCoordinator"]+"Id"] = peopleIds["NewContractTeamingCoordinator"];
			
			if (self.editFields.ProjectStart()) {
				contractData[appDict.fieldDict["ProjectStart"]] = moment(self.editFields.ProjectStart()).format('MM-DD-YYYY');
			}
			if (self.editFields.ProjectEnd()) {
				contractData[appDict.fieldDict["ProjectEnd"]] = moment(self.editFields.ProjectEnd()).format('MM-DD-YYYY');
			}
			contractData[appDict.fieldDict["PlaceofPerformance"]] = self.editFields.PlaceofPerformance();
			contractData[appDict.fieldDict["LOEEstimate"]] = self.editFields.LOEEstimate();
			contractData[appDict.fieldDict["IncumbentContractors"]] = self.editFields.IncumbentContractors();
			contractData[appDict.fieldDict["DateReleased"]] = self.editFields.DateReleased();
			contractData[appDict.fieldDict["ClearanceRequirement"]] = self.editFields.ClearanceRequirement();
			contractData[appDict.fieldDict["Vehicle"] + "Id"] = self.selectedVehicleForEdit().id;
			$.ajax({ url: requestUri
			, type: 'POST'
			, contentType: 'application/json;odata=verbose'
			, headers: requestHeaders
			, data: JSON.stringify(contractData)
			, success: function (response){ 
			
				var newId = response.d.Id;
				vtompShowNotification(self.editFields.Title() + " successfully added!", true, function() {
		 			Backbone.history.navigate('/editcontract/' + newId, true);
				});
			}
			, error: function(err){ 				
						vtompShowNotification(err.status + " - " + err.statusText, false);
			}
			
			});
		
		});
    };
    function initializeDatePickers() {
	    //apply the datepicker to field
	    $('.datepicker').datepicker({ 
	        autoclose: true, 
	        todayHighlight: true
	  	});
	}

	function initializePeoplePickers() {
	    // Specify the unique ID of the DOM element where the
	    // picker will render.
		peopleFields.forEach(function(peopleField) {
			    vtompInitializePeoplePicker(peopleField + "PeoplePickerDiv");
		});

	}
	// Query the picker for user information.
	var getUserInfo = function(ensureUserSuccessCallback) {
	
		var peopleIds = {};
	
		var loadedUsers = {};
		    var context = new SP.ClientContext.get_current();
		peopleFields.forEach(function(peopleField) {
		    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peopleField + "PeoplePickerDiv_TopSpan"];
		    var users = peoplePicker.GetAllUserInfo();
		    if (users.length > 0) {
		    	var loginName = users[0].Key;
			    var user = context.get_web().ensureUser(loginName);
			    context.load(user);
			    loadedUsers[peopleField] = user;
		    } else {
			    loadedUsers[peopleField] = null;
		    }
		});
		
		var ensureUsersSuccess = function() {
			_.keys(loadedUsers).forEach(function(personField) {
				if (loadedUsers[personField]) {
					peopleIds[personField] = loadedUsers[personField].get_id();
				} else {
					peopleIds[personField] = null;//loadedUsers[personField].get_id();
				}
			});
			ensureUserSuccessCallback(peopleIds);
		}
	
	    context.executeQueryAsync(
	         Function.createDelegate(null, ensureUsersSuccess ), 
	         Function.createDelegate(null, function(err) {
	         							vtompShowNotification(err.status + " - " + err.statusText, false);
	        	 }
	         )
	    );
	}


	return self;


});