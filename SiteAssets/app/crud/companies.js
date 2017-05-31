/*
 * Responsible for loading, holding, and updating the data for the companies. 
 */

define(['ko'
, "underscore"
, "../load-user-attributes"
, "../fieldDict"
, "../breeze-app-model"
, "./supporting-artifacts"
, "./company-poc"
, "./company-vehicles"
 , "./crudmetamodel"
 , "./crudstate"
 , "./company-logo"
 , "../apputil"
 , "tablesort"
], function(ko
, _
, userAttribs
, appDict
, entityManager
, supportingArtifacts
, companyPOCs
, companyVehicles
 			, crudmetamodel
 			, crudstate
 			, companyLogo
 			, appUtil
 			, tablesort
) {
	var moduleName = "companies";
	var self = {};
	$.extend(self,supportingArtifacts);
	$.extend(self,companyPOCs);
	self.companyVehicles = companyVehicles;
	
	function Website(url, description) {
		this.url = url;
		this.description = description;
	}
	
	function Company(id, name) {
		this.id = id;
		this.name = name;
		this.logoUrl = null;
		this.setLogoUrl = function(logoUrl) {
			this.logoUrl = logoUrl;
		}
		this.primaryPOC = ko.observable(new self.CompanyPOC("","","","",""));
		this.secondaryPOC = ko.observable(new self.CompanyPOC("","","","",""));
	}


    self.companyId = ko.observable("");
    self.companyVm = {};
    $.extend(self.companyVm, companyLogo);

    self.BusinessSizeChoices= ko.observableArray();
    self.FacilityClearanceLevelChoices= ko.observableArray();
    self.ContractorLevelChoices= ko.observableArray();
    self.DHSComponentExperienceChoices= ko.observableArray();
    
    self.companies= ko.observableArray();

	self.viewCompanyFields = {
		Title : ko.observable()
		, Created : ko.observable()
		, ShortTitle : ko.observable()
		, BusinessSize: ko.observable()
		, CAGE: ko.observable()
		, Certifications: ko.observable()
		, ContractorLevel: ko.observable()
		, CorporateAchievements: ko.observable()
		, DemonstratedCapabilities: ko.observable()
		, DHSComponentExperience: ko.observableArray()
		, DUNS: ko.observable()
		, FacilityClearanceLevel: ko.observable()
		, HeadquartersLocation: ko.observable()
		, RelevantExperience: ko.observable()
		, SocioeconomicDisadvantagedDesignation: ko.observable()
		, TechnologyPartnerships: ko.observable()
		, Website: ko.observable()
		, logoUrl: companyLogo.logoUrl
	}

	self.editCompanyFields = {
		Title : ko.observable()
		, Created : ko.observable()
		, ShortTitle : ko.observable()
		, BusinessSize: ko.observable()
		, CAGE: ko.observable()
		, Certifications: ko.observable()
		, ContractorLevel: ko.observable()
		, CorporateAchievements: ko.observable()
		, DemonstratedCapabilities: ko.observable()
		, DHSComponentExperience: ko.observableArray()
		, DUNS: ko.observable()
		, FacilityClearanceLevel: ko.observable()
		, HeadquartersLocation: ko.observable()
		, RelevantExperience: ko.observable()
		, SocioeconomicDisadvantagedDesignation: ko.observable()
		, TechnologyPartnerships: ko.observable()
		, Website: ko.observable()
		, logoUrl: companyLogo.logoUrl
		, logoUrlObj: companyLogo.logoUrlObj
	}
	
	self.createCompanyFields = {
		Title : ko.observable()
		, Created : ko.observable()
		, ShortTitle : ko.observable()
		, BusinessSize: ko.observable()
		, CAGE: ko.observable()
		, Certifications: ko.observable()
		, ContractorLevel: ko.observable()
		, CorporateAchievements: ko.observable()
		, DemonstratedCapabilities: ko.observable()
		, DHSComponentExperience: ko.observableArray()
		, DUNS: ko.observable()
		, FacilityClearanceLevel: ko.observable()
		, HeadquartersLocation: ko.observable()
		, RelevantExperience: ko.observable()
		, SocioeconomicDisadvantagedDesignation: ko.observable()
		, TechnologyPartnerships: ko.observable()
		, Website: ko.observable(new Website(null,null))
		, logoUrl: companyLogo.logoUrl
		, logoUrlObj: companyLogo.logoUrlObj
	}
	
	var editingCompanyEntity = null;

	self.companiesLoaded = false;
	
	/*
	 * Sends a caml query to the sharpoint server and then passes the data to the data table. 
	 */
	self.loadCompanies = function() {
		if (self.companiesLoaded )
			return; //don't reload on page change
		self.companies.removeAll();
		vtompPleaseWaitMsg.showPleaseWait(moduleName);
		userAttribs.userAttributesLoadedPromise.then(function() {
				console.log("current company vehicle: " + userAttribs.currentVehicle);
				
				//Build the caml query.
				var caml = "<View><Query><Where><Or><In><FieldRef Name='" + appDict.fieldDict["Vehicle"] 
			    + "' /><Values>";
				
				//If request is for all include every vehicle. 
				if (userAttribs.currentVehicle == "All") {
					for (var i = 0; i < userAttribs.vehiclesOfCurrentUser.length; i++) {
						if (userAttribs.vehiclesOfCurrentUser[i] != "All") {
							console.log(userAttribs.vehiclesOfCurrentUser[i]);
							caml += "<Value Type='Text'>" + userAttribs.vehiclesOfCurrentUser[i] + "</Value>";
						}
					}
				} else {
					caml += "<Value Type='Text'>" + userAttribs.currentVehicle + "</Value>";
				}
				
			    caml += "</Values></In>"
			    + "<Eq><FieldRef Name='ID' /><Value Type='Counter'>"
			    + userAttribs.companyIdOfCurrentUser + "</Value></Eq>"
			    + "</Or></Where>"
			    + "  </Query> <ViewFields><FieldRef Name='ID' /><FieldRef Name='Title' /><FieldRef Name='" 
			    + appDict.companyFieldsDict["ShortTitle"] + "' />"
				+ "</ViewFields></View>";
			    var listName = "Companies";
			    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/GetItems";
			    var requestData = { query: { __metadata: { 'type': 'SP.CamlQuery' }, ViewXml: caml } };

				console.log(caml);
				//Post ajax request for companies.
			    var post = $.ajax({
			        url: endpoint,
			        type: "POST",
			        data: JSON.stringify(requestData),
			        dataType: 'json',
			        headers: {
			            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
			            "Accept": "application/json; odata=verbose",
			            "Content-Type": "application/json; odata=verbose"
			        },
			    });
				
				//Load the companies data table. 
			    post.then(function(data, textStatus, jqXHR) {
			    	var companiesMap = {};
			    	var companyIds = [];
					
				 	$.each(data.d.results, function (key, val) {
				                var companyName = val[appDict.companyFieldsDict["ShortTitle"]] ? val[appDict.companyFieldsDict["ShortTitle"]] : val.Title;
				        companiesMap[val.ID] = new Company(val.ID, val.Title );
				        companyIds.push(val.ID);
				    });
				    companyLogo.queryCompanyLogos(companyIds)
				    	.then(function(data, textStatus, jqXHR) {
					             $.each(data.d.results, function (key, val) {
					             	companiesMap[val.CompanyId].setLogoUrl(val.EncodedAbsUrl);
					            });
							    $.each(companiesMap, function (key,val) {
							    	self.companies.push(val);
								});
								self.companies.sort(function(l,r) { return l.name == r.name ? 0 : (l.name < r.name ? -1 : 1)});
								self.companiesLoaded = true;
									vtompPleaseWaitMsg.hidePleaseWait(moduleName);
						}).then(function() {
							$.each(companyIds, function(key, companyId) {
								var post = self.getPrimaryAndSecondaryCompanyPOCs(companyId);
							    post.then(function(data, textStatus, jqXHR) {
						             $.each(data.d.results, function (key, val) {
							            var company = ko.utils.arrayFirst(self.companies(), function(item) {
							            	return companyId === item.id;
							            });
							            var poc = new self.CompanyPOC(val.Profile.Name, val.Profile.Title
							             	, val.Profile[appDict.fieldDict["WorkPhone"]]
							             	, val.Profile[appDict.fieldDict["MobilePhone"]]
							             	, val.Profile[appDict.fieldDict["Email"]]
							             	);
							            if (val.POCType == "Primary") {
							             	company.primaryPOC(poc);
						             	} else if (val.POCType == "Secondary") {
							             	company.secondaryPOC(poc);
						             	}
					
						            });
							    });
								
							});
						});
				}
				);
			    post.fail(vtompErrorHandler);
		});
	
	};
	
	/*
	 * Gets the information on the given company from the entity manager. 
	 */
	self.getSelectedCompany = function(companyId) {
			if (companyId== self.companyId()) {
				return; //don't load again
			}

		vtompPleaseWaitMsg.showPleaseWait(moduleName);
		self.companyId(companyId);
		self.companyVehicles.companyId=companyId;
		companyLogo.companyId = companyId;
		supportingArtifacts.companyId = companyId;
		companyPOCs.companyId = companyId;
		crudmetamodel.LoadLookups()
			.then(function(lookups){
				self.BusinessSizeChoices(lookups.BusinessSizeChoiceFieldChoiceValues );
				self.FacilityClearanceLevelChoices(lookups.FacilityClearanceLevelChoiceFieldChoiceValues );
				self.ContractorLevelChoices(lookups.ContractorLevelChoiceFieldChoiceValues );
				self.DHSComponentExperienceChoices(lookups.DHSComponentExperienceChoiceFieldChoiceValues );
			}, function(errorArgs) {
							vtompShowNotification("Error " + errorArgs, false);
			})
		
		
		  entityManager.fetchEntityByKey("Companies", companyId, false)
		  .then(function (data) {
		  		editingCompanyEntity = companyVehicles.editingCompanyEntity = data.entity;
				var entityWebsite = appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["Website"] ]);
				var vmWebsite = new Website(entityWebsite.Url, entityWebsite.Description ? entityWebsite.Description : entityWebsite.Url);
				self.viewCompanyFields.Title(appUtil.vtompFixBreezeKOFix(data.entity.Title));
				self.viewCompanyFields.Created(appUtil.vtompFixBreezeKOFix(data.entity.Created));
				self.viewCompanyFields.ShortTitle(data.entity[ appDict.companyFieldsDict["ShortTitle"] ]);
				self.viewCompanyFields.BusinessSize(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["BusinessSize"] ]));
				self.viewCompanyFields.CAGE(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["CAGE"] ]));
				self.viewCompanyFields.Certifications(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["Certifications"] ]));
				self.viewCompanyFields.ContractorLevel(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["ContractorLevel"] ]));
				self.viewCompanyFields.CorporateAchievements(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["CorporateAchievements"] ]));
				self.viewCompanyFields.DemonstratedCapabilities(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["DemonstratedCapabilities"] ]));
				self.viewCompanyFields.DHSComponentExperience(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["DHSComponentExperience"] ]));
				self.viewCompanyFields.DUNS(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["DUNS"] ]));
				self.viewCompanyFields.FacilityClearanceLevel(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["FacilityClearanceLevel"] ]));
				self.viewCompanyFields.HeadquartersLocation(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["HeadquartersLocation"] ]));
				self.viewCompanyFields.RelevantExperience(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["RelevantExperience"] ]));
				self.viewCompanyFields.SocioeconomicDisadvantagedDesignation(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["SocioeconomicDisadvantagedDesignation"] ]));
				self.viewCompanyFields.TechnologyPartnerships(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["TechnologyPartnerships"] ]));
				self.viewCompanyFields.Website(vmWebsite);

				self.editCompanyFields.Title(appUtil.vtompFixBreezeKOFix(data.entity.Title));
				self.editCompanyFields.Created(appUtil.vtompFixBreezeKOFix(data.entity.Created));
				self.editCompanyFields.ShortTitle(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["ShortTitle"] ]));
				self.editCompanyFields.BusinessSize(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["BusinessSize"] ]));
				self.editCompanyFields.CAGE(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["CAGE"] ]));
				self.editCompanyFields.Certifications(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["Certifications"] ]));
				self.editCompanyFields.ContractorLevel(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["ContractorLevel"] ]));
				self.editCompanyFields.CorporateAchievements(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["CorporateAchievements"] ]));
				self.editCompanyFields.DemonstratedCapabilities(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["DemonstratedCapabilities"] ]));
				self.editCompanyFields.DHSComponentExperience(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["DHSComponentExperience"] ]));
				self.editCompanyFields.DUNS(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["DUNS"] ]));
				self.editCompanyFields.FacilityClearanceLevel(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["FacilityClearanceLevel"] ]));
				self.editCompanyFields.HeadquartersLocation(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["HeadquartersLocation"] ]));
				self.editCompanyFields.RelevantExperience(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["RelevantExperience"] ]));
				self.editCompanyFields.SocioeconomicDisadvantagedDesignation(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["SocioeconomicDisadvantagedDesignation"] ]));
				self.editCompanyFields.TechnologyPartnerships(appUtil.vtompFixBreezeKOFix(data.entity[ appDict.companyFieldsDict["TechnologyPartnerships"] ]));
				self.editCompanyFields.Website(vmWebsite);
				console.log("breeze company data returned");
				self.companyVehicles.getCompanyVehicles();
				vtompPleaseWaitMsg.hidePleaseWait(moduleName);
		  }).fail(function() {
		  vtompErrorHandler(arguments);
		  }
		  );
		  self.queryCompanySupportingArtifacts(companyId);
		  
		  companyLogo.querySelectedCompanyLogo(companyId);

		  self.getCompanyPOCs(companyId);

	};
	
	self.SaveCompany= function () {
	    editingCompanyEntity.Title = self.editCompanyFields.Title();
	    var entityWebsite = editingCompanyEntity[ appDict.companyFieldsDict["Website"] ];
	    entityWebsite.Description = self.editCompanyFields.Website().description ? 
	    								self.editCompanyFields.Website().description 
	    								: self.editCompanyFields.Website().url;
	    entityWebsite.Url = self.editCompanyFields.Website().url; 								
	    editingCompanyEntity[ appDict.companyFieldsDict["ShortTitle"] ] = self.editCompanyFields.ShortTitle();
	    editingCompanyEntity[ appDict.companyFieldsDict["DUNS"] ] = self.editCompanyFields.DUNS();
	    editingCompanyEntity[ appDict.companyFieldsDict["CAGE"] ] = self.editCompanyFields.CAGE();
	    editingCompanyEntity[ appDict.companyFieldsDict["BusinessSize"] ] = self.editCompanyFields.BusinessSize();
	    editingCompanyEntity[ appDict.companyFieldsDict["SocioeconomicDisadvantagedDesignation"] ] = self.editCompanyFields.SocioeconomicDisadvantagedDesignation();
	    editingCompanyEntity[ appDict.companyFieldsDict["HeadquartersLocation"] ] = self.editCompanyFields.HeadquartersLocation();
	    editingCompanyEntity[ appDict.companyFieldsDict["FacilityClearanceLevel"] ] = self.editCompanyFields.FacilityClearanceLevel();
	    editingCompanyEntity[ appDict.companyFieldsDict["ContractorLevel"] ] = self.editCompanyFields.ContractorLevel();
	    editingCompanyEntity[ appDict.companyFieldsDict["Certifications"] ] = self.editCompanyFields.Certifications();
	    editingCompanyEntity[ appDict.companyFieldsDict["TechnologyPartnerships"] ] = self.editCompanyFields.TechnologyPartnerships();
	    editingCompanyEntity[ appDict.companyFieldsDict["CorporateAchievements"] ] = self.editCompanyFields.CorporateAchievements();
	    editingCompanyEntity[ appDict.companyFieldsDict["DemonstratedCapabilities"] ] = self.editCompanyFields.DemonstratedCapabilities();
	    editingCompanyEntity[ appDict.companyFieldsDict["RelevantExperience"] ] = self.editCompanyFields.RelevantExperience();
	    while (editingCompanyEntity[ appDict.companyFieldsDict["DHSComponentExperience"] ].pop()){} //empty array
	    $.each(self.editCompanyFields.DHSComponentExperience(), function(key, val) {
		    editingCompanyEntity[ appDict.companyFieldsDict["DHSComponentExperience"] ].push(val);
	    });

	    entityManager.saveChanges()
	    	.then(function (saveResult) {
				var savedEntities = saveResult.entities;
				var keyMappings = saveResult.keyMappings;	
				self.viewCompanyFields.Title(self.editCompanyFields.Title());
				self.viewCompanyFields.ShortTitle(self.editCompanyFields.ShortTitle());
				self.viewCompanyFields.Website(self.editCompanyFields.Website());
				self.viewCompanyFields.DUNS(self.editCompanyFields.DUNS());
				self.viewCompanyFields.CAGE(self.editCompanyFields.CAGE());
				self.viewCompanyFields.BusinessSize(self.editCompanyFields.BusinessSize());
				self.viewCompanyFields.SocioeconomicDisadvantagedDesignation(self.editCompanyFields.SocioeconomicDisadvantagedDesignation());
				self.viewCompanyFields.HeadquartersLocation(self.editCompanyFields.HeadquartersLocation());
				self.viewCompanyFields.FacilityClearanceLevel(self.editCompanyFields.FacilityClearanceLevel());
				self.viewCompanyFields.Certifications(self.editCompanyFields.Certifications());
				self.viewCompanyFields.TechnologyPartnerships(self.editCompanyFields.TechnologyPartnerships());
				self.viewCompanyFields.CorporateAchievements(self.editCompanyFields.CorporateAchievements());
				self.viewCompanyFields.DemonstratedCapabilities(self.editCompanyFields.DemonstratedCapabilities());
				self.viewCompanyFields.RelevantExperience(self.editCompanyFields.RelevantExperience());
				self.viewCompanyFields.DHSComponentExperience(self.editCompanyFields.DHSComponentExperience());
				return saveResult;
		    })
		    .then(function(saveResult) {
		    	var msg = saveResult.entities.length ? "Item saved" : "nothing to do";
		    	vtompShowNotification(msg, true, function() {
			 			Backbone.history.navigate('/listcompanies', true);
					});
		    })
		    .fail(vtompErrorHandler);

	
	};
    self.DeleteCompany= function () {
		if (!confirm("Delete company?")) {
			return;
		}
		editingCompanyEntity.entityAspect.setDeleted();
      	entityManager.saveChanges()
	        .then(function () {
				crudstate.changeEvents.companyDeleted.fire(self.companyId());
				self.companyId("");
	        	self.companies.removeAll();
	        	self.companiesLoaded = false;
						self.companyId("");
						vtompShowNotification('Item deleted', true, function() {
				 			Backbone.history.navigate('/teamoverview' , true);
						});
	        })
		    .fail(function (e) {
		    // e is any exception that was thrown.
									vtompShowNotification(" Error " + e, false);
			});
	};
	/////////////////////////////////////////Create Company///////////////////
	
	self.initCreateCompany = function() {
		crudmetamodel.LoadLookups()
			.then(function(lookups){
				self.BusinessSizeChoices(lookups.BusinessSizeChoiceFieldChoiceValues );
				self.FacilityClearanceLevelChoices(lookups.FacilityClearanceLevelChoiceFieldChoiceValues );
				self.ContractorLevelChoices(lookups.ContractorLevelChoiceFieldChoiceValues );
				self.DHSComponentExperienceChoices(lookups.DHSComponentExperienceChoiceFieldChoiceValues );
			}, function(errorArgs) {
							vtompShowNotification("Error " + errorArgs, false);
			})
	};

    self.CreateCompany= function () {
    	var companyType = entityManager.metadataStore.getEntityType(appDict.listDict["Companies"])
  		var creatingCompanyEntity= entityManager.createEntity(companyType );
	    creatingCompanyEntity.Title = self.createCompanyFields.Title();
	    var urlInfoEntity= creatingCompanyEntity[ appDict.companyFieldsDict["Website"] ];
	    urlInfoEntity.Description = self.createCompanyFields.Website().description ? 
	    								self.createCompanyFields.Website().description 
	    								: self.createCompanyFields.Website().url;
	    urlInfoEntity.Url = self.createCompanyFields.Website().url; 
	    creatingCompanyEntity[ appDict.companyFieldsDict["ShortTitle"] ] = self.createCompanyFields.ShortTitle();
	    creatingCompanyEntity[ appDict.companyFieldsDict["DUNS"] ] = self.createCompanyFields.DUNS();
	    creatingCompanyEntity[ appDict.companyFieldsDict["CAGE"] ] = self.createCompanyFields.CAGE();
	    creatingCompanyEntity[ appDict.companyFieldsDict["BusinessSize"] ] = self.createCompanyFields.BusinessSize();
	    creatingCompanyEntity[ appDict.companyFieldsDict["SocioeconomicDisadvantagedDesignation"] ] = self.createCompanyFields.SocioeconomicDisadvantagedDesignation();
	    creatingCompanyEntity[ appDict.companyFieldsDict["HeadquartersLocation"] ] = self.createCompanyFields.HeadquartersLocation();
	    creatingCompanyEntity[ appDict.companyFieldsDict["FacilityClearanceLevel"] ] = self.createCompanyFields.FacilityClearanceLevel();
	    creatingCompanyEntity[ appDict.companyFieldsDict["ContractorLevel"] ] = self.createCompanyFields.ContractorLevel();
	    creatingCompanyEntity[ appDict.companyFieldsDict["Certifications"] ] = self.createCompanyFields.Certifications();
	    creatingCompanyEntity[ appDict.companyFieldsDict["TechnologyPartnerships"] ] = self.createCompanyFields.TechnologyPartnerships();
	    creatingCompanyEntity[ appDict.companyFieldsDict["CorporateAchievements"] ] = self.createCompanyFields.CorporateAchievements();
	    creatingCompanyEntity[ appDict.companyFieldsDict["DemonstratedCapabilities"] ] = self.createCompanyFields.DemonstratedCapabilities();
	    creatingCompanyEntity[ appDict.companyFieldsDict["RelevantExperience"] ] = self.createCompanyFields.RelevantExperience();
	    $.each(self.createCompanyFields.DHSComponentExperience(), function(key, val) {
		    creatingCompanyEntity[ appDict.companyFieldsDict["DHSComponentExperience"] ].push(val);
	    });
		

	    entityManager.saveChanges()
		    .then(function(saveResult) {
		    	if (saveResult.entities.length) {
					var newId = saveResult.entities[0].Id;
		    		entityManager.detachEntity(saveResult.entities[0]); //the return val doesn't have dhscomponentexperience, not sure why, just clear cache for now
					vtompShowNotification(self.createCompanyFields.Title() + " successfully added!", true, function() {
			 			Backbone.history.navigate('/editcompany/' + newId, true);
					});
		    	} else {
			    	vtompShowNotification("nothing to do", true);
		    	}
		    })
		    .fail(vtompErrorHandler);

	
	};
	
	//////////////////////////////////List view company for Admins//////////////////////
	
	self.listViewCompanies = ko.observableArray();
	
	self.loadListViewCompaniesRan = false;
	self.loadListViewCompanies = function() {
		if (self.loadListViewCompaniesRan) {
			return;
		}
			
		self.loadListViewCompaniesRan = true;

	    var listName = appDict.listDict["Companies"];
	    var endpoint = _spPageContextInfo.webAbsoluteUrl + "/_api/web/lists/GetByTitle('" + listName + "')/"
			+ "items?$select=Id,Title" 
				+ "," + appDict.companyFieldsDict["ShortTitle"]
				+ "," + appDict.companyFieldsDict["Website"]
				+ "," + appDict.companyFieldsDict["BusinessSize"]
				+ "," + appDict.companyFieldsDict["DUNS"]
				+ "," + appDict.companyFieldsDict["HeadquartersLocation"]
			+ "&$orderby=" + appDict.companyFieldsDict["ShortTitle"] +" asc, Title asc"
	    ;
	    var lvpost= $.ajax({
	        url: endpoint,
	        type: "GET",
	  		dataType: "json",
	        headers: {
	            "X-RequestDigest": $("#__REQUESTDIGEST").val(),
	            "Accept": "application/json; odata=verbose",
	            "Content-Type": "application/json; odata=verbose"
	        },
	    });
	    lvpost.then(function(data, textStatus, jqXHR) {
	    	self.listViewCompanies .removeAll();
             $.each(data.d.results, function (key, val) {
				var website = val[appDict.companyFieldsDict["Website"]];
				var websiteUrl = website ? website.Url : "";
				var websiteDescription = website ? website.Description : "";
				var vmWebsite = new Website(websiteUrl , websiteDescription  ? websiteDescription  : websiteUrl );
	            var company = {};
	            company.Website = vmWebsite;
	            company.Id = val.Id;
	            company.Title = val.Title;
	            company.ShortTitle = val[appDict.companyFieldsDict["ShortTitle"]];
	            company.BusinessSize= val[appDict.companyFieldsDict["BusinessSize"]];
	            company.DUNS= val[appDict.companyFieldsDict["DUNS"]];
	            company.HeadquartersLocation= val[appDict.companyFieldsDict["HeadquartersLocation"]];
	             self.listViewCompanies .push(company);
            });
            tablesort.applyTableSort('#companiesList');
	    });
		lvpost.fail(vtompErrorHandler);
	};
	return self;

});