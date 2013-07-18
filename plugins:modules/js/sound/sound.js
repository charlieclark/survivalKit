var SOUND = new Sound();

function Sound(){

	var self = this;

	var soundPath ;

	//debugging

	var isSoundOn = true;

	var currentSound = null;

	var soundObjArray = {};

	var muteSound = true;

	var lastSound = null;


	var soundArray = [ 


	//loops
		{
			"tag" : "intro-drums",
			"urlBase" : "loops/intro-with-drums",
			"loops" : true,
			"volume" : 20,
			"family" : "intro"
		},
	//ui
		{
			"tag" : "go-click",
			"urlBase" : "ui/go-click",
			"loops" : false,
			"volume" : 50,
			"desktopOnly" : true,
			"family" : "UI"
		},
		{
			"tag" : "go-hover",
			"urlBase" : "ui/go-hover",
			"loops" : false,
			"volume" : 50,
			"desktopOnly" : true,
			"family" : "UI"
		},
		{
			"tag" : "social-click",
			"urlBase" : "ui/social-click",
			"loops" : false,
			"volume" : 50,
			"desktopOnly" : true,
			"family" : "UI"
		},
		{
			"tag" : "social-hover",
			"urlBase" : "ui/social-hover",
			"loops" : false,
			"volume" : 50,
			"desktopOnly" : true,
			"family" : "UI"
		},
		//in game sounds
		//open
		{
			"tag" : "open",
			"urlBase" : "loops/open",
			"loops" : true,
			"volume" : 20,
			"family" : "lift"
		},
		{
			"tag" : "open-win",
			"urlBase" : "misc/open-win",
			"loops" : false,
			"volume" : 50,
			"desktopOnly" : true,
			"family" : "lift"
		},
		{
			"tag" : "open-lose",
			"urlBase" : "misc/open-lose",
			"loops" : false,
			"volume" : 50,
			"desktopOnly" : true,
			"family" : "lift"
		},
		//shoot
		{
			"tag" : "shoot",
			"urlBase" : "loops/shoot",
			"loops" : true,
			"volume" : 10,
			"family" : "shoot"
		},
		{
			"tag" : "shoot-flying",
			"urlBase" : "misc/shoot-flying",
			"loops" : false,
			"volume" : 50,
			"desktopOnly" : true,
			"family" : "shoot"
		},
		{
			"tag" : "shoot-release",
			"urlBase" : "misc/shoot-release",
			"loops" : false,
			"volume" : 50,
			"desktopOnly" : true,
			"family" : "shoot"
		},
		//personal gotivator
		{
			"tag" : "personal-gotivation-voicemail",
			"urlBase" : "misc/selfTalk-voicemail",
			"loops" : false,
			"volume" : 90,
			"family" : "gotivator"
		},
		{
			"tag" : "personal-gotivation-ring",
			"urlBase" : "misc/selfTalk-ring",
			"loops" : false,
			"volume" : 70,
			"family" : "gotivator"
		},

		//ios silence
		{
			"tag" : "silence",
			"urlBase" : "misc/silence",
			"loops" : false,
			"volume" : 0,
			"family" : "ios"
		},


		//other modules

		{
			"tag" : "hike",
			"urlBase" : "loops/hike",
			"loops" : true,
			"volume" : 50,
			"family" : "hike"
		},
		{
			"tag" : "read",
			"urlBase" : "loops/read",
			"loops" : true,
			"volume" : 50,
			"family" : "read"
		},
		{
			"tag" : "coaster1",
			"urlBase" : "loops/coaster1",
			"loops" : true,
			"volume" : 10,
			"noIpad" : true,
			"family" : "coaster1"
		},
		{
			"tag" : "coaster2",
			"urlBase" : "loops/coaster2",
			"loops" : true,
			"volume" : 10,
			"noIpad" : true,
			"family" : "coaster2"
		},
		{
			"tag" : "self-talk",
			"urlBase" : "loops/coaster2",
			"loops" : true,
			"volume" : 10,
			"noIpad" : true,
			"family" : "self-talk"
		},
		{
			"tag" : "energy-guru",
			"urlBase" : "loops/guru",
			"loops" : true,
			"volume" : 10,
			"noIpad" : true,
			"family" : "energy-guru"
		},
		{
			"tag" : "visualize-win",
			"urlBase" : "loops/coaster2",
			"loops" : true,
			"volume" : 10,
			"noIpad" : true,
			"family" : "visualize-win"
		}		

	];

	//quee
	var queuedSound = null;
	var touchSound = false;

	var queuedFamilies = [];
	var readyToLoad = false;


	self.init = function(){

		if(DETECTION.isIpad || DETECTION.isIphone || DETECTION.isAndroid)
		{
			touchSound = true;
		}

		var prefFlash = false;
		if(DETECTION.browser == "Explorer")
		{
			prefFlash = true;
		}

		soundPath = CONFIG.mediaPath + "/audio/";

		soundManager.setup({
			  url: CONFIG.assetPath + "/js/libs/sm-flash/",
			  flashVersion: 9, // optional: shiny features (default = 8)
			  // optional: ignore Flash where possible, use 100% HTML5 mode
			  preferFlash: prefFlash,
			  onready: function() {

			    readyToLoad = true;
			    loadQueuedFamilies();

			    if(touchSound)
			    {
			    	loadQueued();
			    }

			  }
			});
	
	}

	function loadQueuedFamilies(){
		console.log(queuedFamilies)
		for( var i = 0 ; i < queuedFamilies.length ; i++)
		{
			self.loadSounds(queuedFamilies[i]);
		}
	}


	self.loadSounds = function(family){

		if(!readyToLoad)
		{
			queuedFamilies.push(family)
		}

		var loadAll = false;

		if(family == "all")
		{
			loadAll = true;
		}

		for( var i = 0 ; i < soundArray.length ; i++){

				var curSound = soundArray[i];
				var tag = curSound.tag;
	
				if(curSound.family == family || loadAll)
				{
						soundObjArray[tag] = {}
						soundObjArray[tag].data = {
							"isLoaded" : false
						};

						var theSound = soundManager.createSound({
						id: tag,
						url: soundPath + curSound.urlBase +".mp3",
						autoLoad: true,
						autoPlay: false,
						onload: function() {
							if(!touchSound)
							{
								soundObjArray[this.id].data.isLoaded = true;
								checkQueue(this.id);
							}

							}
						});

						soundObjArray[curSound.tag].sound = theSound;

						if(touchSound)
						{
							soundObjArray[tag].data.isLoaded = true;
						}


						



						
				}
		}

	}

	function getTagData(tag){
		for( var i = 0 ; i < soundArray.length ; i++)
		{
			if( soundArray[i].tag == tag)
			{
				return soundArray[i];
			}
		}
	}

	function checkQueue(tag){
		if(queuedSound == tag)
		{
			self.soundPreset(tag);
		}
			
	}


	function loadQueued(){
		if(queuedSound){
			self.soundPreset(queuedSound);
      }
	}

	self.soundPreset = function(tag) {

		if(!readyToLoad || !soundObjArray[tag] || !soundObjArray[tag].data.isLoaded)
		{
			queuedSound = tag;
			return
		}

		// if(!soundObjArray[tag])
		// {
		// 	console.log(tag)
		// 	queuedSound = tag;
		// 	return;
		// }

		// if(!soundObjArray[tag].data.isLoaded)
		// {
		// 	console.log(tag)
		// 	queuedSound = tag;
		// 	return;
		// }

		console.log(tag , "got through")

		var soundData = getTagData(tag);


		if(soundData.noIpad && DETECTION.isIpad )
		{
			return
		}

		if(DETECTION.isIpad || DETECTION.isIphone || DETECTION.isAndroid || !isSoundOn)
		{
			if(soundData.desktopOnly == true)
			{
				return
			}
		}




		self.playSound(soundData.tag , soundData.loops , soundData.volume);

	};

	self.playSound = function(tag , loop , volume , from){

		console.log("SOUND :: play sound" , tag , volume);

		lastSound = tag;

		$(self).trigger(SOUND_STARTED , [ { "tag" : tag } ])

		from ? from = from : from =0

		soundObjArray[tag].sound.isPlaying = true;

		var _loop = loop ? -1 : 0 ;
		// alert(_loop)

		var sound = soundObjArray[tag].sound.play( {"volume": volume , loops : _loop , 
			onfinish: function() {
				if(!(DETECTION.isIpad || DETECTION.isIphone))
				{
						$(self).trigger(SOUND_FINISHED , [ { "tag" : tag } ])
						if(loop) 
						{
	      			SOUND.playSound(tag, loop , volume , from);
			      }
				}

    	}


     });

		//IOS looping fix
		if(DETECTION.isIpad || DETECTION.isIphone)
		{

			if(loop)
			{
				sound.specialInterval = setInterval(function(){

					if( sound.readyState == 3 && !sound.specialTimeout)
					{

						sound.specialTimeout = setTimeout(function(){

							SOUND.stopSound(tag);
							SOUND.playSound(tag, loop , volume , from );

						} , sound.duration )
					}

				} , 100)
			}
			
		}


		

		sound.setPosition(from);

		currentSound = tag;

	}


	self.stopSound = function(tag) {

		tag ? tag = tag : tag = currentSound;

		if(!soundObjArray[tag])
			return

		var tSound = soundObjArray[tag].sound;

		if(DETECTION.isIpad || DETECTION.isIphone || DETECTION.isAndroid )
		{
			if(getTagData(tag).desktopOnly == true)
			{
				return
			}
			else
			{
				if(lastSound != "silence" && !DETECTION.isAndroid )
				{
					SOUND.soundPreset("silence");
				}
			}
		}

		if(tSound)
		{



			soundManager.pause(tag);
			soundManager.stop(tag);



			if(tSound.specialInterval)
			{
				clearInterval(tSound.specialInterval);
				tSound.specialInterval = undefined;
			}
				

			if(tSound.specialTimeout)
				clearTimeout(tSound.specialTimeout);
				tSound.specialTimeout = undefined;
		}
		


	}

	self.toggleMute = function(on){


		var tempOn = !!(on == undefined) ? !isSoundOn : on;

		isSoundOn = tempOn;

		//console.log("toggle mute" , on , tempOn);
		if(tempOn)
		{
				$(self).trigger(SOUND_ON);
				soundManager.unmute();
		}
		else
		{
				$(self).trigger(SOUND_OFF);
				 soundManager.mute();
		}

	}

	self.togglePause = function(tag) {

		tag ? tag = tag : tag = currentSound;

	
		soundManager.togglePause(tag);


	}

	self.pauseSound = function(tag) {

		tag ? tag = tag : tag = currentSound;

	
		soundManager.pause(tag);


	}

	self.soundOff = function(){

		if(isSoundOn)
		{
			isSoundOn = false;

			soundManager.stopAll();

		}
	}

	self.soundOn = function(){

		if(!isSoundOn)
		{
			isSoundOn = true;

		}
	}

	self.isSoundOn = function(){
		return isSoundOn;
	}



}

var SOUND_OFF = "soundOff";
var SOUND_ON = "soundOn";
var SOUND_STARTED = "soundStarted";
var SOUND_FINISHED = "soundFinished";
