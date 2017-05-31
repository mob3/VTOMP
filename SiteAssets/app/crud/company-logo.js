define(["../uploadFile", "ko","../fieldDict"
],function(uploadFile, ko,appDict){


	var self = {};


	var LogoUrl = function(resturi, url, name, etag) {
		this.resturi = resturi;
		this.url = ko.observable(url);
		this.name = ko.observable(name);
		this.etag = etag;
	}
	self.logoUrlObj=new LogoUrl(null,null,null,0);
	self.logoUrl=self.logoUrlObj.url;

	self.companyId = null;
	
	self.addCompanyLogo = function(resturi, url, name) {
		self.logoUrlObj.resturi = resturi;
		self.logoUrlObj.url(url);
		self.logoUrlObj.name(name) ;
	}
	self.removeCompanyLogo = function() {
		self.logoUrlObj.resturi = null;
		self.logoUrlObj.url(null);
		self.logoUrlObj.name(null) ;
		self.logoUrlObj.etag = 0;
	}
	self.uploadCompanyLogoFile= function() {
		var post = self.deleteCompanyLogo(self.logoUrlObj, false);
		post.then(function() {
			uploadFile.uploadFile("getCompanyLogoFile", appDict.folderPaths.Logos
			, appDict.fieldDict.Company, self.companyId, self.addCompanyLogo );
		});
	};
	self.deleteCompanyLogo = function(companyLogo, showNotice) {
		if (showNotice && !confirm("delete " + companyLogo.name() + "?")) {
			return;
		}
	    var post = $.ajax({
	        url: companyLogo.resturi,
	        type: "POST",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val()
				, 'X-HTTP-Method': 'DELETE'
				, 'If-Match': companyLogo.etag || "*" 
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {

			self.removeCompanyLogo ();
			if (showNotice) vtompShowNotification('File deleted', true);
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
		});
		return post;
	};

	self.querySelectedCompanyLogo = function(companyId){
	
		self.queryCompanyLogos([companyId],
						function(data, textStatus, jqXHR) {
					    	if (data.d.results.length) {
								self.logoUrlObj.resturi =data.d.results[0].__metadata.uri;
								self.logoUrlObj.url(data.d.results[0].EncodedAbsUrl);
								self.logoUrlObj.name(data.d.results[0].FileLeafRef);
								self.logoUrlObj.etag=data.d.results[0].__metadata.etag;
							} else {
								self.logoUrlObj.resturi =null;
								self.logoUrlObj.url(null);
								self.logoUrlObj.name(null);
								self.logoUrlObj.etag=null;
							}
						}
		);
	}

	self.queryCompanyLogos = function(companyIds, resultCallBack) {
		var where  = "<Where><In><FieldRef Name='" + appDict.fieldDict["Company"] 
			    	+ "'  LookupId='TRUE' /><Values>";
			    	//according to the following max is 500: http://sharepoint.stackexchange.com/questions/80210/caml-query-limitation-of-values-in-in-operator
			    	for (i=0;i<companyIds.length && i<400;i++) {
			    		where += "<Value Type='Lookup'>" + companyIds[i] + "</Value>";
			    	}
			    	if (companyIds.length === 0) {
			    		where += "<Value Type='Lookup'>0</Value>"; //noop
			    	}
			    	where += "</Values></In></Where>";
		var requestDocData = {  
	      'query' : {
	                 '__metadata': { 'type': 'SP.CamlQuery' }, 
	                 'ViewXml' : "<View><Query>" + where + "</Query>"
	                  + "</View>"
	       }
		};
	    var post = $.ajax({
	        url: _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/getbytitle('Logos')/getitems"
	        	+ "?$select=FileLeafRef,EncodedAbsUrl," + appDict.fieldDict["Company"] + "Id",
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
	    	if (resultCallBack) { resultCallBack(data, textStatus, jqXHR); }
		});

	    post.fail(function (e) {
								vtompShowNotification(e.status + " - " + e.statusText, false);
		});
		return post;
	}


	return self;

});