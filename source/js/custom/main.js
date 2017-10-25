document.addEventListener("DOMContentLoaded", function(){

	var vm = {
		newProfiles: {
			amount: ko.observable(),
			checkNowUrl: ko.observable('#')
		},
		modelInfo: ko.observable({
			name: ko.observable(),
			age: ko.observable(),
			description: ko.observable(),
			yearStarted: ko.observable(),
			id: ko.observable(),
			activities: ko.observableArray()
		}),

		videos: ko.observableArray(),
		currentVideo: ko.observable(),

		player: {
			video_el: undefined,
			progressbar_el: undefined,
			volumebar_el: undefined,

			play: function(){
				vm.player.video_el.play();
			},
			pause: function(){
				vm.player.video_el.pause();
			},
			toggle: function(){
				if(vm.player.is_playing())vm.player.pause();
				else vm.player.play();
			},

			reset: function(){
				vm.player.pause();
				vm.player.video_el.currentTime = 0;
			},

			mute: function(){
				vm.player.muted(true);
			},
			unmute: function(){
				vm.player.muted(false);
			},

			update_metadata: function(){

				this.duration(this.video_el.duration);
				this.current_time(0);
			},

			can_play: ko.observable(false),
			is_playing: ko.observable(false),
			volume: ko.observable(100),
			muted: ko.observable(false),
			current_time: ko.observable(0),
			duration: ko.observable(0),
			time_string: ko.observable(''),

			current_percentage:  ko.observable(0)
		},

		init: function(){
			var player = vm.player,
				video = document.querySelector('#tt_player');

			player.video_el = video;

			video.addEventListener('canplay', function(){
				player.update_metadata();
				player.can_play(true);
				player.time_string(tt_helpers.get_time_string(player.current_time()) + '/ ' + tt_helpers.get_time_string(player.duration()));
			});

			video.addEventListener('play', function(){
				player.is_playing(true);
			});

			video.addEventListener('pause', function(){
				player.is_playing(false);
			});
			video.addEventListener('ended', function(){
				player.is_playing(false);
			});

			video.addEventListener('timeupdate', function(){
				player.current_time(video.currentTime);
				player.time_string(tt_helpers.get_time_string(player.current_time()) + '/ ' + tt_helpers.get_time_string(player.duration()));
				player.current_percentage(+(player.current_time()/(player.duration()/100)).toFixed(2));
			});

			video.addEventListener('seeking', function(){
				player.current_time(video.currentTime);
			});

			player.muted.subscribe(function(val){
				player.video_el.muted = val;
			}, null, "change");

			this.currentVideo.subscribe(function(){
				player.can_play(false);
				player.reset();
			}, null, "beforeChange");

			function init_ranger(options){

				var ranger = document.querySelector(options.id);

				var dragging = false,
					new_value = 0;

				var	ranger_width = parseInt(getComputedStyle(ranger).width),
					ranger_position = ranger.getBoundingClientRect().x,
					drag_start = 0;

				function update_metadata(obs,val){
					if(options.media_param === 'time'){
						obs(val);
						options.media.currentTime = (video.duration/100) * val;
					}
					else if(options.media_param === 'volume'){
						obs(val);
						options.media.volume = options.observable()/100;
					}
				}

				ranger.addEventListener('mousedown', function(e){
					dragging = true;
					drag_start = e.clientX;
					new_value = e.clientX - ranger_position;
					update_metadata(options.observable, new_value/(ranger_width/100));
				});
				document.addEventListener('mouseup', function(e){
					if(dragging) dragging = false;
				});

				document.addEventListener('mousemove', function(e){
					if(dragging){
						var new_value = e.clientX - ranger_position;
						if(new_value < 0) new_value = 0;
						else if(new_value > ranger_width) new_value = ranger_width;

						update_metadata(options.observable, new_value/(ranger_width/100));
					}
				});

				window.addEventListener('resize', function(){
					ranger_position = ranger.getBoundingClientRect().x;
				});
			}

			init_ranger({
				id: '#tt_progressbar_range',
				observable: player.current_percentage,
				media: video,
				media_param: 'time'
			});
			init_ranger({
				id: '#tt_volumebar_range',
				observable: player.volume,
				media: video,
				media_param: 'volume'
			});
		}
	};

	ko.applyBindings(vm);

	var r= new XMLHttpRequest();
	r.open('GET', 'data.json');
	r.onreadystatechange = function() {
		if (r.readyState !== 4) return;

		if (r.status === 200) {

			if(tt_helpers.is_JSON(r.responseText)){
				var data = JSON.parse(r.responseText);

				vm.modelInfo().name(data.modelInfo.name);
				vm.modelInfo().age(data.modelInfo.age);
				vm.modelInfo().description(data.modelInfo.description);
				vm.modelInfo().yearStarted(data.modelInfo.yearStarted);
				vm.modelInfo().id(data.modelInfo.id);
				vm.modelInfo().activities(data.modelInfo.activities);

				if(data.hasOwnProperty('videos')){

					data.videos.forEach(function(video){
						vm.videos.push(ko.mapping.fromJS(video));
					});

					vm.currentVideo(vm.videos()[0]);

				}
				else {
					console.warn('No videos in received data!');
				}

				if(data.hasOwnProperty('newProfiles')) {
					vm.newProfiles.amount(data.newProfiles.amount);
					vm.newProfiles.checkNowUrl(data.newProfiles.checkNowUrl); //TODO а эта ссылка меняется?

				}

				vm.init();

			}
			else {
				console.warn('Invalid data type received!');
			}

		} else {
			console.warn('Server error!');
		}

	};

	r.send();


});