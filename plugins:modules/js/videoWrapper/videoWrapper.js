function videoWrapperClass( _videoConfig , _videoOptions ,  _sequenceConfig , _useSequence ){
    var self = this;

    var myPlayer = null;
    
    function init(){


      if(!_useSequence)
      {
        myPlayer =  new videoPlayerClass( _videoConfig ,_videoOptions );
      }
      else
      { 
         
        myPlayer =  new sequencerClass( _sequenceConfig );
        PRELOAD.loadGroupWithID( _sequenceConfig.assetName , function( theImages ){ myPlayer.init( theImages ); } , "array");

      }
      
    }

    init();
    return myPlayer;

}
