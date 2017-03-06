require(['wikia.window', 'wikia.onScroll', 'wikia.tracker', 'ooyala-player', 'wikia.abTest'], function (window, onScroll, tracker, OoyalaPlayer, abTest) {

	$(function () {
		var $video = $('#article-video'),
			$videoContainer = $video.find('.video-container'),
			$videoThumbnail = $videoContainer.find('.video-thumbnail'),
			$closeBtn = $videoContainer.find('.close'),
			ooyalaVideoController,
			ooyalaVideoElementId = 'ooyala-article-video',
			$ooyalaVideo = $('#' + ooyalaVideoElementId),
			videoCollapsed = false,
			collapsingDisabled = false,
			playTime = -1,
			percentagePlayTime = -1,
			track = tracker.buildTrackingFunction({
				category: 'article-video',
				trackingMethod: 'analytics'
			}),
			collapsedVideoSize = {
				width: 225,
				height: 127
			};

		function initVideo(onCreate) {
			var ooyalaVideoId = window.wgArticleVideoData.videoId,
				playerParams = window.wgArticleVideoData.playerParams,
				autoplay = abTest.inGroup('FEATURED_VIDEO_AUTOPLAY', 'AUTOPLAY');

			ooyalaVideoController = OoyalaPlayer.initHTMl5Players(ooyalaVideoElementId, playerParams, ooyalaVideoId, onCreate, autoplay);
		}

		function collapseVideo(videoOffset, videoHeight) {
			var videoWidth = $video.outerWidth(),
				viewportWidth = $(window).width(),
				viewportHeight = $(window).height();

			collapsingDisabled = false;
			videoCollapsed = true;
			$video.addClass('collapsed-ready');
			if (ooyalaVideoController) {
				updatePlayerControls(true);
			}
			$videoContainer.css({
				'bottom': viewportHeight - videoOffset.top - videoHeight + $(window).scrollTop(),
				'right': viewportWidth - videoOffset.left - videoWidth,
				'width': videoWidth
			});
			$videoThumbnail.css('height', videoHeight);
			$ooyalaVideo.css('height', videoHeight);
			setTimeout(function () {
				if (videoCollapsed) { // we need to be sure video has not been uncollapsed yet
					$video.addClass('collapsed');
				}
			}, 0);
		}

		function uncollapseVideo() {
			videoCollapsed = false;
			$videoContainer.css({
				'position': '',
				'bottom': '',
				'right': '',
				'top': '',
				'left': '',
				'width': ''
			});
			$videoThumbnail.css('height', '');
			$ooyalaVideo.css('height', '');
			$video.removeClass('collapsed collapsed-ready');
			if (ooyalaVideoController) {
				updatePlayerControls(false);
			}

		}

		function closeButtonClicked(event) {
			event.stopPropagation();
			if (ooyalaVideoController && ooyalaVideoController.player) {
				ooyalaVideoController.player.pause();
			}
			uncollapseVideo();
			collapsingDisabled = true;
			track({
				action: tracker.ACTIONS.CLOSE,
				label: 'featured-video-collapsed'
			});
		}

		function updateOoyalaSize() {
			window.dispatchEvent(new Event('resize'));
			// wait for player resize - there is 150ms debounce on resize event in ooyala html5-skin
			setTimeout(function () {
				ooyalaVideoController.showControls();
			}, 150);
		}

		function updatePlayerControls(waitForTransition) {
			ooyalaVideoController.hideControls();
			if (!waitForTransition) {
				updateOoyalaSize();
			}
			// otherwise wait for SIZE_CHANGED event and then execute updateOoyalaSize function
		}

		function isVideoInFullScreenMode() {
			if (ooyalaVideoController && ooyalaVideoController.player) {
				return ooyalaVideoController.player.isFullscreen();
			}
			return false;
		}

		function toggleCollapse() {
			// That's for Safari because it triggers scroll event (it scrolls to the top)
			// when video is switched to full screen mode.
			if (isVideoInFullScreenMode()) {
				return;
			}
			if (!collapsingDisabled || videoCollapsed) {
				var scrollTop = $(window).scrollTop(),
					videoHeight = $video.outerHeight(),
					videoOffset = $video.offset(),
					scrollOffset = 100,
					collapseOffset = videoOffset.top + videoHeight - scrollOffset;

				if (scrollTop > collapseOffset && !videoCollapsed) {
					collapseVideo(videoOffset, videoHeight);
				} else if (scrollTop <= collapseOffset && videoCollapsed) {
					uncollapseVideo();
				}
			}
		}

		initVideo(function (player) {
			$video.addClass('ready-to-play');

			player.mb.subscribe(OO.EVENTS.INITIAL_PLAY, 'featured-video', function () {
				track({
					action: tracker.ACTIONS.PLAY_VIDEO,
					label: 'featured-video'
				});
			});

			player.mb.subscribe(OO.EVENTS.PLAY, 'featured-video', function () {
				collapsingDisabled = false;
				track({
					action: tracker.ACTIONS.CLICK,
					label: 'featured-video-play'
				});
			});

			player.mb.subscribe(OO.EVENTS.PLAYED, 'featured-video', function () {
				track({
					action: tracker.ACTIONS.CLICK,
					label: 'featured-video-played'
				});
			});

			player.mb.subscribe(OO.EVENTS.PAUSED, 'featured-video', function () {
				track({
					action: tracker.ACTIONS.CLICK,
					label: 'featured-video-paused'
				});
			});

			player.mb.subscribe(OO.EVENTS.SIZE_CHANGED, "featured-video", function (eventName, width, height) {
				if (width === collapsedVideoSize.width && height === collapsedVideoSize.height) {
					updateOoyalaSize();
				}
			});

			player.mb.subscribe( OO.EVENTS.PLAYHEAD_TIME_CHANGED, 'featured-video', function(eventName, time, totalTime) {
				var secondsPlayed = Math.floor(time),
					percentage = Math.round(time / totalTime * 100);

				if ( secondsPlayed % 5 === 0 && secondsPlayed !== playTime ) {
					playTime = secondsPlayed;
					track({
						action: tracker.ACTIONS.VIEW,
						label: 'featured-video-played-seconds-' + playTime
					});
				}

				if ( percentage % 10 === 0 && percentage !== percentagePlayTime ) {
					percentagePlayTime = percentage;
					track({
						action: tracker.ACTIONS.VIEW,
						label: 'featured-video-played-percentage-' + percentagePlayTime
					});
				}
			});

			track({
				action: tracker.ACTIONS.IMPRESSION,
				label: 'featured-video'
			});
		});

		$closeBtn.click(closeButtonClicked);

		onScroll.bind(toggleCollapse);
	});

});
