/*global define*/
define('ext.wikia.adEngine.provider.remnantGpt', [
	'wikia.log',
	'wikia.window',
	'ext.wikia.adEngine.slotTweaker',
	'ext.wikia.adEngine.wikiaGptHelper',
	'ext.wikia.adEngine.gptSlotConfig'
], function (log, window, slotTweaker, wikiaGpt, gptSlotConfig) {
	'use strict';

	var logGroup = 'ext.wikia.adEngine.provider.remnantGpt',
		srcName = 'rh',
		secondCallToDPF = false,
		slotMap = gptSlotConfig.getConfig(srcName),
		slotsCalled = {};

	function enableSecondCallToDFP(value) {
		secondCallToDPF = value;
	}

	function canHandleSlot(slotname) {

		if (!slotMap[slotname] || slotsCalled[slotname]) {
			return false;
		}

		return window.wgEnableRHonDesktop || secondCallToDPF;
	}

	function fillInSlot(slotname, success, hop) {
		log(['fillInSlot', slotname], 5, logGroup);

		slotsCalled[slotname] = true;

		wikiaGpt.pushAd(
			slotname,
			function () { // Success
				slotTweaker.removeDefaultHeight(slotname);
				slotTweaker.removeTopButtonIfNeeded(slotname);
				slotTweaker.adjustLeaderboardSize(slotname);

				success();
			},
			function (adInfo) { // Hop
				log(slotname + ' was not filled by DART', 'info', logGroup);

				if (secondCallToDPF) {
					adInfo.method = 'hop';
					hop(adInfo, 'Liftium');
				} else {
					slotTweaker.hide(slotname);
					success();
				}

			},
			srcName
		);

		wikiaGpt.flushAds();
	}

	return {
		name: 'RemnantGpt',
		canHandleSlot: canHandleSlot,
		fillInSlot: fillInSlot,
		enableSecondCallToDFP: enableSecondCallToDFP
	};
});
