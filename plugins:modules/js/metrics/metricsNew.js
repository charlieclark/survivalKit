var METRICS = new metricClass();

function metricClass(){

  var self = this;

  var categoryNum = null;
  var categoryName = null;
  var uniqueArray = [];

  var tagArray = {


    "existingPageView":{
      category: "view",
      action: "load",
      label: "existing page view"
    },

    "globalShare":{
      category: "global share",
      action: "click",
      label: "main share btn"
    },


    "fbookClick":{
      category: "fbook share",
      action: "click",
      label : "facebook share"
    },

    "twitterClick":{
      category: "twitter share",
      action: "click",
      label : "twitter share"
    },

    "makeYours":{
      category: "makeYours",
      action: "click",
      label: "make yours"
    },

    "imageDropped":{
      category: "imageLoaded",
      action: "drop",
      label: "image loaded"
    }

  }


  self.trigger = function( tag , value){

    var data = tagArray[tag];
    var label = data.label;

    if(value)
    {
      label += value;
    }

    console.log("metrics :: " ,  data.category , data.action , label )
   
    ga('send' , 'event' ,  data.category , data.action , label  );
  }

  
}