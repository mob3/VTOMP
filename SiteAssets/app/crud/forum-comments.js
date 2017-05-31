define(['ko', "../load-user-attributes"],function(ko, userAttribs) {

	
	var ForumComment = function (profileName, isByCurrentUser, createdAtDate, commentText, resturi, etag, profileId, commentId) {
	
		this.companyName = ko.observable();
		this.profileName = profileName;
		this.isByCurrentUser = isByCurrentUser;
		this.createdAtDate = createdAtDate;
		this.commentText = commentText;
		this.resturi = resturi;
		this.etag = etag;
		this.profileId = profileId;
		this.commentId = commentId;
	}

	var self = {};
	self.contractId = null;
	self.ContractForumComments = ko.observableArray();

	self.deleteForumComment = function(comment) {
		if (!confirm("delete comment?")) {
			return;
			//alert(govdoc.name + govdoc.resturi);
		}
	    var post = $.ajax({
	        url: comment.resturi,
	        type: "POST",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val()
				, 'X-HTTP-Method': 'DELETE'
				, 'If-Match': comment.etag || "*" 
	        },
	    });
	    post.then(function(data, textStatus, jqXHR) {

			self.ContractForumComments.remove(function(cmnt) {
				return cmnt.commentId == comment.commentId;
			});
		});
	    post.fail(function (err) {
							vtompShowNotification(err.status + " - " + err.statusText, false);
		});

	}
	
    self.submitForumComment = function() {
		var type = $("input:radio[name='interest-group']:checked").val();
		var title = $("#title_span");
		
		 //specify item properties
		var itemProperties = {'Title':'no title','Comment': $('#incumbencyKnowledge').val(),'Interest': $("input:radio[name='interest-group']:checked").val(),
		'TechnicalCapability': $('#techincalCapability').val(),'PastPerformance': $('#pastPerformance').val(),
			'OpportunityId': parseInt(self.contractId), 'ProfileId': userAttribs.profileListIdOfCurrentUser
		//create item
		};
		genericCreateSharePointListItem(_spPageContextInfo.webAbsoluteUrl,'Comments',itemProperties,
		   function(entity){
		   	                var resturl = entity.__metadata.uri;

		        self.ContractForumComments.push(new ForumComment(userAttribs.profileNameOfCurrentUser,true,entity.Created,entity.Comment, resturl
		        , entity.__metadata.etag, entity.ProfileId, entity.Id));
		        $('#newForumComment').val("");
		      console.log('New task ' + entity.Title + ' has been created');
			  alert("You have successfully submitted interest in " + title.text());
			  document.location.href="#";
		   },
		   function(error){
		      console.log(JSON.stringify(error));
				vtompShowNotification(error.status + " - " + error.statusText, false);
		   }
		);   
		
    }

	self.loadForumComments = function(contractId) {
		/******* Comments *******************************************/
		self.ContractForumComments.removeAll();
	    var post = $.ajax({
	        url: _spPageContextInfo.webAbsoluteUrl 
	        	+ "/_api/web/lists/getbytitle('Comments')/Items/?$select=Id,Created,Comment,Profile/Name,Profile/Id,Opportunity/Id"
	        	+ "&$expand=Profile/Id,Opportunity/Id"
	        	+ "&$filter=Opportunity/Id eq " + contractId,
	        type: "GET",
	    //    data: JSON.stringify(requestDocData),
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
	                var isByCurrentUser = userAttribs.profileListIdOfCurrentUser == val.Profile.Id;
	        self.ContractForumComments.push(new ForumComment(val.Profile.Name,isByCurrentUser,val.Created,val.Comment, resturl
	        , val.__metadata.etag, val.Profile.Id, val.Id));
	            });
	            
	           //get company names
	            var profileIdConditions = new Array();
	             $.each(data.d.results, function (key, val) {
					profileIdConditions.push("ID eq " + val.Profile.Id);
	            });
	            var profileIdConditionsText = profileIdConditions.join(" or ");
		    var listName = "Profiles";
		    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
				+ "items?$select=ID,Title,Company/Title,Company/Short_x0020_Title"
				+ "&$expand=Company"
				+ "&$filter=" + profileIdConditionsText 
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
	             $.each(data.d.results, function (key, val) {
	             	var match = ko.utils.arrayFirst(self.ContractForumComments(), function(item) {
					    return val.ID === item.profileId;
					});
					if (match) {
						match.companyName(val.Company.Short_x0020_Title ? val.Company.Short_x0020_Title : val.Company.Title);
					} //else {
					//	match.companyName("");
				//	}
	            });
			});
		    post.fail(function (err) { vtompShowNotification(err.status + " - " + err.statusText, false); });
		});
	    post.fail(function (err) {
								vtompShowNotification(err.status + " - " + err.statusText, false);
		});
		
	}

	return self;
});