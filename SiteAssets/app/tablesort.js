// Thanks to http://jqueryboilerplate.com/ for providing a boiler plate. and
// thanks to http://www.reddit.com/user/maktouch for recommending the jQuery
// boiler plate.
// This code is licensed under the MIT liscence

//based on http://jsfiddle.net/SeanJM/sjqXB/9/
//need to upgrade it to a plugin using https://github.com/SeanJM/tablesort
;(function ( window, document, undefined ) {
(function( factory ) {
	"use strict";
		define( 'tablesort', ['jquery'], factory );
}
(/** @lends <global> */function( $ ) {
	"use strict";
var self = {};

function newRow(arr) {
    var row = $('<tr></tr>');
    for (var i=0;i<arr.length;i++) {
        row.append('<td>'+arr[i]+'</td>');
    }
    return row;
}

      // Detaches the rows from the table and replaces them in the sorted order
      function applySort(arg) {        
        arg.tr.detach(); // detach instead of remove, so jQuery properties are kept
        for (var i=0;i<arg.sortArr.length;i++) {
          var tr = arg.rowArr[arg.sortArr[i]];
          arg.table.find('tbody').append(tr); // insert the TRs directly in the tbody, no need to use the <div> placeholder
        };
      };

function removeSortOrderClass(table) {
    table.find('th').each(function () {
        $(this).removeClass('table-sort-order-asc');
        $(this).removeClass('table-sort-order-des');
    });
}

function userSelectNone(el) {
    var arr = ['webkit','o','ms'];
    for (var i=0;i<arr.length;i++) {
        el.css('-'+arr[i]+'-user-select','none');
    }
    el.css('user-select','none');
}

function formatTh(th) {
    var sortField   = $('<div class="table-sort-field"></div>');
    var sortControl = $('<div class="table-sort-control"></div>');
    var sortUp      = $('<div class="table-sort-up"></div>');
    var sortDown    = $('<div class="table-sort-down"></div>');
    var thContents  = $(th).clone().html();
    
    sortField.html(thContents);
    sortUp.appendTo(sortControl);
    sortDown.appendTo(sortControl);
    sortControl.appendTo(sortField);
    th.contents().replaceWith(sortField).end();
    
    userSelectNone(th);
}

function tableSortScanTh(table) {
    table.find('th.table-sort').each(function () {
        var th = $(this);
        formatTh(th);
        th.on('click',function () {
            var sortArr = [];
            var rowArr  = {};
            var obj     = {};
            var index   = $(this).index();
            var tr = (table.hasClass('table-sort-search')) ? table.find('tbody tr:gt(0)') : table.find('tbody tr');
            var sortOrder;
            
            // Determine Sort Order
            if ($(this).hasClass('table-sort-order-desc')) {
                sortOrder = 'asc';
            } else if ($(this).hasClass('table-sort-order-asc')) {
                sortOrder = 'des';
            } else {
                sortOrder = 'asc';
            }
            tr.each(function () {
                var text     = $(this).find('td:eq('+index+')').text()+'_'+$(this).index();
    //            rowArr[text] = [];
                sortArr.push(text);
	            rowArr[text] = this; // sends the row to rowArr instead of the html of individual cells
    /*            $(this).find('td').each(function () {
                    rowArr[text].push($(this).html());
                });*/
            });
            // Sort Array and Apply Classes
            sortArr = sortArr.sort();
            if (sortOrder === 'asc') {
                sortArr = sortArr.reverse();
                $(this).removeClass('table-sort-order-des');
            } else {
                $(this).removeClass('table-sort-order-asc');
            }
            removeSortOrderClass(table);
            $(this).addClass('table-sort-order-'+sortOrder);
            
            applySort({
                table: table, 
                tr: tr,
                sortArr: sortArr,
                rowArr: rowArr
            });
        });
    });
}

function tableSortSearchFilter(arg) {
    var tr = arg.table.find('tbody tr:gt(0)');
    var match = new RegExp(arg.searchTerm,'ig');
    tr.each(function () {
        var el = $(this);
        if (match.test(el.text())) {
            el.show();
        } else {
            el.hide();
        }
    });
}

function tableSortSearch(table) {
    if (table.hasClass('table-sort-search')) {
        var colspan     = table.find('thead th').size();
        var search      = $('<tr><td class="table-sort-search-container" colspan='+colspan+'></td></tr>');
        var searchInput = $('<input class="table-sort-search-input" type="text" placeholder="Search...">');
        search.find('td').append(searchInput);
        table.find('tbody').prepend(search);
        
        searchInput.on('keyup',function () {
            tableSortSearchFilter({table: table,searchTerm: $(this).val()});
        });
    }
}

//$(function () {
self.applyTableSort = function(selectorText) {
    $(selectorText).each(function () {
      //  tableSortSearch($(this));
        tableSortScanTh($(this));
    });
};
//});	


//return $.fn[pluginName];
return self;
}));

})( jQuery, window, document );
