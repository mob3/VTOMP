define(["../uploadFile", 'ko'
, "../fieldDict"
],function(uploadFile, ko
, appDict
){

	
	var SupportingArtifact = function(resturi, url, name, etag, fileSize, created) {
		this.resturi = resturi;
		this.url = url;
		this.name = name;
		this.etag = etag;
		this.fileSize = fileSize;
		this.created = created;
	}
	var self = {};
	self.companyId = null;
	self.SupportingArtifacts = ko.observableArray();
	
	self.addSupportingArtifact = function(resturi, url, name) {
		if (!_.findWhere(self.SupportingArtifacts(), {name: name})) {
			self.SupportingArtifacts.push(new SupportingArtifact(resturi,
        		url, name));
		}
	}
	self.uploadSupportingArtifactFile= function() {
		uploadFile.uploadFile("getSupportingArtifactFile", appDict.folderPaths.SupportingArtifacts
		, appDict.fieldDict.Company, self.companyId, self.addSupportingArtifact)
	};
	self.deleteSupportingArtifact = function(companySupportingArtifact) {
		if (!confirm("delete " + companySupportingArtifact.name + "?")) {
			return;
		}
	    var post = $.ajax({
	        url: companySupportingArtifact.resturi,
	        type: "POST",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val()
				, 'X-HTTP-Method': 'DELETE'
				, 'If-Match': companySupportingArtifact.etag || "*" 
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {

			self.SupportingArtifacts .remove(function(supportingArtifact) {
				return supportingArtifact.name == companySupportingArtifact.name;
			});
			vtompShowNotification('File deleted', true);
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
		});

	};


	self.queryCompanySupportingArtifacts = function(companyId) {
		var requestDocData = {  
	      'query' : {
	                 '__metadata': { 'type': 'SP.CamlQuery' }, 
	                 'ViewXml' : "<View><Query><Where><Eq><FieldRef Name='"
	                 + appDict.fieldDict["Company"] +"' LookupId='TRUE' /><Value Type='Lookup'>"
	                  + companyId + "</Value></Eq></Where></Query>"
	                  + "<ViewFields><FieldRef Name='FileLeafRef'  /><FieldRef Name='EncodedAbsUrl'/>"
	                  + "<FieldRef Name='FileSizeDisplay'/><FieldRef Name='Created'/></ViewFields></View>"
	       }
		};
	    var post = $.ajax({
        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Supporting Artifacts')/getitems?$select=FileLeafRef,FileSizeDisplay,Created,EncodedAbsUrl",
	        type: "POST",
	        data: JSON.stringify(requestDocData),
	  		dataType: "json",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	            "Accept": "application/json; odata=verbose",
	            "Content-Type": "application/json; odata=verbose"
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {
	    	self.SupportingArtifacts.removeAll();
	             $.each(data.d.results, function (key, val) {
	                var resturl = val.__metadata.uri;
		             var filesize = val.FileSizeDisplay;
                    var byteType = " Bytes";

                    if (filesize >= 1073741824)
                    {
                        byteType = " GB";
                        filesize = (filesize / 1073741824).toFixed(1);
                    }
                    else if (filesize >= 1048576)
                    {
                        byteType = " MB";
                        filesize = (filesize / 1048576).toFixed(1);
                    }
                    else if (filesize >= 1024)
                    {
                        byteType = " KB";
                        filesize = (filesize / 1024).toFixed(1);
                    }
                    var fileSizeVal = filesize + byteType;
	             
			        self.SupportingArtifacts.push(new SupportingArtifact(resturl,
			        val.EncodedAbsUrl, val.FileLeafRef, val.__metadata.etag, fileSizeVal, val.Created));
	            });
	
		});
	    post.fail(vtompErrorHandler);
	}

	return self;
});