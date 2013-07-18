var YOUTUBE = new youtubeClass();

//called by youtube api
function onYouTubeIframeAPIReady() {
  YOUTUBE.youTubeReady();
}

function youtubeClass() {

  var self = this;

  //player obj
  // var player = true;

  //progress
  // var progressTimer = null;
  // var curProgLevel = 0;

  //other vars
  var youTubeReady = false;
  var videoArray = null;

  self.init = function(_videoArray) {

    videoArray = _videoArray;
    initYTPLayer();

    $('.yt-video-player').click(function() {
      createVideoPlayer($(this).index('.yt-video-player'), $(this));
    });
  };

  //youtube stuff
  function initYTPLayer() {

    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  }

  self.initPlayer = function(index) {
  };

  self.youTubeReady = function() {
    console.log('getting here');
    youTubeReady = true;
    // createVideoPlayers();
  };

  function createVideoPlayer(index ,  parent) {
    $(parent).append($('<div>', {
      'id' : 'yt-video-container' + index,
      'class' : 'yt-video-container'
    }));


    var tempPlayer = new YT.Player('yt-video-container' + index, {
      // height: '100%',
      // width: '100%',
      playerVars: {
        'modestbranding': 1,
        'rel': 0,
        'showinfo': 0,
        'frameborder': 0},
      videoId: videoArray[index].id,
      events: {
        'onReady': onPlayerReady,
        'onStateChange': onPlayerStateChange,
        'onEnded' : onEnded
      }
    });

    console.log(tempPlayer);
  }

  //player events

  function onPlayerReady(event) {
    event.target.playVideo();
  }

  function onEnded(event) {
  }

  function onPlayerStateChange(event) {
  }

  function playVideo(url) {
    videoStopped = false;
    player.loadVideoById(url);
    player.playVideo();
    initProgress();
  }

  function stopVideo() {
    videoStopped = true;
    curProgLevel = 0;
    clearInterval(progressTimer);
    player.pauseVideo();
  }


  // function initProgress() {
  //  if(progressTimer)
  //    clearInterval(progressTimer);

  //  var progressIncArray = [.25 , .50 , .75 , .99]

  //  progressTimer = setInterval(function() {


  //    if(length != 0)
  //    {
  //      var ratio = player.getCurrentTime() / length;
  //      var highestRatio = null;

  //      for(var i = 0 ; i < progressIncArray.length ; i++)
  //      {
  //        var curInc = progressIncArray[i];
  //        if (ratio > curInc)
  //        {
  //          highestRatio = curInc
  //        }
  //      }

  //      if(highestRatio > curProgLevel)
  //      {
  //        curProgLevel = highestRatio;

  //        var correctedRatio = !!(curProgLevel == .99)? 1 : curProgLevel;

  //        console.log(correctedRatio);
  //      }
  //    }

  //  } , 100)
  // }

  //        console.log(correctedRatio);
  //      }
  //    }

  //  }, 100)
  // }

}
