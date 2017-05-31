/*global Backbone */

//(function () {
	'use strict';
	
	define( ["jquery"
	, "./load-contracts"
	, "./load-user-attributes"
	, "./kovm"
	, "backbone"
    , "./crud/selected-contract"
    , "./crud/create-contract"
    , "./crud/companies"
    , "./crud/profiles"
    , "./crud/profile"
    , "./crud/create-profile"
    , "./crud/vehicles"
	, 'text!./templates/contractsList.html'
	, 'text!./templates/teamoverview.html'
	, 'text!./templates/companies.html'
	, 'text!./templates/contractDetailsView.html'
	, 'text!./templates/contractDetailsEdit.html'
	, 'text!./templates/contractDetailsCreate.html'
	, 'text!./templates/companyDetailsView.html'
	, 'text!./templates/companyDetailsEdit.html'
	, 'text!./templates/companyDetailsCreate.html'
	, 'text!./templates/profilesList.html'
	, 'text!./templates/profileView.html'
	, 'text!./templates/profileEdit.html'
	, 'text!./templates/profileCreate.html'
	, 'text!./templates/vehicles.html'
	], function($, loadContracts, userAttribs
, kovm, Backbone
 			, selectContract
 			, createContract
 			, companies
 			, profiles
 			, profile
 			, createProfile
 			, vehiclesPage
 	, contractsListTemplate
	, teamoverviewTemplate
	, listcompaniesTemplate
	, contractDetailsViewTemplate
	, contractDetailsEditTemplate
	, contractDetailsCreateTemplate
	, companyDetailsViewTemplate
	, companyDetailsEditTemplate
	, companyDetailsCreateTemplate
	, profilesListTemplate
	, profileViewTemplate
	, profileEditTemplate
	, profileCreateTemplate
	, vehiclesPageTemplate
	) {
	var moduleName = "bbnav";
	var viewModelBindingsApplied = false;
  var bbapp = {
    Views: {},
    Extensions: {},
    Router: null,

    init: function () {
 		//vtompPleaseWaitMsg.showPleaseWait(moduleName);

      this.instance = new bbapp.Views.App();
      this.contractsListView = new bbapp.Views.Home();
      this.prepublishedContractsListView = new bbapp.Views.PrePublishedContracts ();
      this.teamoverView = new bbapp.Views.TeamOverviewView();
      this.listcompaniesView = new bbapp.Views.ListCompaniesView ();
      this.companyView = new bbapp.Views.CompanyView();
      this.companyEditView = new bbapp.Views.CompanyEditView();
      this.companyCreateView = new bbapp.Views.CompanyCreateView();
      this.contractView = new bbapp.Views.ContractView();
      this.contractEditView = new bbapp.Views.ContractEditView();
      this.contractCreateView = new bbapp.Views.ContractCreateView();
      this.profilesListView = new bbapp.Views.ProfilesView();
      this.profileView = new bbapp.Views.ProfileView ();
      this.profileEditView = new bbapp.Views.ProfileEditView ();
      this.profileCreateView = new bbapp.Views.ProfileCreateView();
      this.vehiclesPageView = new bbapp.Views.VehiclesPageView();
      console.log("starting backbone history");
      Backbone.history.start();

    }
  };

	bbapp.views = {};
	
    bbapp.Router = Backbone.Router.extend({
      routes: {
      'editcontract/:id': 'editcontract',
      'viewcontract/:id': 'viewcontract',
      'createcontract': 'createcontract',
      'teamoverview': 'teamoverview',
      'listcompanies': 'listcompanies',
      'viewcompany/:id': 'viewcompany',
      'editcompany/:id': 'editcompany',
      'createcompany': 'createcompany',
      '': 'home',
      'contracts': 'home',
      'contracts/archived': 'contractsArchived',
      'contracts/prepublished': 'contractsPrePublished',
      'profiles': 'profiles',
      'viewprofile/:id': 'viewprofile',
      'editprofile/:id': 'editprofile',
      'createprofile': 'createprofile',
      'vehicles': 'vehiclespage',
        '*filter' : 'setFilter'
      },

    home: function () {
    	userAttribs.userAttributesLoadedPromise.then(loadContracts.loadActiveContracts );
      bbapp.instance.goto(bbapp.contractsListView);
    },

    contractsArchived: function () {
    	userAttribs.userAttributesLoadedPromise.then(loadContracts.loadArchivedContracts);
      bbapp.instance.goto(bbapp.contractsListView);
    },
    contractsPrePublished: function () {
    	userAttribs.userAttributesLoadedPromise.then(loadContracts.loadPrePublishedContracts );
      bbapp.instance.goto(bbapp.prepublishedContractsListView );
    },

    editcontract: function (id) {
			selectContract.getSelectedContract(id);
      bbapp.instance.goto(bbapp.contractEditView );
    },
    viewcontract: function (id) {
			selectContract.getSelectedContract(id);
      bbapp.instance.goto(bbapp.contractView );
    }
    ,createcontract: function () {
      bbapp.instance.goto(bbapp.contractCreateView );
    }
    ,listcompanies: function () {
      bbapp.instance.goto(bbapp.listcompaniesView );
    }
    ,teamoverview: function () {
  //    var view = new bbapp.Views.TeamOverviewView();
      bbapp.instance.goto(bbapp.teamoverView);
    }
    ,viewcompany: function (id) {
      bbapp.instance.goto(bbapp.companyView, {companyId : id});
    }
    ,editcompany: function (id) {
      bbapp.instance.goto(bbapp.companyEditView, {companyId : id});
    }
    ,createcompany: function () {
      bbapp.instance.goto(bbapp.companyCreateView);
    }
    ,profiles: function (id) {
      bbapp.instance.goto(bbapp.profilesListView);
    }
    ,viewprofile: function (id) {
      bbapp.instance.goto(bbapp.profileView , {profileId : id});
    }
    ,editprofile: function (id) {
      bbapp.instance.goto(bbapp.profileEditView , {profileId : id});
    }
    ,createprofile: function () {
      bbapp.instance.goto(bbapp.profileCreateView );
    }
    ,vehiclespage: function () {
      bbapp.instance.goto(bbapp.vehiclesPageView );
    }
    ,  setFilter: function(params) {
      // We have no matching route, lets just log what the URL was
        console.log('app.router.params = ' + params); 
        window.filter = params.trim() || '';
      //  app.todoList.trigger('reset');
      }
    });
    
 //    bbapp.router = new BBRouter();
 //    Backbone.history.start();
	 
  bbapp.Extensions.View = Backbone.View.extend({

    initialize: function () {
    //	this.$bindingsApplied = this.bindingsApplied;
    	this.$navEl = Backbone.$(this.navEl);
      this.router = new bbapp.Router();
      if (this.bbappInit) {
      	this.bbappInit();
      }
      
    },

    render: function(options) {

      options = options || {};

      if (options.page === true) {
        this.$el.addClass('page');
      }

      return this;

    },

    transitionIn: function (callback) {

      var view = this,
          delay

      var transitionIn = function () {
      	view.$navEl.addClass('active');
       // view.$el.addClass('is-visible');
        view.$el.removeClass('hidden');
        view.$el.one('transitionend', function () {
          if (_.isFunction(callback)) {
            callback();
          }
        })
      };

      _.delay(transitionIn, 20);

		if (!viewModelBindingsApplied ) {
	      	console.log("applying bindings");
	    	kovm.applyKOBindings();
			viewModelBindingsApplied = true;
			vtompPleaseWaitMsg.hidePleaseWait(moduleName); 
		}
    },

    transitionOut: function (callback) {

      var view = this;

  //    view.$el.removeClass('is-visible');
  		view.$navEl.removeClass('active');
 // 		view.$navEl.addClass('hidden');
      view.$el.addClass('hidden');
      view.$el.one('transitionend', function () {
        if (_.isFunction(callback)) {
          callback();
        };
      });

    }

  });
  
  bbapp.Views.App = bbapp.Extensions.View.extend({

    el: '.mainContent',

    goto: function (view, gotoArgs) {

      var previous = this.currentPage || null;
      var next = view;

      if (previous) {
        previous.transitionOut(function () {
     //     previous.remove();
        });
      }
	  var renderArgs = { page: true };
	  if (gotoArgs) {
	 	$.extend(renderArgs, gotoArgs);
	  }
      next.render(renderArgs);
    //  this.$el.append( next.$el );
      next.transitionIn();
      this.currentPage = next;

    }

  });

  bbapp.Views.Home = bbapp.Extensions.View.extend({

     el: '#contractsList',
	navEl: '#homeNav',

//   className: 'home',
	bbappInit: function() {
    	this.$el.html(contractsListTemplate);
	}
    , render: function () {
    }

  });
  bbapp.Views.PrePublishedContracts = bbapp.Views.Home.extend({
	navEl: '#prepublishedNav',
  });

  bbapp.Views.ContractEditView= bbapp.Extensions.View.extend({

	el: '#contractEditView',
  //  className: 'activity',
	navEl: '#editcontractNav',
	bbappInit: function() {
    	$('#edit-contract-template').html(contractDetailsEditTemplate);
	}
    , render: function () {
     // var template = _.template($('script[name=activity]').html());
     // this.$el.html(template());
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });

  bbapp.Views.ContractCreateView= bbapp.Extensions.View.extend({

	el: '#contractCreateView',
	navEl: '#createcontractNav',
	bbappInit: function() {
 //		vtompPleaseWaitMsg.showPleaseWait(moduleName);
    	this.$el.html(contractDetailsCreateTemplate);
	}
    , render: function () {
	    	createContract.initCreateContract ();
//			vtompPleaseWaitMsg.hidePleaseWait(moduleName); 
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });

  bbapp.Views.ContractView = bbapp.Extensions.View.extend({

	el: '#contractDetailsView',
	navEl: '#viewcontractNav',
	bbappInit: function() {
    	$('#view-contract-template').html(contractDetailsViewTemplate);
	}
    ,render: function () {
     // var template = _.template($('script[name=activity]').html());
     // this.$el.html(template());
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });
  bbapp.Views.TeamOverviewView = bbapp.Extensions.View.extend({

	el: '#teamOverview',
	navEl: '#teamoverviewNav',
	bbappInit: function() {
    	this.$el.html(teamoverviewTemplate);
	}
    , render: function () {
	     kovm.GlobalVM.loadCompanies();
	//     kovm.GlobalVM.companyId(11);
     	  //   return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });
  bbapp.Views.ListCompaniesView = bbapp.Extensions.View.extend({

	el: '#listCompanies',
	navEl: '#listCompaniesNav',
	bbappInit: function() {
    	this.$el.html(listcompaniesTemplate);
	}
    , render: function () {
	     kovm.GlobalVM.loadListViewCompanies ();
    }

  });
  bbapp.Views.CompanyView = bbapp.Extensions.View.extend({

	el: '#companyDetailsView',
	navEl: '#viewcompanyNav',
	bbappInit: function() {
    	$('#view-company-template').html(companyDetailsViewTemplate);
	}
    , render: function (renderArgs) {
		companies.getSelectedCompany(renderArgs.companyId);
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });
  bbapp.Views.CompanyEditView = bbapp.Extensions.View.extend({

	el: '#companyEditView',
	navEl: '#editcompanyNav',
	bbappInit: function() {
    	$('#edit-company-template').html(companyDetailsEditTemplate);
	}
    , render: function (renderArgs) {
		companies.getSelectedCompany(renderArgs.companyId);
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });
  bbapp.Views.CompanyCreateView= bbapp.Extensions.View.extend({

	el: '#companyCreateView',
	navEl: '#createcompanyNav',
	bbappInit: function() {
    	this.$el.html(companyDetailsCreateTemplate);
	}
    , render: function () {
	    	companies.initCreateCompany ();
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });

  bbapp.Views.ProfilesView = bbapp.Extensions.View.extend({

     el: '#profilesList',
	navEl: '#profilesNav',

	bbappInit: function() {
    	this.$el.html(profilesListTemplate);
	}
    , render: function (renderArgs) {
	//		companies.getSelectedCompany(renderArgs.companyId);
		profiles.loadProfiles ();
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });
  bbapp.Views.ProfileView = bbapp.Extensions.View.extend({

	el: '#profileView',
	navEl: '#viewprofileNav',
	bbappInit: function() {
    	this.$el.html(profileViewTemplate);
	}
    , render: function (renderArgs) {
			profile.getSelectedProfile (renderArgs.profileId);
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });
  bbapp.Views.ProfileEditView = bbapp.Extensions.View.extend({

	el: '#profileEdit',
	navEl: '#editprofileNav',
	bbappInit: function() {
    	this.$el.html(profileEditTemplate);
	}
    , render: function (renderArgs) {
			profile.getSelectedProfile (renderArgs.profileId);
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });
  bbapp.Views.ProfileCreateView= bbapp.Extensions.View.extend({

	el: '#profileCreate',
	navEl: '#createprofileNav',
	bbappInit: function() {
    	this.$el.html(profileCreateTemplate);
	}
    , render: function () {
	    	createProfile.initializeCreateProfile ();
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });
  bbapp.Views.VehiclesPageView= bbapp.Extensions.View.extend({

	el: '#vehiclesPage',
	navEl: '#vehiclesNav',
	bbappInit: function() {
    	this.$el.html(vehiclesPageTemplate);
	}
    , render: function () {
	    	vehiclesPage.loadVehicles ();
      return bbapp.Extensions.View.prototype.render.apply(this, arguments);
    }

  });


    bbapp.init();
    
    return bbapp;

});	 
// })();