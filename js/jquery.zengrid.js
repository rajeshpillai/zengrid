
// Base: V0.1

/*!
 * zengrid (jquery plugin) v0.2
 * http://tekacademy.com
 *
 * Copyright 2012, Rajesh Pillai
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://tekacademy.com/zengrid/license
 *
 * Date: Mon Jan 01 14:40 2012
 */

// AJAX TEST URL : http://jsbin.com/zengrid-data/js
// jQuery UI CSS URL: http://jsbin.com/rajesh-css-aristoui/js

$(function() {
  var $debug = $("#debug");
  
  $(window).resize(function() {
    $(".grid").each(function() {
      $(this).equalize();
    });
  });
    
  $.fn.search = function (inputVal)
  {
    
      var table = $(this);
   
    if ($.trim(inputVal) === '') {
        table.loadPage(1);
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
  };
   
  $.fn.zenGrid = function(options) {
    var settings = $.extend( {
      width : '100%',
      height : '100%',
      resizeColumns: true,
      showSearch: true,
      pager: false,
      pagerLocation: "bottom",
      pageSize: 3,
      showRowNo: false   // todo
    }, options);
    
    
    
    return this.each(function(){
      
      var $grid = $(this);
      
      $grid.addClass("grid");
      
      if($grid.parents(".gridContainer").length) {
          return $grid;
      }

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
      
      
      // extend your new options with the saved ones
      if($grid.data().page) {
              $.extend($grid.data(),options);

      // if there are no saved options - use the default
      } else {
              $.each(settings,function(property,value) {
                      // if we have a callback function, we can't store it in data
                      // it will get executed right away
                      if(typeof(value) != "function") {
                              //$.data($grid,property,value);
                              $grid.data(property,value);
                      } else {
                              // create pluginlett of custom callback
                              $.fn[property] = value;
                              //$.data($grid,property,true);
                              $grid.data(property,true);
                      }
              });
      }
      
      
      // set container width
      $grid.parent(".gridContainer").height($grid.data().height);
      $grid.parent(".gridContent").height($grid.data().height);
      
      $grid.parent(".gridContainer").width($grid.data().width);
      
      
      // add column resizer
      $grid.addColResizer();
      
      
      // equalize the columns
      $grid.equalize();
      
      $grid.addTitle();

      $grid.addSearch();
      
      $grid.addPager();
      
      
    });
  };

  $.fn.addColResizer = function() {
      var $grid = $(this);
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
                
                var newWidth = $th.width() + (e.clientX - startX);
                $th.width(newWidth); 
                $th.css ({ "width" : newWidth});
                $grid.equalize();
                startX = e.clientX;
                
              
              });
              $(document).mouseup(function(e) {
                $(document).unbind("mousemove.zengrid");
              });
          });
        }
        // set the th to auto
        //$th.width("auto");
        
        // add the resizer
        $th.append($colResizer);
        
        $colResizer.width("100%");
        $colResizer.height("100%");
       
        
      });
      
  };
  
  $.fn.addSearch = function() {
    
    var $grid = $(this);
    var $gridContainer = $grid.closest(".gridContainer");

  
    // add search bar
    if ($grid.data().showSearch) {
      $gridContainer.children(":first").append("<div class='search-bar'>Search:<input type='text' class='search-input' /></div>");
         $('input.search-input').keyup(function() {
             $grid.search($(this).val());
        });
    }
    
  };
  
  $.fn.addTitle = function() {
    var $grid = $(this);
    var $gridContainer = $grid.closest(".gridContainer");
    
    $gridContainer.prepend("<div class='title-bar'/>");
      
    var title = $grid.data().caption;
    
    if ($grid.attr("title")) {
          title = $grid.attr("title");
    }
    $(".title-bar", $gridContainer).append("<span>" + title + "</span>");
  };
  
  $.fn.addPager = function() {
    // Add pager
    var $grid = $(this);
 
    var $gridContainer = $grid.closest(".gridContainer");
    
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
          $grid.loadPage($(this).val());
      }
     });
    
    
    $("a.prev", $gridContainer).click(function(e) {
      var page = $grid.data("page");
      
      if (page !== 'undefined' && page > 1) {
        page = page - 1;
        $grid.data("page", page);
      }
      else {
        $grid.data("page", 1);
      }
      $grid.loadPage(page);
    });
    
    $("a.next", $gridContainer).click(function(e) {
      var page = $grid.data("page");
      var totalPages = $grid.data().totalPages;
      if (page !== undefined && page < totalPages) {
        page = page + 1;
        $grid.data("page", page);
      }
      else {
        $grid.data("page", page);
      }
      $grid.loadPage(page);
    });
    $grid.loadPage(1);
  };
  
 
  $.fn.loadPage = function(page) {
    
    var $grid = $(this);
    
    if (page === 'undefined') {
        $("#debug").append("..no paging");
  
      return;
    }
    
    var $gridContainer = $grid.closest(".gridContainer");
    
    var $pagerBar = $(".pager-bar", $gridContainer);
    
    var totalRows = $grid.data().totalRows;
    var pageSize = $grid.data().pageSize;
    var rows = $grid.find("tr");
    
    var startNum = (page-1) * pageSize;
    
    var $pagerInput = $(".pager-input", $pagerBar);
    
    $($pagerInput).val( page);
    
    for(var i = 0; i < rows.length; i++) {
      $(rows[i]).hide();
    }
    
    for(var j = startNum; j < startNum + pageSize; j++){
       $(rows[j]).show();
    }
    
    $grid.equalize();
  };
  
  $.fn.equalize = function() {
   
    var $firstRow = $(this).find("tr:first");
    var $gridHeader = $(this).closest(".gridContainer").find(".header"); 
    var $gridBody = $(this);
    
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
    
    // set header width based on user configuration in the html
    $gridHeader.find("th").each(function(i) {
      var $hd = $(this);
      var w = $hd.attr("data-width");
      if (w !== undefined) {
        $hd.width(w);
      }
    });
    
    
    
    // Size the body row width to header row
    //console.log("Before resizing..");
    //console.log($gridBody.find("tr:first"));
    $gridBody.find("tr:first td:visible").each(function(i) {
      //console.log("--->Resizing : " + i);
       var w =$gridHeader.find("th").eq(i).width();
       $(this).width(w);
       //$(this).css({ width: w + "px"});
    });
    
    
  };
});

$(function() {
  $(".grid1").zenGrid(
    {
      width: "300px",
      height: "120px",
      caption: "Zen Grid",
      pager: true,
      pagerLocation: 'bottom'
    }
  );
  
   $(".grid2").zenGrid(
    {
      width: "300px",
      height: "120px",
      caption: "Zen Grid",
      resizeColumns: true,
      showSearch: false
    }
  );
  
  /*
   var grid = $( "#grid3" ).zenGrid({
        source: cities.result,
        columns: [
                { property: "name", label: "Name" },
                { property: "adminName1", label: "Area" },
                { property: "adminName2", label: "Province" },
                { property: "population", label: "Population" },
                { property: "countryName", label: "Country" }
        ]
   });*/
});
