var vtomp_Constants = {};
vtomp_Constants.NOTHING_TO_DO = "nothing to do";
vtomp_Constants.STATUS_ACTIVE = "OPEN";
vtomp_Constants.STATUS_ARCHIVED = "CLOSED";
vtomp_Constants.STATUS_PREPUBLISHED = "REGISTERED";

function vtompErrorHandler(arg1, textStatus, errorThrown ) {
	console.log(errorThrown? errorThrown : arg1);
	if(errorThrown)
		return;
	var message;
	var entityErrors = false;
	if (arg1.status){
		var jqXHR = arg1;
		message = jqXHR.status + " - " + jqXHR.statusText;
		if (jqXHR.length && jqXHR[0].message)  {
			message = jqXHR[0].message //from breeze/q
		}
		if (jqXHR.message) {
			message += "\n" + jqXHR.message;
			console.log(JSON.stringify(arg1));
		}
		if (jqXHR.responseJSON && jqXHR.responseJSON.error && jqXHR.responseJSON.error.message) { //shown when sharepoint auth token is invalid
			message = jqXHR.responseJSON.error.message.value;
			console.log(jqXHR.responseText);
		}
	} else if (arg1.entityErrors) {
		entityErrors = true;
		message = "Validation Errors: ";
		$.each(arg1.entityErrors, function(key, err) {
			message += err.errorMessage + "\n";
		});
	} else if (arg1.message) {
		message = arg1.message;
		if (arg1.fileName) {
			console.log("filename: " + arg1.fileName + ":" + arg1.lineNumber);
		}
	}
	if (!entityErrors)
		vtompShowNotification(message, false);
	else
		vtompShowNotificationWithEntityError(message, false);
}

function vtompShowNotification(msg, remove, callback) {
	$("#results").css("color", "blue");
	$("#results").html(msg + "\n");
	$("#resultsNote").slideDown();
	if (remove) {
		setTimeout(function() {  
			$("#results").html(''); 
			$("#resultsNote").slideUp();
			if (callback) {
				callback();
			}
		}, 2000);
	}
}

function vtompShowNotificationWithEntityError(msg, remove, callback) {
	$("#results").css("color", "red");
	$("#results").html(msg);
	$("#resultsNote").slideDown();
	if (remove) {
		setTimeout(function() {  
			$("#results").html(''); 
			$("#resultsNote").slideUp();
			if (callback) {
				callback();
			}
		}, 2000);
	}
}

function genericCreateSharePointListItem(siteUrl,listName, itemProperties, success, failure) {

    var itemType = getItemTypeForListName(listName);
    itemProperties["__metadata"] = { "type": itemType };

    $.ajax({
        url: siteUrl + "/_api/web/lists/getbytitle('" + listName + "')/items",
        type: "POST",
        contentType: "application/json;odata=verbose",
        data: JSON.stringify(itemProperties),
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
        success: function (data) {
            success(data.d);
        },
        error: function (data) {
            failure(data);
        }
    });
    
	    // Get List Item Type metadata
	function getItemTypeForListName(name) {
	    return "SP.Data." + name.charAt(0).toUpperCase() + name.split(" ").join("").slice(1) + "ListItem";
	}
}
// Render and initialize the client-side People Picker.
function vtompInitializePeoplePicker(peoplePickerElementId) {

    // Create a schema to store picker properties, and set the properties.
    var schema = {};
    schema['PrincipalAccountType'] = 'User';//'User,DL,SecGroup,SPGroup';
    schema['SearchPrincipalSource'] = 15;
    schema['ResolvePrincipalSource'] = 15;
    schema['AllowMultipleValues'] = false;
    schema['MaximumEntitySuggestions'] = 50;
    schema['Width'] = '280px';

    // Render and initialize the picker. 
    // Pass the ID of the DOM element that contains the picker, an array of initial
    // PickerEntity objects to set the picker value, and a schema that defines
    // picker properties.
    this.SPClientPeoplePicker_InitStandaloneControlWrapper(peoplePickerElementId, null, schema);
}



function vtompGetPeopleFieldDisplayText(peopleField) {
    // Get the people picker object from the page.
    var peoplePicker = this.SPClientPeoplePicker.SPClientPeoplePickerDict[peopleField + "PeoplePickerDiv_TopSpan"];

//peoplePicker.AddUnresolvedUser({ Key: "i:0#.w|awgtek\\adam" }, true); //.split('|')[1]
    // Get information about all users.
    var users = peoplePicker.GetAllUserInfo();
	if (users.length > 0) {
		return users[0];//["DisplayText"];
	} else {
		return "";
	}
}


  function vtompSPRestClientTypeNameToServerDefault(clientTypeName) {
    return 'SP.Data.' + clientTypeName + 'ListItem';
  }

// function which loads a specific listitem, and calls BuildTask with the resulting data
var vtompDoSomethingWithListItemPerms = function ( listItem_id, listTitle, permissionKind, DoSomething ) {
	if (!/^\d+$/.test(listItem_id+'')) return;
	//Get the current client context
	var context = SP.ClientContext.get_current();
    var spList = context.get_web().get_lists().getByTitle( listTitle );
    var spListItem = spList.getItemById( listItem_id );
    context.load( spListItem );
    context.load( spListItem , 'EffectiveBasePermissions' );
    context.executeQueryAsync(
    // OnSuccess
              function ( sender , args ) {
 
                  var listItem_id = spListItem.get_id().toString();
                  var listItem_Title = spListItem.get_item('Title');
                  var listItem_AssignedTo_RAW = spListItem.get_item('Editor');
                  var listItem_AssignedTo = (listItem_AssignedTo_RAW == null) ? "(No editor)" : listItem_AssignedTo_RAW.get_lookupValue();
 
                  var listItem_HasEditPerms = spListItem.get_effectiveBasePermissions().has(SP.PermissionKind[permissionKind]);
 
                  DoSomething( listItem_HasEditPerms, listItem_id , listItem_Title , listItem_AssignedTo  );
              },
    // OnFailure
              function ( sender , args ) {
                  alert('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
              }
       );
}

var vtompDoSomethingWithListPerms = function ( listTitle, permissionKind, DoSomething ) {
	//Get the current client context
	var context = SP.ClientContext.get_current();
    var spList = context.get_web().get_lists().getByTitle( listTitle );
    context.load( spList );
    context.load( spList , 'EffectiveBasePermissions' );
    context.executeQueryAsync(
    // OnSuccess
              function ( sender , args ) {

                  var hasEditPerms = spList.get_effectiveBasePermissions().has(SP.PermissionKind[permissionKind]);
 
                  DoSomething( hasEditPerms );
              },
    // OnFailure
              function ( sender , args ) {
                  alert('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
              }
       );
}
var vtompDoSomethingWithGroupMembership = function(groupName, DoSomething) {
	var desiredGroupTitle = groupName;
	var context = SP.ClientContext.get_current()
	var web = context.get_web()
	var user = web.get_currentUser()
	var groups = user.get_groups()
	context.load(groups, 'Include(Id, Title)');
	context.executeQueryAsync(function() {
	    var groupCount = groups.get_count();
	    for(var i = 0; i < groups.get_count(); i++) {
	        var group = groups.itemAt(i);
	        var groupTitle = group.get_title();
	        if (groupTitle === desiredGroupTitle) {
	        	DoSomething(true);
	        	return;
	        }
	    }
	    DoSomething(false);
	}, function() { 
	    console.error("failed to check group membership for current user");
	    DoSomething(false);
	});
}
var vtompNullToBlank = function(input) {
	return (!input) ? "" : input;
}
var vtompPleaseWaitMsg= (function () {
    //var pleaseWaitDiv = $('<div class="modal fade" id="pleaseWaitDialog" data-backdrop="static" data-keyboard="false"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><h1>Processing...</h1></div><div class="modal-body"><div class="progress progress-striped active"><div class="progress-bar" style="width: 100%;"></div></div></div></div></div></div>');
    var pleaseWaitDiv = $('#loadingContainer');
	return {
    	moduleMap: {} //new Map()
        , showPleaseWait: function(sourceModule) {
        	if (this.liveCount == 0) {
            	//pleaseWaitDiv.slideDown();
            }
            this.moduleMap[sourceModule] = this.moduleMap[sourceModule] ? this.moduleMap[sourceModule] + 1 : 1;
            this.liveCount++;
        }
        , hidePleaseWait: function (sourceModule) {
        	if (this.liveCount == 1) {
        		var self = this;
            	setTimeout(function() {
            		//pleaseWaitDiv.slideUp;
            		self.moduleMap = {};//.clear();
	            	self.liveCount=0;
            	}, 0);
            }
            if (this.liveCount > 1) {
            	this.moduleMap[sourceModule]--;
            	this.liveCount--;
            }
        },
		liveCount: 0
    };
})();

$("form").submit(function () { return false; });