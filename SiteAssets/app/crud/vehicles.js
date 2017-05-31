define(["../fieldDict", "breeze", 'ko'
, "../breeze-app-model"
, "./crudstate"
 , "tablesort"
], function( appDict, breeze, ko
, entityManager
, crudstate
 			, tablesort
) {
	var moduleName = "vehicles";

	var self = {};
	
	self.vehicleList= ko.observableArray();
	self.selectedVehicle = ko.observable(new Vehicle(null,null,null,null,null,null));


	function Vehicle(id, title, created, modified , entity, cc) {
		this.id = ko.observable(id);
		this.title = ko.observable(title);
		this.created = ko.observable(created);
		this.modified = ko.observable(modified );
		this.cc = ko.observable(cc);
		this.entity = entity;
	}
	
	var loadVehiclesRan = false;
	self.loadVehicles = function() {
		if (loadVehiclesRan) {
			return;
		}
		vtompPleaseWaitMsg.showPleaseWait(moduleName);
		loadVehiclesRan = true;
    	var vehicleType= entityManager.metadataStore.getEntityType(appDict.listDict["Vehicles"]);
	  breeze.EntityQuery
	    .from(vehicleType.defaultResourceName)
	    .using(entityManager)
	    .execute()
	    .then(function (response) {
	      var results = response.results;
	      // write results > div
	      if (results && results.length) {
	      	self.vehicleList.removeAll();
	   //     var message = '';
	        for (var index = 0; index < results.length; index++) {
	        	self.vehicleList.push(new Vehicle(results[index].Id
	        		, results[index].Title, results[index].Created 
	        		, results[index].Modified , results[index], results[index].AlwaysCC
	        		));
	        }
	      }
            tablesort.applyTableSort('#vehiclesList');
			vtompPleaseWaitMsg.hidePleaseWait(moduleName);
	    })
	    .fail(vtompErrorHandler);

	};
	
	self.editVehicle = function(vehicleEntity) {
		self.selectedVehicle(vehicleEntity);
	};
	
	self.SaveVehicle = function() {
		var selectedEntity;
		var selectedId = self.selectedVehicle().id();
		if (!selectedId) {
	    	var vehicleType= entityManager.metadataStore.getEntityType(appDict.listDict["Vehicles"]);
	  		selectedEntity = entityManager.createEntity(vehicleType);
	  		self.selectedVehicle().entity = selectedEntity ;
		} else {
			selectedEntity = self.selectedVehicle().entity;
		}

		selectedEntity.Title = self.selectedVehicle().title();
	    entityManager.saveChanges()
		    .then(function(saveResult) {
		    	if (saveResult.entities.length) {
		    		if (!self.selectedVehicle().id()) { //was create
		    			var newVehicle = new Vehicle(saveResult.entities[0].Id
			        		, saveResult.entities[0].Title, saveResult.entities[0].Created 
			        		, saveResult.entities[0].Modified , saveResult.entities[0], saveResult.entities[0].AlwaysCC);
			        	self.vehicleList.push(newVehicle );
						self.selectedVehicle(newVehicle );
						crudstate.changeEvents.vehicleCreated.fire(self.selectedVehicle().id());
		    		}else {
						crudstate.changeEvents.vehicleUpdated.fire(self.selectedVehicle().id());
					}
					vtompShowNotification('Item saved', true);
		    	} else {
			    	vtompShowNotification("nothing to do", true);
		    	}
		    })
		    .fail(vtompErrorHandler);
	
	};

	self.CreateVehicle = function() {
		self.selectedVehicle(new Vehicle(null,null,null,null,null,null));
	};
	
	self.DeleteVehicle = function() {
		if (!confirm("Delete vehicle?")) {
			return;
		}
		var selectedEntity = self.selectedVehicle().entity;
		var selectedVehicle = self.selectedVehicle();
		var selectedId = selectedVehicle.id();
		self.vehicleList.remove(selectedVehicle );


		selectedEntity.entityAspect.setDeleted();
	    entityManager.saveChanges()
		    .then(function(saveResult) {
					crudstate.changeEvents.vehicleDeleted.fire(selectedId);
					vtompShowNotification('Vehicle deleted', true);
		    })
		    .fail(vtompErrorHandler);
	};
	
	return self;

});