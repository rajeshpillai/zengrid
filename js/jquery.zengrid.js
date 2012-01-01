
$(function() {
  var $debug = $("#debug");
  $.fn.zenGrid = function(options) {
    var settings = $.extend( {
      'width' : '100%',
      'height' : '120px'
    }, options);
    
    return this.each(function(){
      
      var $grid = $(this);

      // wrap the main grid
      $grid.wrap("<div class='gridContainer'/>");
      
      var $thead = $grid.find("thead").clone();
      
      // remove the header from the original grid
      $("thead", $grid).remove();
      
      // prepend a gridHeader before the main table
      $(".gridContainer").prepend("<div class='gridHeader'/>");
      
      $(".gridHeader").append("<table class='header'/>");
     
      
      // Add the thead to the grid header table
      $(".header").html($thead);
      
      // wrap the main grid in its own container.
      $(".grid").wrap("<div class='gridContent'/>");
      
      // set container width
      $(".gridContainer").width(settings.width);
      //$(".gridContent").width(settings.width);
      //$(".gridHeader").width(settings.width);
      
      $(".gridContainer").height(settings.height);
      $(".gridContent").height(settings.height);
      
      var $gridHeader = $(".header");
      var $gridBody = $(".grid");
      var $gridContainer = $(".gridContainer");
      
      // wrap each th text in div
      $gridHeader.find("th").each(function(i) {
        var text = $(this).text();
        $(this).html("<div class=''>" + text + "</div>");
      });
      
      
      // equalize the columns
      $gridBody.equalize();
      
      // Add the title bar
      $gridContainer.prepend("<div class='title-bar'/>");
      $(".title-bar").text(settings.caption);
      
    });
  };
  
  $.fn.equalize = function() {
   // Get the first row in the grid
    var $firstRow = $(this).first("tr");
    var $gridHeader = $(".header"); 
    var $gridBody = $(this);
    
    // if there is a scrollbar account for it
    if(($gridBody.height() > $gridBody.parents(".gridContent").height())) {
        $gridHeader.find(".scrollTh").remove();
        var $newTh = $("<th></th>").addClass("scrollTh").css({
                padding:0,
                margin:0,
                width:15
        });
        $gridHeader.find("tr:first").append($newTh);
    } 
    else if ($gridBody.parents(".gridWrapper").height() > $gridBody.height()) 
    {
        $(".scrollTh").remove();
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
  $(".grid").zenGrid(
    {
      width: "300px",
      height: "120px",
      caption: "Zen Grid"
    }
  );
});

