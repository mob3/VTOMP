define(["../fieldDict"], function(
appDict
) {

	var self = {};
	
	self.ProfileCompany = function (id, title, shortTitle) {
		this.id = id;
		this.title = title;
		this.shortTitle = shortTitle;
		this.displayText = (title ? title : "") + (shortTitle? " (" + shortTitle + ")" : "");
		
		this.equals = function(other) {
			if (this.id === 0 && !other) {
				return true;
			} else if (!other) return false;
			return _.isEqual(this.id, other.id)
				&& _.isEqual(this.title, other.title)
				&& _.isEqual(this.shortTitle, other.shortTitle);
		};
	};
	self.ProfileCompany.emptyOne = function() {
		return new self.ProfileCompany(0, "", "");
	};
	
	self.loadAvailableCompanies = function(availableCompanies ) {
	    var listName = "Companies";
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + appDict.listDict[listName]+ "')/"
			+ "items?$select=ID,Title" 
				+ "," + appDict.companyFieldsDict["ShortTitle"]
			+ "&$orderby=Title asc," + appDict.companyFieldsDict["ShortTitle"] + " asc"
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
	    	availableCompanies.removeAll();
             $.each(data.d.results, function (key, val) {
		            var co = new self.ProfileCompany (val.ID, val.Title
		             	, val[appDict.companyFieldsDict["ShortTitle"]]
		             	);
		             availableCompanies .push(co );
            });
	    });
	
	};

	
	return self;
});