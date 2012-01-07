/*!
 * zengrid (jquery plugin) v0.3
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
    
  
  $.fn.zenGrid = function(options) {
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
    }, options);
    
    
    
    return this.each(function(){
      
      var $grid = $(this);
      
      if($grid.parents(".gridContainer").length) {
        return $grid;
      }
      
      $grid.setup(); 
      
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
      
      // setup columns
      $grid.setupColumns(settings); 
      
      // bind to source
      $grid.bindSource(settings);
      
      // add column resizer
      $grid.addColResizer();
      
      
      // equalize the columns
      $grid.equalize();
      
      $grid.addTitle();

      $grid.addSearch();
      
      $grid.addPager();
      
    });
  };

  $.fn.bindSource = function (settings)  {
    var $grid = $(this);
    var $gridHeader = $grid.closest(".gridContainer").find(".header"); 
    var $gridContainer = $grid.closest(".gridContainer");
   
    // json 
    if(typeof settings.source ==='object')
    {
      var rows = [];
      for(var i = 0; i < settings.source.length; i++){
        var obj = settings.source[i];
        for(var key in obj){
            var attrName = key;
            var attrValue = obj[key];
           $grid.append($.toTr(obj));
        }
      }
      
      $gridHeader.find("th").each(function (i) {
        var align = $(this).attr("align") || "left";
          $grid.find("tr>(th|td):nth-child("+(i+1)+")")
                 .css("text-align", align);
        
      });
    }
  };
  
  $.toTr = function (obj) {
    var tr = "<tr>";
    var tds = "";
    for(var key in obj){
        var attrName = key;
        var attrValue = obj[key];
      
     
        tds += "<td>" + attrValue + "</td>";
    }
    tr += tds;
    tr +=  "</tr>"; 
    return tr;
  };
  
  // Runtime column settings
  $.fn.setupColumns = function (settings) {
    var $grid = $(this);
    var $gridHeader = $grid.closest(".gridContainer").find(".header"); 
    var $gridContainer = $grid.closest(".gridContainer");
   
    if (settings.columns) {
      $gridHeader.append("<thead><tr></tr></thead>>");
      $.each(settings.columns, function (fieldName, val) {
          //console.log("Field : " + fieldName + "=>" + val.property);
        
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
  };
  
  $.fn.setup = function () {
    var $grid = $(this);
      
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
    $grid.parent(".gridContainer").height($grid.data().height);
    $grid.parent(".gridContent").height($grid.data().height);
    
    $grid.parent(".gridContainer").width($grid.data().width);
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
        
        // add the resizer
        $th.append($colResizer);
        
        $colResizer.width("100%");
        $colResizer.height("100%");
       
        
      });
      
  };
  
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
   
  
  $.fn.addSearch = function() {
    
    var $grid = $(this);
    var $gridContainer = $grid.closest(".gridContainer");

 
    // add search bar
    if ($grid.data().allowSearch) {
      $gridContainer.children(":first").prepend("<div class='search-bar'>Search:<input type='text' class='search-input' /></div>");
         $('input.search-input').keyup(function() {
             $grid.search($(this).val());
        });
    }
    
  };
  
  $.fn.addTitle = function() {
    var $grid = $(this);
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
    
    // set header attributes based on user configuration in the html
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
    $gridBody.find("tr td:visible").each(function(i) {
       var $th = $gridHeader.find("th").eq(i);
       var w = $th.width();
       $(this).width(w);
       $(this).css({ width: w + "px"});
       
       
    });
    
    $gridHeader.find("th").each(function(i) {
      var align = $(this).attr("data-align") || "left";
      $gridBody.find("tr>(th|td):nth-child("+(i+1)+")")
                 .css("text-align", align);
      
    });
      
  };
});

$(function() {
  $(".grid1").zenGrid(
    {
      width: "300px",
      height: "120px",
      caption: "Hello Zen Grid",
      pager: true,
      pagerLocation: 'bottom',
      allowAdd: true,
      allowSearch:true
    }
  );
  
   $(".grid2").zenGrid(
    {
      width: "300px",
      height: "120px",
      caption: "Zen Grid",
      resizeColumns: true,
      allowSearch: false
    }
  );
  
  
   var grid = $( "#grid3" ).zenGrid({
        source: cities.result,
        columns: [
          { property: "city", label: "City", align:'left' },
          { property: "population", label: "Population", align:"right" },
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
