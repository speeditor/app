/*global define*/
define('ext.wikia.adEngine.lookup.prebid.adapters.openx',[
	'ext.wikia.adEngine.adContext',
	'ext.wikia.adEngine.context.slotsContext',
	'ext.wikia.adEngine.wad.babDetection'
], function (adContext, slotsContext, babDetection) {
	'use strict';

	var bidderName = 'openx',
		delDomain = 'wikia-d.openx.net',
		slots = {
			oasis: {
				TOP_LEADERBOARD: {
					sizes: [
						[728, 90],
						[970, 250]
					],
					unit: 538735690
				},
				TOP_RIGHT_BOXAD: {
					sizes: [
						[300, 250],
						[300, 600]
					],
					unit: 538735691
				},
				INCONTENT_BOXAD_1: {
					sizes: [
						[300, 250],
						[300, 600],
						[160, 600]
					],
					unit: 538735697
				},
				BOTTOM_LEADERBOARD: {
					sizes: [
						[728, 90],
						[970, 250]
					],
					unit: 539119447
				}
			},
			mercury: {
				MOBILE_IN_CONTENT: {
					sizes: [
						[300, 250]
					],
					unit: 538735699
				},
				BOTTOM_LEADERBOARD: {
					sizes: [
						[300, 250],
						[320, 50]
					],
					unit: 538735700
				},
				MOBILE_TOP_LEADERBOARD: {
					sizes: [
						[320, 50]
					],
					unit: 538735698
				}
			}
		};

	function isEnabled() {
		return adContext.get('bidders.openx') && !babDetection.isBlocking();
	}

	function getSlots(skin) {
		return slotsContext.filterSlotMap(slots[skin]);
	}

	function prepareAdUnit(slotName, config) {
		return {
			code: slotName,
			mediaTypes: {
				banner: {
					sizes: config.sizes
				}
			},
			bids: [
				{
					bidder: bidderName,
					params: {
						unit: config.unit,
						delDomain: delDomain
					}
				}
			]
		};
	}

	function getName() {
		return bidderName;
	}

	return {
		isEnabled: isEnabled,
		getName: getName,
		getSlots: getSlots,
		prepareAdUnit: prepareAdUnit
	};
});
