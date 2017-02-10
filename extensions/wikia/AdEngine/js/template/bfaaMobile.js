/*global define, require*/
define('ext.wikia.adEngine.template.bfaaMobile', [
	'ext.wikia.adEngine.context.uapContext',
	'ext.wikia.adEngine.provider.btfBlocker',
	'ext.wikia.adEngine.slot.resolveState',
	'ext.wikia.adEngine.slotTweaker',
	'ext.wikia.adEngine.video.uapVideo',
	'wikia.document',
	'wikia.log',
	'wikia.window',
	require.optional('ext.wikia.adEngine.mobile.mercuryListener')
], function (uapContext,
			 btfBlocker,
			 resolvedState,
			 slotTweaker,
			 uapVideo,
			 doc,
			 log,
			 win,
			 mercuryListener) {
	'use strict';

	var adsModule,
		logGroup = 'ext.wikia.adEngine.template.bfaaMobile',
		page,
		unblockedSlots = [
			'MOBILE_BOTTOM_LEADERBOARD',
			'MOBILE_IN_CONTENT',
			'MOBILE_PREFOOTER'
		],
		wrapper;

	function adjustPadding(iframe, aspectRatio) {
		var viewPortWidth = Math.max(doc.documentElement.clientWidth, win.innerWidth || 0),
			height = aspectRatio ? viewPortWidth / aspectRatio : iframe.contentWindow.document.body.offsetHeight;

		page.style.paddingTop = height + 'px';
		adsModule.setSiteHeadOffset(height);
	}

	function runOnReady(iframe, params) {
		function onResize(aspectRatio) {
			adjustPadding(iframe, aspectRatio);
		}

		adsModule = win.Mercury.Modules.Ads.getInstance();
		page.classList.add('bfaa-template');
		adjustPadding(iframe, params.aspectRatio);
		win.addEventListener('resize', onResize.bind(null, params.aspectRatio));

		if (mercuryListener) {
			mercuryListener.onPageChange(function () {
				page.classList.remove('bfaa-template');
				page.style.paddingTop = '';
				adsModule.setSiteHeadOffset(0);
				win.removeEventListener('resize', onResize);
			});
		}

		if (uapVideo.isEnabled(params)) {
			uapVideo.loadVideoAd(params)
				.then(function (video) {
					video.addEventListener('loaded', function () {
						onResize(params.videoAspectRatio);
					});

					video.addEventListener('allAdsCompleted', function () {
						onResize(params.aspectRatio);
					});
				});
		}
	}

	function show(params) {
		page = doc.getElementsByClassName('application-wrapper')[0];
		wrapper = doc.getElementsByClassName('mobile-top-leaderboard')[0];

		log(['show', page, wrapper, params], log.levels.info, logGroup);

		wrapper.style.opacity = '0';
		uapContext.setUapId(params.uap);
		params = resolvedState.setImage(params);

		slotTweaker.makeResponsive(params.slotName, params.aspectRatio);
		slotTweaker.onReady(params.slotName, function (iframe) {
			runOnReady(iframe, params);
			wrapper.style.opacity = '';
		});

		log(['show', params.uap], log.levels.info, logGroup);

		unblockedSlots.forEach(btfBlocker.unblock);
	}

	return {
		show: show
	};
});
