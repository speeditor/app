/*
 @test-framework Jasmine
 @test-require-asset /resources/wikia/libraries/modil/modil.js
 @test-require-asset /resources/wikia/libraries/zepto/zepto-0.8.js
 @test-require-asset /extensions/wikia/WikiaMobile/js/events.js
 @test-require-asset /extensions/wikia/WikiaMobile/js/features.js
 @test-require-asset /resources/wikia/libraries/DOMwriter/domwriter.js
 @test-require-asset /extensions/wikia/WikiaMobile/js/ads.js
 */

/*global describe, it, runs, waitsFor, expect, require, document*/
describe("Test ads module", function () {
	'use strict';
	var module;

	it("is defined as a module", function () {
		//required markup for correct initialization of the ads module
		document.body.innerHTML = '<aside id=wkAdPlc><div id=wkAdCls></div><div id=wkAdWrp></div></aside><div id=wkFtr></div>';

		runs(function () {
			require('ads', function (ads) {
				module = ads;
			});
		});

		waitsFor(function () {
			if (module) {
				expect(module).toBeDefined();
				return true;
			}
		}, 'module to be defined', 500);
	});

	it("has a public API", function () {
		expect(typeof module.setupSlot).toEqual('function');
		expect(typeof module.init).toEqual('function');
		expect(typeof module.fix).toEqual('function');
		expect(typeof module.unfix).toEqual('function');
		expect(typeof module.dismiss).toEqual('function');
		expect(typeof module.getAdType).toEqual('function');
	});

	it("can initialize a footer Ad", function () {
		module.init('footer');
		expect(module.getAdType()).toEqual('footer');
	});

	it("ad slot is removed after dismiss", function () {
		expect(document.getElementById('wkAdPlc')).toBeDefined();
		module.dismiss();

		waitsFor(function () {
			if (module) {
				expect(document.getElementById('wkAdPlc')).toBe(null);
				expect(document.getElementById('wkAdCls')).toBe(null);
				expect(document.getElementById('wkFtr')).toBeDefined();
				return true;
			}
		}, 'ad slot to be removed', 1000);
	});
});
