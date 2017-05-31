'use strict';
 
 
 define(['text!./siteDict.txt'], function(siteDict) {

var siteDictOjb = JSON.parse(siteDict);
return siteDictOjb ;
});
