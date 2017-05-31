//depends fieldDict.js, vtompUtil.js
 
 define(["jquery", "underscore", "./fieldDict", 'ko', "moment", "./breeze-app-model"
 , "./uploadFile"
 , "./crud/selected-contract"
 , "./crud/create-contract"
 , "./crud/companies"
 , "./crud/profile"
 , "./crud/create-profile"
 , "./load-contracts"
 , "./crud/vehicles"
 , "./apputil"
 , "./ko.sp.r-1.0"
 , "tablesort"
 ]
 			, function($, _, appDict, ko, moment, entityManager, uploadFile
 			, selectContract
 			, createContract
 			, companiesVm
 			, profile
 			, createProfile
 , loadContracts
 , vehicles
 			) {
 var vtompapp = {};//vtompapp || {};
$.extend(vtompapp, appDict);


/*****************ViewModel******************/


vtompapp.viewMetaModel = {};
$.extend(vtompapp.viewMetaModel, selectContract);
$.extend(vtompapp.viewMetaModel, companiesVm);
$.extend(vtompapp.viewMetaModel, {profile : profile});
$.extend(vtompapp.viewMetaModel, {createProfile: createProfile});
$.extend(vtompapp.viewMetaModel, {createContract: createContract});
$.extend(vtompapp.viewMetaModel, {loadContracts: loadContracts});
$.extend(vtompapp.viewMetaModel, {vehicles: vehicles});




function getModel() {
	

    var vm = vtompapp.viewMetaModel;// new vtompapp.CrudViewModel(vtompapp.crudMetaModel.statusChoices, choice);

    return vm;
}
vtompapp.GlobalVM = getModel();
vtompapp.applyKOBindings = function() {
    ko.applyBindings(getModel(), $("#vmform1")[0]);
};



return vtompapp;
});