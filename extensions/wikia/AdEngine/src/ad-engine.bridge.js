import EventEmitter from 'eventemitter3';
import {
	client,
	context,
	GptSizeMap,
	scrollListener,
	slotListener,
	slotService,
	templateService,
	utils
} from '@wikia/ad-engine';
import {
	BigFancyAdAbove,
	BigFancyAdBelow,
	BigFancyAdInPlayer,
	Roadblock,
	StickyTLB,
	universalAdPackage,
	getSamplingResults,
	utils as adProductsUtils
} from '@wikia/ad-engine/dist/ad-products';

import { createTracker } from './tracking/porvata-tracker-factory';
import TemplateRegistry from './templates/templates-registry';
import AdUnitBuilder from './ad-unit-builder';
import config from './context';
import { getSlotsContext } from './slots';
import { getBiddersContext } from './bidders';
import './ad-engine.bridge.scss';

context.extend(config);

const supportedTemplates = [BigFancyAdAbove, BigFancyAdBelow, BigFancyAdInPlayer, Roadblock, StickyTLB];

function init(
	adTracker,
	slotRegistry,
	mercuryListener,
	pageLevelTargeting,
	adLogicZoneParams,
	legacyContext,
	legacyBtfBlocker,
	skin,
	trackingOptIn,
	babDetection,
	slotsContext
) {
	const isOptedIn = trackingOptIn.isOptedIn();

	context.set('options.bfabStickiness', legacyContext.get('opts.isDesktopBfabStickinessEnabled'));

	TemplateRegistry.init(legacyContext, mercuryListener);
	scrollListener.init();

	context.set('slots', getSlotsContext(legacyContext, skin));
	context.push('listeners.porvata', createTracker(legacyContext, pageLevelTargeting, adTracker));
	context.set('options.trackingOptIn', isOptedIn);
	adProductsUtils.setupNpaContext();

	const stickySlotsLines = legacyContext.get('opts.stickySlotsLines');
	if (stickySlotsLines && stickySlotsLines.length) {
		context.set('templates.stickyTLB.lineItemIds', stickySlotsLines);
		context.push('slots.TOP_LEADERBOARD.defaultTemplates', 'stickyTLB');
	}

	overrideSlotService(slotRegistry, legacyBtfBlocker, slotsContext);
	updatePageLevelTargeting(legacyContext, pageLevelTargeting, skin);
	syncSlotsStatus(slotRegistry, context.get('slots'));

	const wikiIdentifier = legacyContext.get('targeting.wikiIsTop1000') ?
		context.get('targeting.s1') : '_not_a_top1k_wiki';

	context.set('custom.wikiIdentifier', wikiIdentifier);
	context.set('options.contentLanguage', window.wgContentLanguage);

	legacyContext.addCallback(() => {
		context.set('slots', getSlotsContext(legacyContext, skin));
		syncSlotsStatus(slotRegistry, context.get('slots'));
	});

	if (legacyContext.get('bidders.prebidAE3')) {
		context.set('bidders', getBiddersContext(skin));

		context.set('bidders.a9.dealsEnabled', legacyContext.get('bidders.a9Deals'));
		context.set('bidders.a9.enabled', legacyContext.get('bidders.a9'));
		context.set('bidders.a9.videoEnabled', legacyContext.get('bidders.a9Video'));

		if (legacyContext.get('bidders.prebid')) {
			context.set('bidders.prebid.enabled', true);
			context.set('bidders.prebid.aol.enabled', legacyContext.get('bidders.aol'));
			context.set('bidders.prebid.appnexus.enabled', legacyContext.get('bidders.appnexus'));
			context.set('bidders.prebid.appnexusAst.enabled', legacyContext.get('bidders.appnexusAst'));
			context.set('bidders.prebid.audienceNetwork.enabled', legacyContext.get('bidders.audienceNetwork'));
			context.set('bidders.prebid.beachfront.enabled', legacyContext.get('bidders.beachfront'));
			context.set('bidders.prebid.indexExchange.enabled', legacyContext.get('bidders.indexExchange'));
			context.set('bidders.prebid.kargo.enabled', legacyContext.get('bidders.kargo'));
			context.set('bidders.prebid.onemobile.enabled', legacyContext.get('bidders.onemobile'));
			context.set('bidders.prebid.openx.enabled', legacyContext.get('bidders.openx'));
			context.set('bidders.prebid.pubmatic.enabled', legacyContext.get('bidders.pubmatic'));
			context.set('bidders.prebid.rubicon.enabled', legacyContext.get('bidders.rubicon'));
			context.set('bidders.prebid.rubiconDisplay.enabled', legacyContext.get('bidders.rubiconDisplay'));

			context.set('bidders.prebid.targeting', {
				src: [legacyContext.get('targeting.skin') === 'oasis' ? 'gpt' : 'mobile'],
				s0: [adLogicZoneParams.getSite()],
				s1: [legacyContext.get('targeting.wikiIsTop1000') ? adLogicZoneParams.getName() : 'not a top1k wiki'],
				s2: [adLogicZoneParams.getPageType()],
				lang: [adLogicZoneParams.getLanguage()]
			});

			context.set('bidders.prebid.bidsRefreshing.enabled', context.get('options.slotRepeater'));
			context.set('bidders.prebid.lazyLoadingEnabled', legacyContext.get('opts.isBLBLazyPrebidEnabled'));
			context.set('custom.appnexusDfp', legacyContext.get('bidders.appnexusDfp'));
			context.set('custom.rubiconDfp', legacyContext.get('bidders.rubiconDfp'));
			context.set('custom.rubiconInFV', legacyContext.get('bidders.rubiconInFV'));
			context.set('custom.pubmaticDfp', legacyContext.get('bidders.pubmaticDfp'));
			context.set('custom.isCMPEnabled', true);
		}

		context.set('bidders.enabled', context.get('bidders.prebid.enabled') || context.get('bidders.a9.enabled'));
	}

	if (skin === 'oasis' && babDetection.isBlocking()) {
		context.set('bidders.prebid.appnexus.placements', context.get('bidders.prebid.appnexus.recPlacements'));

		Object.keys(context.get('bidders.prebid.indexExchange.slots')).forEach((key) =>
			context.set(`bidders.prebid.indexExchange.slots.${key}.siteId`,
				context.get(`bidders.prebid.indexExchange.recPlacements.${key}`)));
	}
}

function overrideSlotService(slotRegistry, legacyBtfBlocker, slotsContext) {
	const slotsCache = {};

	slotService.get = (slotName) => {
		let slot = slotRegistry.get(slotName);
		if (slotName && slot) {
			if (!slotsCache.hasOwnProperty(slotName)) {
				slotsCache[slotName] = unifySlotInterface(slot);
			}

			return slotsCache[slotName];
		}
	};

	slotService.clearSlot = (slotName) => {
		delete slotsCache[slotName];
	};

	slotService.legacyEnabled = slotService.enable;
	slotService.enable = (slotName) => {
		legacyBtfBlocker.unblock(slotName);
		slotRegistry.enable(slotName);
	};
	slotService.disable = (slotName) => slotRegistry.disable(slotName);
	slotService.getState = (slotName) => slotsContext.isApplicable(slotName);
}

function syncSlotsStatus(slotRegistry, slotsInContext) {
	for (let slot in slotsInContext) {
		if (slotsInContext[slot].disabled) {
			slotRegistry.disable(slot);
		}
	}
}

function unifySlotInterface(slot) {
	const slotPath = `slots.${slot.name}`;
	const slotContext = context.get(slotPath) || {targeting: {}};

	let onLoadResolve = function () {};
	const onLoadPromise = new Promise(function (resolve) {
		onLoadResolve = resolve;
	});

	slot = Object.assign(new EventEmitter(), slot, {
		config: slotContext,
		default: {
			getSlotName: () => slot.name
		},
		emitEvent: (eventName) => {
			const event = document.createEvent('CustomEvent');
			event.initCustomEvent('adengine.slot.status', true, true, {
				slot: slot,
				status: eventName
			});
			window.dispatchEvent(event);
		},
		getElement: () => slot.container.parentElement,
		getId: () => slot.name,
		getSlotName: () => slot.name,
		getTargeting: () => slotContext.targeting,
		getVideoAdUnit: () => AdUnitBuilder.build(slot),
		getViewportConflicts: () => {
			return slotContext.viewportConflicts || [];
		},
		hasDefinedViewportConflicts: () => {
			return (slotContext.viewportConflicts || []).length > 0;
		},
		isRepeatable: () => false,
		getConfigProperty: (key) => context.get(`${slotPath}.${key}`),
		setConfigProperty: (key, value) => {
			context.set(`${slotPath}.${key}`, value);
		},
		getStatus: () => null,
		setStatus: (status) => {
			if (['viewport-conflict', 'sticky-ready', 'sticked', 'unsticked', 'force-unstick'].indexOf(status) > -1) {
				const event = document.createEvent('CustomEvent');
				event.initCustomEvent('adengine.slot.status', true, true, {
					slot: slot,
					status: status
				});
				window.dispatchEvent(event);
			}
		},
		onLoad: () => {
			return onLoadPromise;
		}
	});

	slot.pre('viewed', (event) => {
		slot.isViewedFlag = true;
		slotListener.emitImpressionViewable(event, slot);
	});

	slot.pre('loaded', () => {
		onLoadResolve();
	});

	slot.post('success', (event) => {
		slot.lineItemId = slot.container.firstElementChild.getAttribute('data-gpt-line-item-id');
		const templates = slot.getConfigProperty('defaultTemplates');
		if (templates && templates.length) {
			templates.forEach(template => templateService.init(template, slot));
		}
	});

	return slot;
}

function loadCustomAd(fallback) {
	return (params) => {
		const isTemplateSupported = getSupportedTemplateNames().includes(params.type);

		if (isTemplateSupported && params.slotName) {
			if (params.slotName.indexOf(',') !== -1) {
				params.slotName = params.slotName.split(',')[0];
			}

			const slot = slotService.get(params.slotName);
			slot.container.parentNode.classList.add('gpt-ad');

			context.set(`slots.${slot.getSlotName()}.targeting.src`, params.src);
			context.set(`slots.${slot.getSlotName()}.options.loadedTemplate`, params.type);
			context.set(`slots.${slot.getSlotName()}.options.loadedProduct`, params.adProduct);

			templateService.init(params.type, slot, params);
		} else if (isTemplateSupported) {
			templateService.init(params.type, null, params);
		} else {
			fallback(params);
		}
	};
}

function getSupportedTemplateNames() {
	return supportedTemplates.map((template) => template.getName());
}

function updatePageLevelTargeting(legacyContext, params, skin) {
	context.set('custom.device', utils.client.getDeviceType());
	context.set('targeting.skin', skin);
	context.set('options.video.moatTracking.sampling', legacyContext.get('opts.porvataMoatTrackingSampling'));
	context.set('options.video.moatTracking.enabled', legacyContext.get('opts.porvataMoatTrackingEnabled'));

	Object.keys(params).forEach((key) => context.set(`targeting.${key}`, params[key]));
}

function checkAdBlocking(detection) {
	utils.client.checkBlocking(
		() => { detection.initDetection(true); },
		() => { detection.initDetection(false); }
	);
}

function passSlotEvent(slotName, eventName) {
	slotService.get(slotName).emit(eventName);
}

function readSessionId() {
	utils.readSessionId();
}

const geo = utils;

export {
	init,
	GptSizeMap,
	loadCustomAd,
	checkAdBlocking,
	passSlotEvent,
	readSessionId,
	context,
	universalAdPackage,
	slotService,
	geo,
};
