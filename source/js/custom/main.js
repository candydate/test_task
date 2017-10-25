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

				this.progressbar_el.rangeSlider.update({
					max: this.video_el.duration
				});
				this.duration(this.video_el.duration);
				this.current_time(0);
			},

			can_play: ko.observable(false),
			is_playing: ko.observable(false),
			volume: ko.observable(1),
			muted: ko.observable(false),
			current_time: ko.observable(0),
			duration: ko.observable(0),
			time_string: ko.observable('')
		},

		init: function(){
			var player = vm.player,
				video = document.querySelector('#tt_player');

			player.progressbar_el = document.querySelector('#tt_progressbar');
			rangeSlider.create(player.progressbar_el, {
				polyfill: true,
				rangeClass: 'TT__range TT__range_progressbar',
				fillClass: 'TT__range-fill',
				bufferClass: 'TT__range-buffer disabled',
				handleClass: 'TT__range-handle',
				min: 0,
				max: 100,
				onInit: function () {},
				onSlide: function (position, value) {
					// player.video_el.currentTime = position; //TODO bug
				},
				onSlideEnd: function (position, value) {
					player.video_el.currentTime = position;
				}
			});

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
			});

			video.addEventListener('seeking', function(){
				player.progressbar_el.rangeSlider.update({value: video.currentTime});
				player.current_time(video.currentTime);
			});

			player.muted.subscribe(function(val){
				player.video_el.muted = val;
			}, null, "change");

			this.currentVideo.subscribe(function(){
				player.can_play(false);
				player.reset();
			}, null, "beforeChange");

			this.currentVideo.subscribe(function(){
				player.progressbar_el.rangeSlider.update({max: video.duration});
			});

			player.volumebar_el = document.querySelector('#tt_volumebar');

			rangeSlider.create(player.volumebar_el, {
				polyfill: true,
				rangeClass: 'TT__range TT__range_volumebar',
				fillClass: 'TT__range-fill',
				bufferClass: 'TT__range-buffer disabled',
				handleClass: 'TT__range-handle',
				min: 0,
				max: 1,
				step: 0.1,
				onInit: function () {},
				onSlideEnd: function (position, value) {
					player.video_el.volume = value;
				}
			});

			video.addEventListener('volumechange', function(){
				player.volume(video.volume);
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