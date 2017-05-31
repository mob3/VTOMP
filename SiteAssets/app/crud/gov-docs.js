define(["../uploadFile", 'ko'
, "../fieldDict"
],function(uploadFile, ko
, appDict
){

	var GovDoc = function(resturi, url, name, etag) {
		this.resturi = resturi;
		this.url = url;
		this.name = name;
		this.etag = etag;
	}

	var self = {};
	
	self.contractId = null;

	self.GovernmentDocuments = ko.observableArray();
	
	self.addGovDoc = function(resturi, url, name) {
		if (!_.findWhere(self.GovernmentDocuments(), {name: name})) {
			self.GovernmentDocuments.push(new GovDoc(resturi,
        		url, name));
		}

	}
	self.uploadGovDocFile= function() {
		uploadFile.uploadFile("getGovDocFile", appDict.folderPaths.GovernmentDocuments
		, appDict.fieldDict.Contract, self.contractId, self.addGovDoc)
	};
	self.deleteGovDoc = function(govdoc) {
		if (!confirm("delete " + govdoc.name + "?")) {
			return;
		}
	    var post = $.ajax({
	        url: govdoc.resturi,
	        type: "POST",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val()
				, 'X-HTTP-Method': 'DELETE'
				, 'If-Match': govdoc.etag || "*" 
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {

			self.GovernmentDocuments.remove(function(governmentDoc) {
				return governmentDoc.name == govdoc.name;
			});
			vtompShowNotification('File deleted', true);
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
		});

	};

	self.loadGovDocs = function(contractId) {
		/******* Government Docs *******************************************/
		self.GovernmentDocuments.removeAll();
		var requestDocData = {  
	      'query' : {
	                 '__metadata': { 'type': 'SP.CamlQuery' }, 
	                 'ViewXml' : "<View><Query><Where><Eq><FieldRef Name='"
	                 + appDict.fieldDict["Contract"] +"' LookupId='TRUE' /><Value Type='Lookup'>"
	                  + contractId + "</Value></Eq></Where></Query>"
	                  + "<ViewFields><FieldRef Name='FileLeafRef'  /><FieldRef Name='EncodedAbsUrl'/>"
	                  + "<FieldRef Name='FileSizeDisplay'/><FieldRef Name='Created'/></ViewFields></View>"
	       }
		};
	    var post = $.ajax({
	        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Government Documents')/getitems?$select=FileLeafRef,FileSizeDisplay,Created,EncodedAbsUrl",
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
	             $.each(data.d.results, function (key, val) {
	                var resturl = val.__metadata.uri;
	        self.GovernmentDocuments.push(new GovDoc(resturl,
	        val.EncodedAbsUrl, val.FileLeafRef, val.__metadata.etag));
	            });
	
		});
	    post.fail(function (e) {
								vtompShowNotification(e.status + " - " + e.statusText, false);
		});
	
	};
	return self;
});