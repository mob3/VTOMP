define(["jquery", 'ko', "moment", "numeral", "./fieldDict", "datepicker"], function($, ko, moment, numeral, appDict){
 var vtompapp = {};
 $.extend(vtompapp, appDict);

//depends fieldDict.js, vtompUtil.js

/*
 * Project Name : KoSp - Knockout for SharePoint
 * Version      : 1.0 
 * Build Date   : 10-Sep-2013
 * Author       : Ashok Raja .T
 * Blog         : http://www.ashokraja.me 
 * Project Site : http://kosp.codeplex.com
 */
var formatMutliItems = function (element, valueAccessor, allBindingsAccessor, dField, sType) {
    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var strLookUpData = ko.utils.unwrapObservable(value);
    var dispColumn = allBindings.displayField || dField;
    var sourceType = sType || 'rest';
    var bas = allBindings.dataFormat;
    var dispSep = bas || ', ';
    var resu = parseMultiItems(strLookUpData, sourceType, dispSep, dispColumn);
    if (resu) {
        if (bas)
            element.innerHTML = resu.substring(0, resu.length - dispSep.length);
        else
            return resu.substring(0, resu.length - dispSep.length);
    }
    else {
        return allBindings.defaultValue;
    }
};

function parseMultiItems(strLookUpData, sType, dispSep, dispColumn) {
    var resu = '';
    if (strLookUpData) {
        switch (sType) {
            case "camlLookup":
                var lpItems = strLookUpData.split(';#');
                var ItemType = dispColumn == "id" ? 0 : 1;
                for (var i = 0, j = lpItems.length; i < j; i++) {
                    if (i % 2 == ItemType)
                        resu += lpItems[i] + dispSep;
                }
                return resu;
            case "camlChoice":
            case "camlAttach":
                if (sType == 'camlAttach' && strLookUpData == '0')
                    return null;
                var lpItems = strLookUpData.split(';#');
                ko.utils.arrayForEach(lpItems, function (item) {
                    if (item)
                        resu += item + dispSep;
                });
                return resu;
            case "restLookup":
            default:
                ko.utils.arrayForEach(strLookUpData.results, function (item) {
                    resu += item[dispColumn] + dispSep;
                });
                return resu;
        }
    }
    return strLookUpData;
}
var formatMetaItems = function (element, valueAccessor, allBindingsAccessor, dField) {
    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var strLookUpData = ko.utils.unwrapObservable(value);
    var dispColumn = allBindings.displayField || dField;
    var dispIndex = allBindings.displayIndex;
    var bas = allBindings.dataFormat;
    var dispSep = bas || ', ';
    var resu = '';

    if (dispIndex) {
        resu = strLookUpData.results[dispIndex].__metadata[dispColumn];
    }
    else {
        ko.utils.arrayForEach(strLookUpData.results, function (item) {
            resu += item.__metadata[dispColumn] + dispSep;
        });
        if (bas)
            element.innerHTML = resu.substring(0, resu.length - dispSep.length);
        else
            return resu.substring(0, resu.length - dispSep.length);
    }
};

var formatText = function (element, valueAccessor, allBindingsAccessor, dField, dType) {
    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var strDict = ko.utils.unwrapObservable(value);
    var dispColumn = allBindings.displayField || dField;
    var srcType = allBindings.sourceType || dType;
    if (strDict) {
        return getDataStringFromKo(strDict, srcType, dispColumn, ',');
    }
    else {
        return allBindings.defaultValue;
    }
};

function getDataStringFromKo(strDict, srcType, dispColumn, splitText) {
    switch (srcType) {
        case 'lookup':
            return strDict[dispColumn] || strDict[parseInt(dispColumn)];
        case 'meta':
            return strDict.__metadata[dispColumn] || strDict.__metadata[parseInt(dispColumn)];
        case 'array':
            return strDict.split(splitText)[parseInt(dispColumn)];
        case 'link':
        case 'img':
            return strDict.split(splitText)[0];
        case 'linktext':
            return strDict.split(splitText)[1];
        default:
            return strDict;
    }
}

var formatAttr = function (element, valueAccessor, allBindingsAccessor, dField, dType, attrib, onlyAttrib) {

    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var strDict = ko.utils.unwrapObservable(value);
    if (strDict) {
	    var dispColumn = allBindings.displayField || dField;
	    var sText = allBindings.splitText || ',';
	    var srcType = allBindingsAccessor().sourceType || dType;
	    var htmlAttr = allBindings.attrName || attrib;
	    var dispText = allBindings.displayText;
	    var dValue = allBindings.defaultValue;
	    var tData = getDataStringFromKo(strDict, srcType, dispColumn, sText);
	
	    if (tData)
	        element.setAttribute(htmlAttr, tData);
	    else
	        element.setAttribute(htmlAttr, dValue);
	
	    if (dispText)
	        element.innerHTML = dispText;
	    else if (srcType == 'link') {
	        tData = strDict.split(',');
	        dispText = dispText || tData.length > 1 ? tData[1] : tData;
	        element.innerHTML = dispText;
	    } else if (onlyAttrib === false) {
	        element.innerHTML = dValue ? dValue : tData;
	    }
    }
    else {
        return allBindings.defaultValue;
    }
    
};

var formatSPDate = function (element, valueAccessor, allBindingsAccessor, format) {
    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var CustFormat = allBindings.dataFormat || format;
    var strData = ko.utils.unwrapObservable(value);
    return strData ? moment.utc(strData).format(CustFormat) : allBindings.defaultValue;
};

var formatSPsDate = function (element, valueAccessor, allBindingsAccessor, format) {
    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var CustFormat = allBindings.dataFormat || format;
    var strData = ko.utils.unwrapObservable(value);
    return strData ? moment(parseKoCaml(strData)).format(CustFormat) : allBindings.defaultValue;
};

var formatSPNumber = function (element, valueAccessor, allBindingsAccessor, format) {

    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var CustFormat = allBindings.dataFormat || format;
    var strData = ko.utils.unwrapObservable(value);
    if (strData)
        return CustFormat ? numeral(strData).format(CustFormat) : strData;
    else
        return allBindings.defaultValue;
};

var formatSPsNumber = function (element, valueAccessor, allBindingsAccessor, format) {

    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var CustFormat = allBindings.dataFormat || format;
    var strData = ko.utils.unwrapObservable(value);
    if (strData) {
        strData = parseKoCaml(strData);
        return CustFormat ? numeral(strData).format(CustFormat) : strData;
    }
    else
        return allBindings.defaultValue;
};

function parseKoCaml(strData) {
    var sepIndex = strData.indexOf(';#');
    if (sepIndex > -1)
        strData = strData.substring(sepIndex + 2);
    return strData;
}

var formatPair = function (element, valueAccessor, allBindingsAccessor, seperator, index) {

    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var itIndex = allBindings.itemIndex || index;
    itIndex = allBindings.itemIndex == 0 ? 0 : itIndex;
    var sep = allBindings.seperator || seperator;
    var strData = ko.utils.unwrapObservable(value);
    if (strData) {
        var itms = strData.split(sep);
        return itms.length >= itIndex ? itms[itIndex] : allBindings.defaultValue;
    }
    else
        return allBindings.defaultValue;
};

var formatBool = function (element, valueAccessor, allBindingsAccessor, format, srcType) {
    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var strDict = ko.utils.unwrapObservable(value);
    var CustFormat = allBindings.dataFormat || format;
    if (srcType == 'caml') {
        if (strDict) {
            strDict = (strDict == 'true' || strDict == '1') ? true : false;
            return parseKoBool(strDict, CustFormat);
        } else return allBindings.defaultValue;
    } else
        return parseKoBool(strDict, CustFormat);
};

function parseKoBool(strDict, CustFormat) {
    switch (CustFormat) {
        case 'upper':
            return strDict ? 'TRUE' : 'FALSE';
        case 'lower':
            return strDict ? 'true' : 'false';
        case 'number':
            return strDict ? '1' : '0';
        default:
            return strDict ? 'True' : 'False';
    }
}

ko.bindingHandlers.spLookup = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var ab = allBindingsAccessor();
        if (ab.src == 'sps')
            $(element).text(formatMutliItems(element, valueAccessor, allBindingsAccessor, "Title", 'camlLookup'));
        else {
            if (ab.multi == true)
                $(element).text(formatMutliItems(element, valueAccessor, allBindingsAccessor, "Title", 'restLookup'));
            else
                $(element).text(formatText(element, valueAccessor, allBindingsAccessor, "Title", 'lookup'));
        }
    }
};

ko.bindingHandlers.spChoice = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        var ab = allBindingsAccessor();
        if (ab.src == 'sps') {
            var tempValue = ko.utils.unwrapObservable(valueAccessor());
            if (tempValue) {
                if (ab.multi == true || tempValue.indexOf(';#') > -1)
                    $(element).text(formatMutliItems(element, valueAccessor, allBindingsAccessor, "Value", 'camlChoice'));
                else
                    $(element).text(tempValue);
            }
            else {
                $(element).text(ab.defaultValue);
            }
        }
        else {
            if (ab.multi == true)
                $(element).text(formatMutliItems(element, valueAccessor, allBindingsAccessor, "Value"));
            else
                $(element).text(formatText(element, valueAccessor, allBindingsAccessor, "Value", 'lookup'));
        }
    }
};


ko.bindingHandlers.spUser = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        var ab = allBindingsAccessor();
        if (ab.src == 'sps') {
            $(element).text(formatMutliItems(element, valueAccessor, allBindingsAccessor, "Title", 'camlLookup'));
        }
        else {
            if (ab.multi == true)
                $(element).text(formatMutliItems(element, valueAccessor, allBindingsAccessor, "Name"));
            else
                $(element).text(formatText(element, valueAccessor, allBindingsAccessor, "Name","lookup"));
        }
    }
};

ko.bindingHandlers.spDate = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        if (allBindingsAccessor().src == 'sps')
            $(element).text(formatSPsDate(element, valueAccessor, allBindingsAccessor, "DD-MMM-YYYY"));
        else
            $(element).text(formatSPDate(element, valueAccessor, allBindingsAccessor, "DD-MMM-YYYY"));
    }
};

ko.bindingHandlers.spNumber = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        if (allBindingsAccessor().src == 'sps')
            $(element).text(formatSPsNumber(element, valueAccessor, allBindingsAccessor, ''));
        else
            $(element).text(formatSPNumber(element, valueAccessor, allBindingsAccessor, ''));
    }
};

ko.bindingHandlers.spBool = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        if (allBindingsAccessor().src == 'sps')
            $(element).text(formatBool(element, valueAccessor, allBindingsAccessor, 'default', 'caml'));
        else
            $(element).text(formatBool(element, valueAccessor, allBindingsAccessor, 'default', 'rest'));
    }
};

ko.bindingHandlers.spItem = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        $(element).text(formatPair(element, valueAccessor, allBindingsAccessor, ';#', 1));
    }
};

ko.bindingHandlers.spUrl = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var ab = allBindingsAccessor();
        if (ab.src == 'sps')
            $(element).text(formatMutliItems(element, valueAccessor, allBindingsAccessor, "Value", 'camlAttach'));
        else {
            if (ab.multi == true)
                $(element).text(formatMetaItems(element, valueAccessor, allBindingsAccessor, "media_src"));
            else
                $(element).text(formatText(element, valueAccessor, allBindingsAccessor, 'media_src', 'meta'));
        }
    }
};

ko.bindingHandlers.spMetaItem = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        if (allBindingsAccessor().multi == true)
            $(element).text(formatMetaItems(element, valueAccessor, allBindingsAccessor, "uri"));
        else
            $(element).text(formatText(element, valueAccessor, allBindingsAccessor, 'uri', 'meta'));
    }
};

ko.bindingHandlers.spMailHref = {
    update: function (element, valueAccessor, allBindingsAccessor) {
		var value = valueAccessor(), allBindings = allBindingsAccessor();
		var strDict = ko.utils.unwrapObservable(value);
		
		if (!strDict) {
			$(element).text("");
		} else if (strDict instanceof Object) {
			if (strDict.EntityData) { //hack for in case just edited and data pulled from people picker rather than from REST
				element.setAttribute('href', "mailto:" + strDict.EntityData.Email);
				element.innerHTML = strDict.DisplayText;
			} else {
				element.setAttribute('href', "mailto:" + (strDict[allBindings.hrefField] ? strDict[allBindings.hrefField] : ""));
				element.innerHTML = strDict[allBindings.displayField];
			}
			//$(element).text(formatAttr(element, valueAccessor, allBindingsAccessor, '', 'link', 'href', false));
		} else {
			$(element).text(strDict);
		}	
	}
};

ko.bindingHandlers.spHref = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        $(element).text(formatAttr(element, valueAccessor, allBindingsAccessor, '', 'link', 'href', false));
    }
};

ko.bindingHandlers.spSrc = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        $(element).text(formatAttr(element, valueAccessor, allBindingsAccessor, '', 'img', 'src', true));
    }
};

ko.bindingHandlers.spLink = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        $(element).text(formatText(element, valueAccessor, allBindingsAccessor, '', 'link'));
    }
};

ko.bindingHandlers.spLinkText = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        $(element).text(formatText(element, valueAccessor, allBindingsAccessor, '', 'linktext'));
    }
};

ko.bindingHandlers.spText = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        $(element).text(formatText(element, valueAccessor, allBindingsAccessor));
    }
};

ko.bindingHandlers.spAttr = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        $(element).text(formatAttr(element, valueAccessor, allBindingsAccessor, '', '', '', true));
    }
};


var formatVtompSpUserText = function (element, valueAccessor, allBindingsAccessor, dField, dType) {
    var value = valueAccessor(), allBindings = allBindingsAccessor();
    var strDict = ko.utils.unwrapObservable(value);
    var dispColumn = allBindings.displayField || dField;
    var srcType = allBindings.sourceType || dType;
    // need a polyfill for this?
    return new Promise(function(resolve, reject) {
	    if (strDict) {
	    	var dispValue = strDict[dispColumn] || strDict[parseInt(dispColumn)];
	
			//see if the phone is overridden in the profiles list
	    	if (dispColumn === "WorkPhone") {
	    		var email = strDict["WorkEmail"];
	    		if (email) {
				    var jqxhr = $.getJSON(_spPageContextInfo.webAbsoluteUrl + "/_vti_bin/listdata.svc/Profiles?"
						+ "&$filter=(" + "Email" + " eq '" + email + "')"
						+ "&$top=1"
						+ "&$select=" + "WorkPhone"			    
					     ,
					         function (data) {
					             if (data.d.length > 0) {//data.d[0].Other_x0020_POC_x0020_1.Name
									resolve(data.d[0]["WorkPhone"]);
					             } else {
					             	resolve(dispValue);
					             }
					         }
					   );
					jqxhr.fail(function(jqxhr, textStatus, error) {
						reject(jqxhr);
					});
	    		} else {
				 	resolve(dispValue);
	    		}

	    	} else {
				 resolve(dispValue);
	    	}
	    }
	    else {
	        return resolve(allBindings.defaultValue);
	    }
    });
};

ko.bindingHandlers.vtompSpUser = {
    update: function (element, valueAccessor, allBindingsAccessor) {
        var ab = allBindingsAccessor();
        if (ab.multi == true)
            $(element).text(formatMutliItems(element, valueAccessor, allBindingsAccessor, "Name"));
        else {
        	formatVtompSpUserText(element, valueAccessor, allBindingsAccessor, "Name","lookup")
        		.then(function(result) {
            			$(element).text(result ? result : "");
            		},
            		function(e) {
							vtompShowNotification(e.status + " - " + e.statusText, false);
            		});
        }
    }
};


/*Date picker value binder for knockout*/
ko.bindingHandlers.datepicker = {
    init: function (element, valueAccessor, allBindingsAccessor) {
        var options = allBindingsAccessor().datepickerOptions || {};
        $(element).datepicker(options).on("changeDate", function (ev) {
            var observable = valueAccessor();
            observable(ev.date);
        });
    },
    update: function (element, valueAccessor) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        $(element).datepicker("update", value);
      //  $(element).datepicker('update', new Date());
    }
};

jQuery.fn.visible = function() {
    return this.css('visibility', 'visible');
};

jQuery.fn.invisible = function() {
    return this.css('visibility', 'hidden');
};

ko.bindingHandlers.hideEditor = {
	update: function (element, valueAccessor, allBindings, viewModel, bindingContent) {
        var value = ko.utils.unwrapObservable(valueAccessor());
        if (value) {
        	var doWithPerms = function( hasEditPerms ) {
		        if (!hasEditPerms ) {
		        	$(element).hide();
		        	$(element).invisible();
		        } else {
		        	$(element).show();
		        	$(element).visible();
		        }
	        };
	        if (value.groupName) {
	        	vtompDoSomethingWithGroupMembership(vtompapp.groupDict[value.groupName], doWithPerms);
	        } else if (value.listName) {
	        	vtompDoSomethingWithListPerms(vtompapp.listDict[value.listName], value.permissionKind, doWithPerms);
	        } else {
		        var listName= allBindings.get('listName');
		        var permissionKind = allBindings.get('permissionKind');
	        	vtompDoSomethingWithListItemPerms (value, vtompapp.listDict[listName], permissionKind, doWithPerms );
	        }
        } else {
        	$(element).hide();
        	$(element).invisible();
        }
      //  $(element).datepicker('update', new Date());
    }
};

ko.bindingHandlers.spChoiceCSV = {
    update: function (element, valueAccessor, allBindingsAccessor) {
                var tempValue = ko.utils.unwrapObservable(valueAccessor());
				if (tempValue) {
                	$(element).text(tempValue.join(", "));
                }
        
    }
};

ko.bindingHandlers.spMultiLineWithBreaks = {
    update: function (element, valueAccessor, allBindingsAccessor) {
                var tempValue = ko.utils.unwrapObservable(valueAccessor());
                if (tempValue && tempValue.split) {
					var lines = tempValue.split("\n");
	                $(element).html(lines .join("<br/>"));
                } else {
                	$(element).empty();
                }
        
    }
};

ko.bindingHandlers.spProjectDuration = {
    update: function (element, valueAccessor, allBindingsAccessor) {
            var tempValue = ko.utils.unwrapObservable(valueAccessor());
			if (isNaN(tempValue))
				return;
			var time = parseInt(tempValue);
			if (time > 365) {
				time = Math.floor(time / 365);
                $(element).text(time + " year" + (time ===1? "" : "s"));
			} else if (time > 30) {
				time = Math.floor(time / 30);
                $(element).text(time + " month" + (time ===1? "" : "s"));
			} else if (time > 14) {
				time = Math.floor(time / 7);
                $(element).text(time + " week" + (time ===1? "" : "s"));
			} else if (time <= 0) {
                $(element).text("");
			} else {
                $(element).text(time + " day" + (time ===1? "" : "s"));
            }
    }
};

});