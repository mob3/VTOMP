define(["../fieldDict"
 , "../apputil"
 , "../load-user-attributes"
 , "./crudstate"
, "datatables"

],function(appDict
 			, appUtil
			, userAttribs
, crudstate
) {

	var vehicle = "";
	var _moduleName="profiles";
	var self = {};
    var listName =  appDict.listDict["Profiles"];
	
	//Makes sure profiles will reload if a change occurs. 
	crudstate.changeEvents.profileDeleted.actions.push(function () {
		self.loadProfilesCalled = false;
	});
	crudstate.changeEvents.profileCreated.actions.push(function () {
		self.loadProfilesCalled = false;
	});
	
	userAttribs.userAttributesLoadedPromise.then(function() {
		console.log(userAttribs.currentVehicle);
	});
	self.loadProfilesCalled = false;
	
	/*
	 *Query the Sharepoint server for the profiles. 
	 */
	self.loadProfiles = function() {
		//If already loaded then don't load again.
		if (self.loadProfilesCalled)
			return;
		console.log("Loading Profiles");
		vtompPleaseWaitMsg.showPleaseWait(_moduleName);
		
		//Make the url for the request.
		userAttribs.userAttributesLoadedPromise.then(function() {
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
			+ "items?$select=ID,Title,Name,Modified,Telephone," 
			+ appDict.fieldDict["Email"]  + ","
			+ appDict.fieldDict["Vehicle"] + "/Title," 
			+ appDict.fieldDict["Company"] + "/Title," 
			+ appDict.fieldDict["User"] + "/ID," 
			+ appDict.fieldDict["User"] + "/Name," 
			+ appDict.fieldDict["User"] + "/EMail"
			+ "&$expand=" 
			+ appDict.fieldDict["Vehicle"] + "," 
			+ appDict.fieldDict["Company"] + "," 
			+ appDict.fieldDict["User"] + "/ID";
			if (userAttribs.currentVehicle != "All") {
				endpoint += "&$filter=" + appDict.fieldDict["Vehicle"] + "/Title eq '" + userAttribs.currentVehicle + "'";
			}
	    
		
		console.log(endpoint);
		
		//Send request the to Sharepoint server.
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
	    post.then(successHandler);
	    post.fail(vtompErrorHandler);
		});
	}
	
	/*
	 * Load the data tables for profiles.
	 */
	function successHandler(data, textStatus, jqXHR) {
		var tableSel = '#profilesTable';
		console.log(data);
		if ($.fn.DataTable.isDataTable(tableSel )) {
			$(tableSel ).DataTable().clear().destroy();
		}
		$('#profilesTable').dataTable({
		"bPaginate": false,
	    "bLengthChange": false,
	    "bFilter": false,
	    "bSort": true,
	    "bInfo": false,
	    "bAutoWidth": false,
		 "aaData": data.d.results,
	            "aoColumns": [
					{"mData": appDict.fieldDict["Name"]
		                , "mRender": function(name, type, full) {
								return '<a href="#/viewprofile/' + full.ID + '" >' + name + '</a>';
					      }                  
		              }
	                , {"mData": "Title"
		                , "mRender": function(name, type, full) {
								return name;
					      }                  
		              }
					, {"mData": appDict.fieldDict["Company"] + ".Title"  //see jquery.dataTables.js._fnGetObjectDataFn and _fnGetCellData for where this is parsed
						, sDefaultContent: ""
						}
					, {"mData": appDict.fieldDict["Vehicle"] + ".results"
						, "mRender": function(results) {
							if (results.length > 0) {
								var vehicles = _.reduce(results.slice(1), function(memo, vehicle){ return memo + ", " + vehicle.Title}, results [0].Title);
								return vehicles;
							} else {
								return "";
							}
						}}
					, {"mData": appDict.fieldDict["Email"] 
						, sDefaultContent: ""
						, "mRender": function(email, type, full) {
							return email? email : full[appDict.fieldDict["User"]].EMail;
					      } 
					}
					, {"mData": "Telephone"}
					, {
	                	"mData": "Modified"
	                	, "sType": "date"
	      				, "mRender": function(date, type, full) {
				          return  new Date(date).toDateString();
				      }                  
				    }
				]
		});
		self.loadProfilesCalled = true;
		vtompPleaseWaitMsg.hidePleaseWait(_moduleName);
	}
	return self ;
	

});