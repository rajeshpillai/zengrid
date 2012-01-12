
// Base: V0.1

/*!
 * zengrid (jquery plugin) v0.1
 * http://tekacademy.com
 *
 * Copyright 2012, Rajesh Pillai
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://tekacademy.com/zengrid/license
 *
 * Date: Mon Jan 01 14:40 2012
 */
// BASE VERSION: http://jsbin.com/rajesh-zengrid/latest/edit
// AJAX TEST URL : http://jsbin.com/zengrid-data/js
// jQuery UI CSS URL: http://jsbin.com/rajesh-css-aristoui/js
// json parse e.f.http://jsbin.com/rajesh-json-parse/latest/edit
// todo: Edit/save, smooth resizing of columns

;$(function() {
  $.widget( "rp.zenGrid", {
	_create: function() {
      var settings = $.extend( {
        width : '100%',
        height : '100%',
        resizeColumns: true,
        allowSearch: false,
        allowDelete:true,
        pager: false,
        pagerLocation: "bottom",
        pageSize: 3,
        showRowNumber: false   // todo
      }, this.options);
      
      this._buildData(settings);
      this._setup();
      this._setupColumns();
      this._bindSource();
      this._addColResizer();
      this._addTitle();
      this._addSearch();
      this._addPager();
      this._showRowNumber();
      this._allowSorting();
      this.equalize();
    },
    
    // begin equalize
    equalize: function() {
		console.log('equa');
        var $gridBody = $(this.element);
       
        var $gridHeader = $gridBody.closest(".gridContainer").find(".header"); 
        var $firstRow = $gridBody.find("tr:first");
        
        // if there is a scrollbar account for it
        if(($gridBody.height() > $gridBody.parents(".gridContent").height())) {
          $gridHeader.find(".scroll").remove();
            var $newTh = $("<th></th>").addClass("scroll").css({
                    padding:0,
                    margin:0,
                    width:"16px"
            });
            $gridHeader.find("tr:first").append($newTh);
        } 
        else if ($gridBody.parents(".gridContainer").height() > $gridBody.height()) 
        {
            $(".scroll", $gridHeader).remove();
        }
        
        // set header attributes based on user configuration in the html
        $gridHeader.find("th").each(function(i) {
          var $hd = $(this);
          var w = $hd.attr("data-width");
          if (w !== undefined) {
            $hd.width(w);
          }
        });
        
        
        // Size the body row width to header row
        $gridBody.find("tr td:visible").each(function(i) {
           var $th = $gridHeader.find("th").eq(i);
           var w = $th.width();
           $(this).width(w);
           $(this).css({ width: w + "px"});
           
           
        });
        
       // size the first row to the headers
        $gridBody.find("tr:visible:first td:visible").each(function(i) {
          var $colResizer = $gridHeader.find(".col-resizer").eq(i);
          //var pLeft = parseInt($colResizer.parents("th").css("padding-left"));
          //var pRight = parseInt($colResizer.parents("th").css("padding-left"));
      
          $colResizer.width($(this).width());
         
        });
    
        
        $gridHeader.find("th").each(function(i) {
          var align = $(this).attr("data-align") || "left";
          $gridBody.find("tr>(th|td):nth-child("+(i+1)+")")
                     .css("text-align", align);
          
        });
        
      },
      // end equalize
      toTr :function (obj) {
        var tr = "<tr>";
        var tds = "";
        for(var key in obj){
            var attrName = key;
            var attrValue = obj[key];
            //console.log(attrName);
            tds += "<td data-col='" + attrName + "'>" + attrValue + "</td>"; 
        }
        tr += tds;
        tr +=  "</tr>";  
        return tr;
      },
  
    
    
    getPager: function() {
      return $(this.element).parents(".gridContainer").find(".pager-bar");
    },
    
    _buildData: function(settings) {
      var $this = $(this.element);
       $.each(settings,function(property,value) {
          // if we have a callback function, we can't store it in data
          // it will get executed right away
          if(typeof(value) != "function") {
                  $this.data(property,value);
          } else {
                  // create pluginlett of custom callback
                  $.fn[property] = value;
                  //$.data($grid,property,true);
                  $this.data(property,true);
          }
      });
    },
    
    // begin setup
    _setup: function () {
        var $grid = $(this.element);
          
        $grid.addClass("grid");
        
        // wrap the main grid
        $grid.wrap("<div class='gridContainer'/>");
        
        var $thead = $grid.find("thead").clone();
        
        // remove the header from the original grid
        $("thead",$grid).remove();
        
        // prepend a gridHeader before the main table
        $grid.closest(".gridContainer").prepend("<div class='gridHeader'/>");
        
        $(".gridHeader", $grid.closest(".gridContainer")).append("<table class='header'/>");
        
        // Add the thead to the grid header table
        //$(".header").html($thead);
        $grid.closest(".gridContainer").find(".header").html($thead);
        
        // wrap the main grid in its own container.
        $grid.wrap("<div class='gridContent'/>");
        
        // set container width
        $grid.closest(".gridContainer").height($grid.data().height);
        $grid.closest(".gridContent").height($grid.data().height);
        
        $grid.closest(".gridContainer").width($grid.data().width);
        
    },
    // end setup
    // begin bindSource
    _bindSource :function ()  {
      var $grid = $(this.element);
      var $gridHeader = $grid.closest(".gridContainer").find(".header"); 
      var $gridContainer = $grid.closest(".gridContainer");
     
      //alert(typeof $grid.data().source);
      // json 
      if(typeof $grid.data().source ==='object')
      {
      
        var rows = [];
        for(var i = 0; i < $grid.data().source.length; i++){
          var obj = $grid.data().source[i];
          $grid.append(this.toTr(obj)); 
          
        }
        
        $gridHeader.find("th").each(function (i) {
          var align = $(this).attr("align") || "left";
            $grid.find("tr>(th|td):nth-child("+(i+1)+")")
                   .css("text-align", align);
          
        });
        this.equalize();
      }
    },
    // end bindSource
    
    // begin setupcolumns
    _setupColumns : function () {
        var $grid = $(this.element);
        var $gridHeader = $grid.closest(".gridContainer").find(".header"); 
        var $gridContainer = $grid.closest(".gridContainer");
       
        if ($grid.data().columns) {
          $gridHeader.append("<thead><tr></tr></thead>>");
          $.each($grid.data().columns, function (index, val) {
            var th = "<th ";
            th += "data-col='" + val.property + "' ";
            var align = val.align || "left";   
            th += "data-align='" + align + "'";
            th += ">";
            th += val.label;
            th += "</th>";
            
            $gridHeader.find("thead tr").append(th);
          });
          
        } 
        if ($grid.data().showRowNumber) { 
            var rowTh = "<th class='grid-rowno'>#</th>";
            $gridHeader.find("thead tr").prepend(rowTh);
          }
      },
    // end setupcolumns
    
    // begin addColResizer
    _addColResizer : function() {
		var me = this;
        var $grid = $(this.element);
        var $gridHeader = $grid.closest(".gridContainer").find(".header"); 
        var $gridContainer = $grid.closest(".gridContainer");
        
        // wrap each th text in div
        $gridHeader.find("th").each(function(i) {
         var $th = $(this);
          var text = $(this).text();
          $th.html("");
          
          var $colHandle = $("<div class='col-handle'></div>");
          $colHandle.height($th.outerHeight());
          var $colResizer = $("<div class='col-resizer'></div>").html(text).append($colHandle);
          if ($grid.data().resizeColumns) {
            $colHandle.mousedown(function(e) {
			    var startX = e.clientX;
                $(document).bind("mousemove.zengrid", function(e) {
                  var $div = $th.find(".col-resizer");
                  
                  //var newWidth = $th.width() + (e.clientX - startX);
                  var newWidth = $div.width() + (e.clientX - startX);
                  
                  //$th.width(newWidth); 
                  $div.width(newWidth);
                  
                  var currentIndex = $th.prevAll().length;
                  // set the width of the td
                  $grid.find("tr:first td").eq(currentIndex).width(newWidth);
                  
                  me.equalize();
                  startX = e.clientX;
                  $th.width(newWidth);
                  
                
                });
                $(document).mouseup(function(e) {
                  $(document).unbind("mousemove.zengrid");
                });
            });
          }
          
          // now set the th to auto
          $th.width("auto");
          // add the resizer
          $th.append($colResizer);
          
          $colResizer.width("100%");
          $colResizer.height("100%");
        });
      },
      // end addColResizer
      
      //begin addtitle
    _addTitle: function() {
          var $grid = $(this.element);
          var $gridContainer = $grid.closest(".gridContainer");
          
            
          var title = $grid.data().caption;
          
          if ($grid.attr("title")) {
                title = $grid.attr("title");
          }
          
          if ($.trim(title) === '' || title === 'undefined' || title === null) {
              return;
          }
         
          $gridContainer.prepend("<div class='title-bar'/>");
         
          $(".title-bar", $gridContainer).append("<span>" + title + "</span>");
        },
        
        //end addtitle
        
        // begin addPager
        _addPager: function() {
          // Add pager
          var $grid = $(this.element);
		  var me = this;
		  
          var $gridContainer = $grid.closest(".gridContainer");
          
          var $pager = this.getPager(); // todo
      
          
          if (!$grid.data().pager) {
              return;
          }
          
          $grid.data("page",1);
          $grid.data("totalRows", $grid.find("tr").length);
          $grid.data("totalPages", $grid.data().totalRows / $grid.data().pageSize);
          
          var $pagerBar = null;
          
          if ($grid.data().pagerLocation === 'top') {
            $gridContainer.find(".title-bar").after("<div class='pager-bar'/>");
            $pagerBar = $(".pager-bar", $gridContainer);
            $pagerBar.prepend("<a class='next' href='#'>Next</a>");
            $pagerBar.prepend("<a class='prev' href='#'>Prev</a>");
            
            $pagerBar.append("<span class='pager-status'>Page 1 of 3</span>");
            
          }
          else {
            $gridContainer.append("<div class='pager-bar'/>");
            $pagerBar = $(".pager-bar", $gridContainer);
            
            $pagerBar.append("<a class='prev' href='#'>Prev</a>");
            $pagerBar.append("<a class='next' href='#'>Next</a>");
            $pagerBar.append("<span class='pager-status'>Page 1 of 3</span>");
            
          }
          $(".pager-status", $pagerBar).html("Page <input type='text' value='1' class='pager-input'/> of " + Math.ceil($grid.data().totalPages));
          
          var $pagerInput = $(".pager-input", $pagerBar);
          $pagerInput.keypress(function(e) {
            var keyCode = e.which;
            if (keyCode === 13) {
                me.loadPage($(this).val());
            }
           });
          
         
          $($gridContainer).delegate("a.prev", "click",function(e) {
            var page = $grid.data("page");
            
            if (page !== 'undefined' && page > 1) {
              page = page - 1;
              $grid.data("page", page);
            }
            else {
              $grid.data("page", 1);
            }
            me.loadPage(page);
          });
          
          $($gridContainer).delegate("a.next", "click",function(e) {
            var page = $grid.data("page");
            var totalPages = $grid.data().totalPages;
            if (page !== undefined && page < totalPages) {
              page = page + 1;
              $grid.data("page", page);
            }
            else {
              $grid.data("page", page);
            }
            me.loadPage(page);
          });
          me.loadPage(1);
        },
        // end addPaging
        
        // begin showRowNumber
        _showRowNumber :function () {
            var $grid = $(this.element);
            var $gridHeader = $grid.closest(".gridContainer").find(".header"); 
            var $gridContainer = $grid.closest(".gridContainer");
        
            if (!$grid.data().showRowNumber) {
              return;
            }
            
            $grid.find("tr").each(function (i) {
               var row = i + 1;
               $(this).prepend("<td class='grid-auto-no'>" + row + "</td>");
            });
            
          },
        // end showRowNumber
    
        // begin allowSorting
        _allowSorting : function () {
          var $grid = $(this.element);
          var $gridHeader = $grid.closest(".gridContainer").find(".header"); 
          var $gridContainer = $grid.closest(".gridContainer");
      
          $gridHeader.find("th").each(function(column) {
             var $th = $(this);
             $th.click(function (e) {
               var $rows = $grid.find('tbody tr').get();
               var sortDirection = $th.is('.sorted-asc') ? -1 : 1;
      
               $rows.sort(function (a, b) {
                  var keyA = $(a).children('td').eq(column).text().toUpperCase();
                  var keyB = $(b).children('td').eq(column).text().toUpperCase();
         
                  if (keyA < keyB) return -sortDirection;
          
                  if (keyA > keyB) return sortDirection;
          
                  return 0;
                });
                //identify the column sort order  
                $th.removeClass('sorted-asc sorted-desc');
                var $sortHead = $th.filter(':nth-child(' + (column + 1) + ')');
                sortDirection == 1 ? $sortHead.addClass('sorted-asc') : $sortHead.addClass('sorted-desc');
                $grid.append($rows);
             });
             
          });
        },
        // end allowSorting
        
        
        // begin addSearch
      _addSearch: function() {
		var me = this;
        var $grid = $(this.element);
        var $gridContainer = $grid.closest(".gridContainer");
    
     
        // add search bar
        if ($grid.data().allowSearch) {
          $gridContainer.children(":first")
                      .prepend("<div class='search-bar'>Search:<input type='text' class='search-input' /></div>");
             $('input.search-input').keyup(function() {
                 me.search($(this).val());
            });
        }
      },
        // end addSearch
        
      // begin search()
     search: function(inputVal) {
          var table = $(this.element);
		  var me = this;
		  
          if ($.trim(inputVal) === '') {
              this.loadPage();
              return;
            }
          
            table.find('tr').each(function(index, row)
            {
                var allCells = $(row).find('td');
                if(allCells.length > 0)
                {
                    var found = false;
                    allCells.each(function(index, td)
                    {
                        var regExp = new RegExp(inputVal, 'i');
                        if(regExp.test($(td).text()))
                        {
                            found = true;
                            return false;
                        }
                    });
                    if(found === true)$(row).show();else $(row).hide();
                }
            });
        },
      // end search()
      
      // begin loadPage
      loadPage: function (page) {
          var $grid = $(this.element);
    
			if (page === undefined) {
					$grid.find("tr").show();
					this.equalize();
					return;
			}
			
			var $gridContainer = $grid.closest(".gridContainer");
			
			var $pagerBar = $(".pager-bar", $gridContainer);
			
			var totalRows = $grid.data().totalRows;
			var pageSize = $grid.data().pageSize;
			var rows = $grid.find("tr");
			
			var startNum = (page-1) * pageSize;
			
			var $pagerInput = $(".pager-input", $pagerBar);
			
			$pagerInput.val( page);
			
			rows.hide();
			/*for(var i = 0; i < rows.length; i++) {
			  $(rows[i]).hide();
			}*/
			
			for(var j = startNum; j < startNum + pageSize; j++){
			   $(rows[j]).show();
			}
			
			this.equalize();
      }
      // end loadPage
    });
});

$(function() {
  var $debug = $("#debug");
  
  $(window).resize(function() {
    $(".grid").each(function() {
      $(this).zenGrid.equalize();
    });
  });
 
});

$(function() {
  $(".grid1").zenGrid(
    {
      width: "600px",
      caption: "Hello Zen Grid",
      pager: true,
      pagerLocation: 'bottom',
      allowSearch:true,
      showRowNumber:true
    }
  );
  
   $(".grid2").zenGrid(
    {
      width: "600px",
      height: "120px",
      caption: "Zen Grid",
      resizeColumns: true,
      allowSearch: false
      
    }
  );
  
  
   var grid = $( "#grid3" ).zenGrid({
     width: "600px",
     showRowNumber: true,
        source: cities.result,
        columns: [
          { property: "city", label: "City", align:'left', editable: 'text' },
          { property: "population", label: "Population", editable:'text', align:"right" },
                { property: "country", label: "Country" }
        ]
   });
});

var cities = {
  result: [
    {
      "city": "Mumbai",
      "population": 100000000,
      "country" : "India"
    },
    {
      "city": "Bangalore",
      "population": 50000000,
      "country" : "India"
    }

  ]
};
