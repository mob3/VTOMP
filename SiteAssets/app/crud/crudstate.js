define(["../fieldDict"
],function(
appDict
){
var self = {};


	self.changeEvents = {
		companyPOCsChanged : {
			actions :[]
			, fire : function(callback) {
				$.each(self.changeEvents.companyPOCsChanged.actions , function (key, val) {
					val();
				});
				if (callback) callback();
			}
		}
		, companyPOCUpdated : {
			actions :[]
			, fire : function(profileId, etag) {
				$.each(self.changeEvents.companyPOCUpdated.actions , function (key, val) {
					val(profileId, etag);
				});
			}
		}
		, companyDeleted : {
			actions :[]
			, fire : function(companyId) {
				$.each(self.changeEvents.companyDeleted.actions , function (key, val) {
					val(companyId);
				});
			}
		}
		, profileDeleted : {
			actions :[]
			, fire : function(profileId) {
				$.each(self.changeEvents.profileDeleted .actions , function (key, val) {
					val(profileId);
				});
			}
		}
		, profileCreated : {
			actions :[]
			, fire : function(profileId) {
				$.each(self.changeEvents.profileCreated .actions , function (key, val) {
					val(profileId);
				});
			}
		}
		, vehicleUpdated : {
			actions :[]
			, fire : function(vehicleId) {
				$.each(self.changeEvents.vehicleUpdated.actions , function (key, val) {
					val(vehicleId);
				});
			}
		}
		, vehicleDeleted: {
			actions :[]
			, fire : function(vehicleId) {
				$.each(self.changeEvents.vehicleDeleted.actions , function (key, val) {
					val(vehicleId);
				});
			}
		}
		, vehicleCreated: {
			actions :[]
			, fire : function(vehicleId) {
				$.each(self.changeEvents.vehicleCreated.actions , function (key, val) {
					val(vehicleId);
				});
			}
		}
	};

return self;
});