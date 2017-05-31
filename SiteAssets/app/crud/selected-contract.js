define(["../breeze-app-model", "../fieldDict", 'ko', "moment"
 , "./forum-comments"
 , "./gov-docs"
 , "../apputil"
, "../fieldDict"
 , "./crudmetamodel"
, "../load-user-attributes"
	, "../load-contracts"
],function(entityManager, appDict, ko, moment
 			, forumComments
 			, govDocs
 			, appUtil
, appDict
 			, crudmetamodel
, userAttribs
, loadContracts
){

	function ContractVehicle(id, title) {
		this.id = id;
		this.title = title;
	};
	var _moduleName="selected-contract";
	var self = {};
	$.extend(self, forumComments);
	$.extend(self, govDocs);
	
	self.contractId = ko.observable("");
	self.contractFormRenderedHandler= function() {
	};
	self.getContractId = function() {
		return self.contractId();
	};
	var editingContractEntity = null;
	var peopleFields=["CaptureManager", "ProgramManager", "TeamingCoordinator"];

	self.availableVehiclesForSelectedContract = ko.observableArray();
	self.selectedVehicleForSelectedContractEdit = ko.observable();

	var loadAvailableVehiclesPromise = null;
	function loadAvailableVehicles() {
		var loadedDeff = $.Deferred();
    	self.availableVehiclesForSelectedContract.removeAll();
    	userAttribs.userAttributesLoadedPromise.then(function() {
	    	crudmetamodel.appVehiclesLoadPromise.then(function() {
				$.each(userAttribs.vehiclesOfCurrentUser, function(key, val) {
					var appVehicle;
		         	if (appVehicle = _.findWhere(crudmetamodel.appVehicles, {title : val}) ) {
			            var v = new ContractVehicle(appVehicle.id, appVehicle.title );
			             self.availableVehiclesForSelectedContract .push(v);
			        }
				});
				loadedDeff.resolve();
	    	});
    	});
    	return loadedDeff;
	}

    self.PreStatusChoices= ko.observableArray();//choices);
    self.EmailToTeamChoices= ko.observableArray();//choices);
    self.TrackingStatusChoices= ko.observableArray();//choices);
    self.CompetitionTypeChoices = ko.observableArray();//["SDVOSB", "Small Business", "8(a)"]);
    self.TeamingStatusChoices = ko.observableArray();//choices);
    self.ClearanceRequirementChoices= ko.observableArray();//choices);

	self.editFields = {
	    Title : ko.observable(),
	    StatusObj : ko.observable(),//this.statusChoices.find("id", {"id" : "Won", "name" : "Won"})),
	    Status : ko.observable(),//self.StatusObj().name);
	    SolicitationNumber : ko.observable(),
	    Customer : ko.observable(),
	    Created : ko.observable(),
	    Description : ko.observable(),
	    EmailNote: ko.observable(),
	    DueDate : ko.observable(new Date())
                            .extend({ required: true }) //Due Date
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
	self.contractViewFields = {
	    Title : ko.observable(),
	    TrackingStatus: ko.observable(),
	    SolicitationNumber : ko.observable(),
	    Customer : ko.observable(),
	    Created : ko.observable(),
	    DueDate : ko.observable(), //Due Date
	    CaptureManager : ko.observable(),
	    Description : ko.observable(),
	    CompetitionType : ko.observableArray(),//Set-Aside/Competition Pool ,,Competition Type
	    CustomerAgencyShort : ko.observable(),
	    PartnerResponseNeededBy : ko.observable(),
	    ReferenceNumber : ko.observable(),
	    TeamingStatus : ko.observable(),
	    TypeofSolicitation : ko.observable(),
	    PeriodofPerformance : ko.observable(),
	    PlaceofPerformance : ko.observable(),
	    LOEEstimate: ko.observable(),
	    IncumbentContractors: ko.observable(),
	    DateReleased: ko.observable(),
	    ClearanceRequirement: ko.observable(),
	    ProgramManager: ko.observable(),
	    TeamingCoordinator: ko.observable(),
	}
	
/////////////////Get selected Contract////////
	self.getSelectedContract = function(contractId) {
			if (contractId == self.getContractId()) {
				return; //don't load again
			}

		vtompPleaseWaitMsg.showPleaseWait(_moduleName);
		self.contractId(contractId);
		govDocs.contractId = contractId;
		forumComments.contractId = contractId;
		initializeDatePickers();
		loadAvailableVehiclesPromise = loadAvailableVehicles();
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
		
		
	  entityManager.fetchEntityByKey(appDict.listDict["Contracts"], contractId, true)
	  .then(function (data) {
	  		editingContractEntity = data.entity;
			self.contractViewFields.Title(data.entity.Title);
			console.log(data.entity["Solicitation_x0020_Type"]);
			console.log(data.entity.Solicitation_x0020_Type);
			console.log(data.entity[appDict.fieldDict["TypeofSolicitation"]]);
			console.log(data.entity.Status);
			self.contractViewFields.TrackingStatus(data.entity[appDict.fieldDict["TrackingStatus"]]);
			self.contractViewFields.SolicitationNumber(data.entity[appDict.fieldDict["SolicitationNumber"]]);
			self.contractViewFields.Customer(data.entity.Customer);
			self.contractViewFields.Created(data.entity.Created);
			self.contractViewFields.DueDate(data.entity[appDict.fieldDict["DueDate"]]);
			self.contractViewFields.Description(data.entity.Description);
			self.contractViewFields.CustomerAgencyShort(data.entity[appDict.fieldDict["CustomerAgencyShort"]]);
			
			var full_date_time = data.entity[appDict.fieldDict["PartnerResponseNeededBy"]];
			if (full_date_time != null && full_date_time != "") {
				full_date_time = full_date_time.split(' ')[0] + " COB";
			} else {
				full_date_time = "";
			}
			console.log(full_date_time);
			self.contractViewFields.PartnerResponseNeededBy(data.entity[appDict.fieldDict["PartnerResponseNeededBy"]]);
			
			self.contractViewFields.ReferenceNumber(data.entity["V_x002d_ID"]); 
			self.contractViewFields.TeamingStatus(data.entity[appDict.fieldDict["TeamingStatus"]]);
			self.contractViewFields.TypeofSolicitation(data.entity.Status);
			self.contractViewFields.PeriodofPerformance(data.entity[appDict.fieldDict["PeriodofPerformance"]]);
			self.contractViewFields.PlaceofPerformance(data.entity[appDict.fieldDict["PlaceofPerformance"]]);
			self.contractViewFields.LOEEstimate(data.entity[appDict.fieldDict["LOEEstimate"]]);
			self.contractViewFields.IncumbentContractors(data.entity[appDict.fieldDict["IncumbentContractors"]]);
			self.contractViewFields.DateReleased(data.entity[appDict.fieldDict["DateReleased"]]);
			self.contractViewFields.ClearanceRequirement(data.entity[appDict.fieldDict["ClearanceRequirement"]]);
			
			
			self.editFields.Title(data.entity.Title);
			self.editFields.PreStatus(data.entity[appDict.fieldDict["PreStatus"]]);
			self.editFields.EmailToTeam(data.entity[appDict.fieldDict["EmailToTeam"]]);
			self.editFields.TrackingStatus(data.entity[appDict.fieldDict["TrackingStatus"]]);
			self.editFields.SolicitationNumber(data.entity[appDict.fieldDict["SolicitationNumber"]]);
			self.editFields.Customer(data.entity.Customer);
			self.editFields.Created(data.entity.Created);
			self.editFields.Description(data.entity.Description);
			self.editFields.EmailNote(data.entity[appDict.fieldDict["EmailNote"]]);
         
			self.editFields.CustomerAgencyShort(data.entity[appDict.fieldDict["CustomerAgencyShort"]]);
            if (data.entity[appDict.fieldDict["PartnerResponseNeededBy"]]) {
            	var dateval = data.entity[appDict.fieldDict["PartnerResponseNeededBy"]];
            	self.editFields.PartnerResponseNeededBy(new Date(dateval));
            }
            self.editFields.ReferenceNumber(data.entity[appDict.fieldDict["ReferenceNumber"]]);
            self.editFields.TeamingStatus(data.entity[appDict.fieldDict["TeamingStatus"]]);
            self.editFields.TypeofSolicitation(data.entity[appDict.fieldDict["TypeofSolicitation"]]);
            if (data.entity[appDict.fieldDict["DueDate"]]) {
            	var dateval = data.entity[appDict.fieldDict["DueDate"]];
            	self.editFields.DueDate(new Date(dateval));
            }
            if (data.entity[appDict.fieldDict["ProjectStart"]]) {
            	var dateval = data.entity[appDict.fieldDict["ProjectStart"]];
            	self.editFields.ProjectStart(new Date(dateval));
            }
            if (data.entity[appDict.fieldDict["ProjectEnd"]]) {
            	var dateval = data.entity[appDict.fieldDict["ProjectEnd"]];
            	self.editFields.ProjectEnd(new Date(dateval));
            }
            self.editFields.PlaceofPerformance(data.entity[appDict.fieldDict["PlaceofPerformance"]]);
            self.editFields.LOEEstimate(data.entity[appDict.fieldDict["LOEEstimate"]]);
            self.editFields.IncumbentContractors(data.entity[appDict.fieldDict["IncumbentContractors"]]);
            self.editFields.DateReleased(data.entity[appDict.fieldDict["DateReleased"]]);
            self.editFields.ClearanceRequirement(data.entity[appDict.fieldDict["ClearanceRequirement"]]);
					
	
			vtompPleaseWaitMsg.hidePleaseWait(_moduleName);
		  }).fail(vtompErrorHandler);
		
	    var listName = appDict.listDict["Contracts"];
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
			+ "items?$select="
			+ appDict.fieldDict["CaptureManager"] + "/FirstName"
			+ "," + appDict.fieldDict["CaptureManager"] + "/LastName"
			+ "," + appDict.fieldDict["CaptureManager"] + "/Name"
			+ "," + appDict.fieldDict["CaptureManager"] + "/EMail"
			
			+ "," + appDict.fieldDict["ProgramManager"] + "/FirstName"
			+ "," + appDict.fieldDict["ProgramManager"] + "/LastName"
			+ "," + appDict.fieldDict["ProgramManager"] + "/Name"
			+ "," + appDict.fieldDict["ProgramManager"] + "/EMail"
			
			+ "," + appDict.fieldDict["TeamingCoordinator"] + "/FirstName"
			+ "," + appDict.fieldDict["TeamingCoordinator"] + "/LastName"
			+ "," + appDict.fieldDict["TeamingCoordinator"] + "/Name"
			+ "," + appDict.fieldDict["TeamingCoordinator"] + "/EMail"
			
			+ "," + appDict.fieldDict["CompetitionType"]
			+ "," + appDict.fieldDict["Vehicle"] + "/ID"
	
			+ "&$expand=" + appDict.fieldDict["CaptureManager"] + "/Id"
			+ "," + appDict.fieldDict["ProgramManager"] + "/Id"
			+ "," + appDict.fieldDict["TeamingCoordinator"] + "/Id"
			+ "," + appDict.fieldDict["Vehicle"] + "/Id"
			+ "&$filter=ID eq " + contractId
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
			self.contractViewFields.CaptureManager(data.d.results[0][appDict.fieldDict["CaptureManager"]]);
			self.contractViewFields.ProgramManager(data.d.results[0][appDict.fieldDict["ProgramManager"]]);
			self.contractViewFields.TeamingCoordinator(data.d.results[0][appDict.fieldDict["TeamingCoordinator"]]);
			 initializePeoplePickers();
			
			 peopleFields.forEach(function(peopleField) {
		        var peoplePicker = SPClientPeoplePicker.SPClientPeoplePickerDict[peopleField + "PeoplePickerDiv_TopSpan"];
		        var userName = data.d.results[0][appDict.fieldDict[peopleField]].Name;
		        if (userName) {
			    	peoplePicker.AddUnresolvedUser({ Key: userName }, true); //.split('|')[1]
			    }
			 });
	
			self.contractViewFields.CompetitionType.removeAll();
			if (data.d.results[0][appDict.fieldDict["CompetitionType"]]) {
			    ko.utils.arrayPushAll(self.contractViewFields.CompetitionType, data.d.results[0][appDict.fieldDict["CompetitionType"]].results);
			 //   ko.utils.arrayPushAll(self.editFields.Contract_x0020_Type, data.d.results[0].Contract_x0020_Type.results);
				self.editFields.CompetitionType(data.d.results[0][appDict.fieldDict["CompetitionType"]].results);	
			}
			
			loadAvailableVehiclesPromise.then(function() {
				if (data.d.results[0][appDict.fieldDict["Vehicle"]]) {
					var currentVehicle = ko.utils.arrayFirst(self.availableVehiclesForSelectedContract (), function(vehicle) {
						return vehicle.id == data.d.results[0][appDict.fieldDict["Vehicle"]].ID;
					});
					if (currentVehicle ) {
						self.selectedVehicleForSelectedContractEdit (currentVehicle );
					}
				}
			});
			
		//TODO 	add these data retrieval callbacks to a qx.map per "More complex flow with qx" in http://jabberwocky.eu/2013/02/15/promises-in-javascript-with-q/
		// so that can call hidePleaseWait() once they ALL complete processing.
		//		myApp.hidePleaseWait();
	
		//return data.d.results.length > 0 ? data.d.results[0].Vehicle.Title : "noopnoopnoopnoop";
	});
    post.fail(function (e) {
    // e is any exception that was thrown.
			vtompPleaseWaitMsg.hidePleaseWait(_moduleName);
		vtompErrorHandler(arguments);
	});
	
    var teamingCoordinatorFieldName = "TeamingCoordinator";
    $.getJSON(_spPageContextInfo.webAbsoluteUrl + "/_vti_bin/listdata.svc/" + appDict.listDict["Contracts"] + "?"
    + "$expand=" + "CaptureManager" + "," + "ProgramManager"
    + "," + teamingCoordinatorFieldName 
    + "&$filter=(Id eq " + contractId + ")"
	+ "&$top=1"
	+ "&$select=" + "CaptureManager" + "," + "ProgramManager"
    + "," + teamingCoordinatorFieldName 
         ,
         function (data) {
             if (data.d.length > 0) {
				self.contractViewFields.CaptureManager(data.d[0]["CaptureManager"]);//.Other_x0020_POC_x0020_1);
				self.contractViewFields.ProgramManager(data.d[0]["ProgramManager"]);
				self.contractViewFields.TeamingCoordinator(data.d[0]["TeamingCoordinator"]);
             }
         }
   );
	console.log("Capture Manager View " + self.contractViewFields.CaptureManager());
		self.loadGovDocs(contractId);
		self.loadForumComments(contractId);
		
	}; //end of getSelectedContract
	
    self.SaveContract= function () {

		
		getUserInfo(function(peopleIds) { 
	
			var etag = editingContractEntity.entityAspect.extraMetadata.etag;
			var requestUri = editingContractEntity.entityAspect.extraMetadata.uri;
			var type = editingContractEntity.entityAspect.extraMetadata.type;
			var requestHeaders = { 
			'Accept': 'application/json;odata=verbose'
			, 'X-RequestDigest': $('#__REQUESTDIGEST').val(), 
			'X-HTTP-Method': 'MERGE'
			, 'If-Match': etag }; 
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
			contractData[appDict.fieldDict["EmailNote"]] = self.editFields.EmailNote();
			contractData[appDict.fieldDict["TypeofSolicitation"]] = self.editFields.TypeofSolicitation();
			contractData[appDict.fieldDict["CaptureManager"]+"Id"] = peopleIds["CaptureManager"];
			contractData[appDict.fieldDict["ProgramManager"]+"Id"] = peopleIds["ProgramManager"];
			contractData[appDict.fieldDict["TeamingCoordinator"]+"Id"] = peopleIds["TeamingCoordinator"];
			
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
			contractData[appDict.fieldDict["Vehicle"] + "Id"] = self.selectedVehicleForSelectedContractEdit ().id;
			
			$.ajax({ url: requestUri
				, type: 'POST'
				, contentType: 'application/json;odata=verbose'
				, headers: requestHeaders
				, data: JSON.stringify(contractData)
				, success: function (data, textStatus, jqXHR){ 
					self.contractViewFields.Title(self.editFields.Title());
					self.contractViewFields.SolicitationNumber(self.editFields.SolicitationNumber());
					self.contractViewFields.Customer(self.editFields.Customer());
					self.contractViewFields.Description(self.editFields.Description());
					self.contractViewFields.TrackingStatus(self.editFields.TrackingStatus());
					self.contractViewFields.CaptureManager(vtompGetPeopleFieldDisplayText("CaptureManager"));
					self.contractViewFields.ProgramManager(vtompGetPeopleFieldDisplayText("ProgramManager"));
					self.contractViewFields.TeamingCoordinator(vtompGetPeopleFieldDisplayText("TeamingCoordinator"));
					self.contractViewFields.DueDate(self.editFields.DueDate());
					self.contractViewFields.CompetitionType(self.editFields.CompetitionType());
					self.contractViewFields.CustomerAgencyShort(self.editFields.CustomerAgencyShort());
					self.contractViewFields.PartnerResponseNeededBy(self.editFields.PartnerResponseNeededBy());
					self.contractViewFields.ReferenceNumber(self.editFields.ReferenceNumber());
					self.contractViewFields.TeamingStatus(self.editFields.TeamingStatus());
					self.contractViewFields.TypeofSolicitation(self.editFields.TypeofSolicitation());
					self.contractViewFields.PlaceofPerformance(self.editFields.PlaceofPerformance());
					self.contractViewFields.LOEEstimate(self.editFields.LOEEstimate());
					self.contractViewFields.IncumbentContractors(self.editFields.IncumbentContractors());
					self.contractViewFields.DateReleased(self.editFields.DateReleased());
					self.contractViewFields.ClearanceRequirement(self.editFields.ClearanceRequirement());
					//self.Created(data.entity.Created());
					loadContracts.resetRanCache();
				
					editingContractEntity.entityAspect.extraMetadata.etag =  jqXHR.getResponseHeader("Etag");
					vtompShowNotification('Item saved', true);
				}
				, error: function(err){ 				
							vtompShowNotification(err.status + " - " + err.statusText, false);
				}
				
			});
		//	});
		
		});
    };
    self.DeleteContract= function () {
		if (!confirm("Delete contract?")) {
			return;
			
		}

		var etag = editingContractEntity.entityAspect.extraMetadata.etag;
		var uri = editingContractEntity.entityAspect.extraMetadata.uri;
	    var post = $.ajax({
	        url: uri ,
	        type: "POST",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val()
				, 'X-HTTP-Method': 'DELETE'
				, 'If-Match': etag 
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {
					self.contractId("");
					loadContracts.resetRanCache();
					vtompShowNotification('Item deleted', true, function() {
			 			Backbone.history.navigate('/' , true);
					});
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
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
	   vtompInitializePeoplePicker('CaptureManagerPeoplePickerDiv');
	    vtompInitializePeoplePicker('ProgramManagerPeoplePickerDiv');
	    vtompInitializePeoplePicker('TeamingCoordinatorPeoplePickerDiv');
	
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
		//	userInfos[peopleField] = users
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