var METRICS = new metricClass();

function metricClass(){

  var self = this;

  var categoryNum = null;
  var categoryName = null;
  var uniqueArray = [];


  var curPageName = null;

  self.pageNameUpdate = function(pageName , pageType){

    switch(pageType){
      case "gif-type":
      {
        curPageName = pageName;

        if(curPageName.indexOf("audioTip") >= 0)
        {
          curPageName = "audio_tips"
        }

        break;
      }
      case "splash-type":
      {
        curPageName = "gotivation_station";
        break;
      }
      case "googleMap-type":
      {
        curPageName = "park_mapper";
        break;
      }
      case "rollercoasterVideo-type":
      {
        curPageName = "rollercoaster_thrills";
        break;
      }
      case "liftGame-type":
      {
        curPageName = "open_your_eyes";
        break;
      }
      case "pageTurn-type":
      {
        curPageName = "read_up";
        break;
      }
      case "shootGame-type":
      {
        curPageName = "shoot_for_the_moon";
        break;
      }
      //phase2
      case "fireworks-type":
      {
        curPageName = "name_in_lights";
        break;
      }
      case "selfTalk-type":
      {
        curPageName = "pep_talk";
        break;
      }
      case "visualizeWin-type":
      {
        curPageName = "visualize_the_win";
        break;
      }
      case "energyGuru-type":
      {
        curPageName = "energy_guru";
        break;
      }
      case "personalGotivator-type":
      {
        curPageName = "call_the_nut";
        break;
      }
    

    }

    //console.log("METRICS :: cur page name updated" , curPageName)

  }



  self.trigger = function( type ,  argumentArray , dontUsePage ){

    var gaType = null;

    if( type == "event")
      gaType = "_trackEvent";
    else if(type == "social")
      gaType = "_trackSocial";
    else if(type == "load")
    {
      triggerPageLoad(argumentArray[0]);
      return;
    }
    
    if(!dontUsePage)
      argumentArray.push( curPageName )

    if(!gaType)
    {
      //console.log("incorrect type");
    }
    else
    {
      GATrigger(gaType , argumentArray);
    }

    
    
  }

  self.triggerPageView = function(){
    _gaq.push(['_trackPageview', location.pathname + location.hash]);
  }

  function triggerPageLoad(argument){
    _gaq.push(['_set' , 'page' , argument]);
    _gaq.push(['_trackPageview']);

    //console.log("METRICS :: page load" , argument);
  }

  function GATrigger(type , argumentArray){

    var pushArray = [];

    pushArray.push(type);

    for( var i = 0 ; i < argumentArray.length ; i++)
    {

      var arg = argumentArray[i];

      pushArray.push(arg);
    }

   console.log("METRICS :: " + pushArray);

    _gaq.push(pushArray);

  }


   

  
}