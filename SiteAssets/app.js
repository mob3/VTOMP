requirejs.config({
    //By default load any module IDs from js/lib
    baseUrl: '../SiteAssets/lib',
    //except, if the module ID starts with "app",
    //load it from the js/app directory. paths
    //config is relative to the baseUrl, and
    //never includes a ".js" extension since
    //the paths config could be for a directory.
    paths: {
        app: '../app'
        , "jquery": "https://ajax.aspnetcdn.com/ajax/jQuery/jquery-1.11.3"
        , "datatables": "https://cdn.datatables.net/1.10.10/js/jquery.dataTables"
        , "ko": "https://ajax.aspnetcdn.com/ajax/knockout/knockout-3.4.0.debug" //"knockout-3.3.0"
        , "moment": "moment.min"
        , "tablesort": "../app/tablesort"
        , "numeral": "https://cdnjs.cloudflare.com/ajax/libs/numeral.js/1.4.5/numeral.min"
        , "datepicker": "https://cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.5.0/js/bootstrap-datepicker"
		, underscore: 'https://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.8.3/underscore' //'underscore-min'      
		, backbone: 'https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.2.3/backbone'  
		, "breeze": "breeze.debug"
 /*       , "Q": "q"
        , "breeze.labs.dataservice.abstractrest": "breeze.labs.dataservice.abstractrest"
        , "breeze.labs.dataservice.sharepoint": "breeze.labs.dataservice.sharepoint"
        , "breeze.metadata-helper": "breeze.metadata-helper" */
    }
    , waitSeconds: 25 //default is 7
    , shim: {
    	"breeze.labs.dataservice.sharepoint": ["breeze.labs.dataservice.abstractrest"]
 /*   	, "breeze.debug": ["q"]
		, Q: {
            exports: "Q"
        } 
        breeze: {
		    deps: ['jquery', 'Q']
		}*/
    }
});

// Load the main app module to start the app
requirejs(["app/main"], function(main) {
	console.log("loaded main");
});
// Start the main app logic.
//requirejs(['jquery'],// 'canvas'], 'app/breeze-app-model'],
//function   ($) {//,        canvas,   breeze_app_model) {
    //jQuery, canvas and the app/sub module are all
    //loaded and can be used here now.
//    console.log("jqueryloadded");
//});