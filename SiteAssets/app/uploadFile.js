'use strict';
	define( function() {

// Upload the file.
// You can upload files up to 2 GB with the REST API.
var self = {};
/**
* @fileInputElementId  the id of the input tag that is type file
* @serverRelativeUrlToFolder  Define the folder path 
* @docLibLookupFieldName  the name of the lookup field to the list this doclib references
*/
self.uploadFile = function(fileInputElementId, serverRelativeUrlToFolder ,docLibLookupFieldName, lookupListItemId, addDocCallBack) {

    // Check for FileReader API (HTML5) support.
    if (!window.FileReader) {
        alert('This browser does not support the FileReader API.');
        return;
    }
    // for this example.
    //var serverRelativeUrlToFolder = 'Government Documents';

    // Get test values from the file input and text input page controls.
    var fileInput = jQuery('#' + fileInputElementId);
   // var newName = jQuery('#displayName').val();
	if (!fileInput[0].files[0]) {
		return;//no file selected
	}
    // Get the server URL.
    var serverUrl = _spPageContextInfo.webAbsoluteUrl;

    // Initiate method calls using jQuery promises.
    // Get the local file as an array buffer.
    var getFile = getFileBuffer();
    getFile.done(function (arrayBuffer) {

        // Add the file to the SharePoint folder.
        var addFile = addFileToFolder(arrayBuffer);
        addFile.done(function (file, status, xhr) {

			addDocCallBack(file.d.__metadata.uri,
        		file.d.ServerRelativeUrl, file.d.Name);

            // Get the list item that corresponds to the uploaded file.
            var getItem = getListItem(file.d.ListItemAllFields.__deferred.uri);
            getItem.done(function (listItem, status, xhr) {

                // Change the display name and title of the list item.
                var changeItem = updateListItem(listItem.d.__metadata);
                changeItem.done(function (data, status, xhr) {
			 		vtompShowNotification('File uploaded', true);
                  // alert('file uploaded and updated');
                });
                changeItem.fail(onError);
            });
            getItem.fail(onError);
        });
        addFile.fail(onError);
    });
    getFile.fail(onError);

    // Get the local file as an array buffer.
    function getFileBuffer() {
        var deferred = jQuery.Deferred();
        var reader = new FileReader();
        reader.onloadend = function (e) {
            deferred.resolve(e.target.result);
        }
        reader.onerror = function (e) {
            deferred.reject(e.target.error);
        }
        reader.readAsArrayBuffer(fileInput[0].files[0]);
        return deferred.promise();
    }

	function getFileName() {
        // Get the file name from the file input control on the page.
        var parts = fileInput[0].value.split('\\');
        var fileName = parts[parts.length - 1];
        return fileName;
	}
    // Add the file to the file collection in the Shared Documents folder.
    function addFileToFolder(arrayBuffer) {

		var fileName = getFileName();

        // Construct the endpoint.
        var fileCollectionEndpoint = String.format(
                "{0}/_api/web/getfolderbyserverrelativeurl('{1}')/files" +
                "/add(overwrite=true, url='{2}')",
                serverUrl, serverRelativeUrlToFolder, fileName);

        // Send the request and return the response.
        // This call returns the SharePoint file.
        return jQuery.ajax({
            url: fileCollectionEndpoint,
            type: "POST",
            data: arrayBuffer,
            processData: false,
            headers: {
                "accept": "application/json;odata=verbose",
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-length": arrayBuffer.byteLength
            }
        });
    }

    // Get the list item that corresponds to the file by calling the file's ListItemAllFields property.
    function getListItem(fileListItemUri) {

        // Send the request and return the response.
        return jQuery.ajax({
            url: fileListItemUri,
            type: "GET",
            headers: { "accept": "application/json;odata=verbose" }
        });
    }

    // Change the display name and title of the list item.
    function updateListItem(itemMetadata) {

        // Define the list item changes. Use the FileLeafRef property to change the display name. 
        // For simplicity, also use the name as the title. 
        // The example gets the list item type from the item's metadata, but you can also get it from the
        // ListItemEntityTypeFullName property of the list.
        //var body = String.format("{{'__metadata':{{'type':'{0}'}},'FileLeafRef':'{1}','Title':'{2}'}}",
        //    itemMetadata.type, newName, newName);
        var body = String.format("{{'__metadata':{{'type':'{0}'}},'{1}Id':'{2}','Title':'{3}'}}",
            itemMetadata.type, docLibLookupFieldName, lookupListItemId, getFileName());

        // Send the request and return the promise.
        // This call does not return response content from the server.
        return jQuery.ajax({
            url: itemMetadata.uri,
            type: "POST",
            data: body,
            headers: {
                "X-RequestDigest": jQuery("#__REQUESTDIGEST").val(),
                "content-type": "application/json;odata=verbose",
                "content-length": body.length,
                "IF-MATCH": itemMetadata.etag,
                "X-HTTP-Method": "MERGE"
            }
        });
    }
}

// Display error messages. 
function onError(error) {
  //  alert(error.responseText);
     $("<p>", {
                    text: JSON.stringify(error)
                }).appendTo("#outputFileUpload");
}

return self;
});
