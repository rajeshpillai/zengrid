
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
          console.log(index);
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
      height : '120px',
      resizeColumns: true,
      showSearch: true
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
      
      // set container width
      $grid.parent(".gridContainer").height(settings.height);
      $grid.parent(".gridContent").height(settings.height);
      
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
        if (settings.resizeColumns) {
          $colHandle.mousedown(function(e) {
              var startX = e.clientX;
              $(document).bind("mousemove.zengrid", function(e) {
                 $th.width($th.width() + (e.clientX - startX)); 
                 startX = e.clientX;
                 $grid.equalize();
                
              });
              $(document).mouseup(function(e) {
                $(document).unbind("mousemove.zengrid");
              });
          });
        }
        $th.append($colResizer);
        
      });
      
      
      // equalize the columns
      $grid.equalize();
      
      // Add the title bar
      $gridContainer.prepend("<div class='title-bar'/>");
      
      var title = settings.caption;
      
      if ($grid.attr("title")) {
            title = $grid.attr("title");
      }
      $(".title-bar", $gridContainer).text(title);
      
      // add search bar
      if (settings.showSearch) {
        $gridContainer.children(":first").append("<div class='search-bar'>Search:<input type='text' class='search-input' /></div>");
           $('input.search-input').keyup(function() {
               $grid.search($(this).val());
          });
      }
      
      $grid.pager();
      
      $grid.loadPage(1);
      
    });
  };

  $.fn.pager = function() {
    // Add pager
    var $grid = $(this);
    var $gridContainer = $grid.closest(".gridContainer");
    
    $grid.data("page",1);
    $grid.data("pageSize",2);
    $grid.data("totalRows", $grid.find("tr").length);
    $grid.data("totalPages", $grid.data().totalRows / $grid.data().pageSize);
    $gridContainer.append("<div class='pager-bar'/>");
    
    $(".pager-bar",$gridContainer).append("<a class='prev' href='#'>Prev</a>");
    $(".pager-bar",$gridContainer).append("<a class='next' href='#'>Next</a>");
    
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
  };
  
 
  $.fn.loadPage = function(page) {
    var $grid = $(this);
    var totalRows = $grid.data().totalRows;
    var pageSize = $grid.data().pageSize;
    var rows = $grid.find("tr");
    
    var startNum = (page-1) * pageSize;
    
    for(var i = 0; i < rows.length; i++) {
      $(rows[i]).hide();
    }
    
    for(var j = startNum; j < startNum + pageSize; j++){
       $(rows[j]).show();
    }
    
  };
  
  $.fn.equalize = function() {
   
    var $firstRow = $(this).first("tr");
    var $gridHeader = $(this).closest(".gridContainer").find(".header"); 
    var $gridBody = $(this);
    
    // if there is a scrollbar account for it
    if(($gridBody.height() > $gridBody.parents(".gridContent").height())) {
        $gridHeader.find(".scroll").remove();
        var $newTh = $("<th></th>").addClass("scroll").css({
                padding:0,
                margin:0,
                width:15
        });
        $gridHeader.find("tr:first").append($newTh);
    } 
    else if ($gridBody.parents(".gridWrapper").height() > $gridBody.height()) 
    {
        $(".scroll").remove();
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
    $gridBody.find("tr:first td:visible").each(function(i) {
      
       $(this).width($gridHeader.find("th").eq(i).width());
    });
  };
});

$(function() {
  $(".grid1").zenGrid(
    {
      width: "300px",
      height: "120px",
      caption: "Zen Grid"
    }
  );
  
   $(".grid2").zenGrid(
    {
      width: "300px",
      height: "120px",
      caption: "Zen Grid",
      resizeColumns: false,
      showSearch: false
    }
  );
});
