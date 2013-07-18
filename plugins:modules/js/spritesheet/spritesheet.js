function spriteSheetLogic(numRows , numColumns , boxW , boxH , numImages , ssImg , destW , destH){
  
  var self = this;
  var canvasArray = [];
 

  function init(){
    //console.log(ssImg)
    generateCanvases();
    //console.log(canvasArray)
  }

  self.getBoxWithRatio = function(ratio){

    var curIndex = Math.floor( ratio * numImages );
    // return getBox(curIndex)
    // return canvasArray[curIndex];

  }

  self.getCanvasArray = function(){ return canvasArray }

  function getBox(index){

    for( var i = 0 ; i < numRows ; i++ )
    {
      for( var j = 0 ; j < numColumns ; j++)
      {
        var tempIndex = numColumns * i + j;

        if( tempIndex == index)
        {
          return( { "x" : j * boxW , "y" : i * boxH , "w" : boxW , "h" : boxH  } )
        }
      }
    }
  }

  function generateCanvases(){

    if(!PIXI)
      return
    
    for( var i = 0 ; i< numImages ; i++)
    {
      var dim = getBox(i);

      var tempCanvas = generateCanvas(dim , i);

      var tempTexture = PIXI.Texture.fromCanvas( tempCanvas );
      canvasArray.push( tempTexture )

    }
  }

  function generateCanvas(dim , index){

    if(!ssImg)
      return;

    console.log( index );

    var tempC = document.createElement('canvas');
    var tempCtx = tempC.getContext("2d");

    tempC.width = tempCtx.width = destW;
    tempC.height = tempCtx.height = destH;
    
    tempCtx.drawImage( ssImg , dim.x , dim.y , dim.w , dim.h , 0  , 0 , destW , destH);

    return tempC;
  }


  init();
}