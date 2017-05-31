define(["jquery"
, "moment", 'ko'], function(jQuery, moment, ko) {

	/*Datetime issues with moment =>*/
	self = {};
	self.currentDate = function () {
	    return moment().format('MM-DD-YYYY');        //sends current datetime
	};
	
	self.clientDateStringFromDate = function (date) {
	    return moment(date).format('MM-DD-YYYY');   //converts a date object to a given formate
	   // return moment(date).format('YYYY-MM-DDTHH:mm:ssZ');   //converts a date object to a given formate
	};
		
	 ko.observableArray.fn.find = function(prop, data) {
	    var valueToMatch = data[prop]; 
	    return ko.utils.arrayFirst(this(), function(item) {
	        return item[prop] === valueToMatch; 
	    });
	};
	
	// For some reason breeze returns a computedObservable sometimes. 
	// TODO dig into breeze.js code and see why this is. suspect has something to do with detecting ko is present.
	// For now this is a workaround.
	// Update: I added a line to vtomp.breeze.labs.dataservice.sharepoint.js (look for "disable ko integration")
	// that should have fixed this issue. TODO: remove references to this function
	self.vtompFixBreezeKOFix = function(entityData) {
		if (typeof entityData=== "function") {
			entityData= entityData(); //hack see below
		}
		return entityData;
	}

	/**
	 * Compare two arrays if they are equal even if they have different order.
	 *
	 * @link http://stackoverflow.com/a/7726509
	 */
	jQuery.extend({
	  /**
	   * @param {array} a
	   *   First array to compare.
	   * @param {array} b
	   *   Second array to compare.
	   * @return {boolean}
	   *   True if both arrays are equal, otherwise false.
	   */
	  arrayCompare: function (a, b) {
	    return $(a).not(b).get().length === 0 && $(b).not(a).get().length === 0;
	  }
	});


return self;
});