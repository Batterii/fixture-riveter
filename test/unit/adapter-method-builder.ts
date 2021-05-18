import {expect} from "chai";
import {AdapterMethodBuilder} from "../../lib/adapter-method-builder";
import {Fixture} from "../../lib/fixture";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {DummyModel} from "../support/dummy-model";

describe("AttributeMethodBuilder", function() {
	describe("setAdapterMethods", function() {
		let fr: FixtureRiveter;
		let fn: any;
		let fixture: Fixture<DummyModel>;
		let adapterMethodBuilder: typeof AdapterMethodBuilder;

		beforeEach(function() {
			fr = new FixtureRiveter();
			fn = (x: any) => x;
			fixture = new Fixture(fr, "name", DummyModel);
			adapterMethodBuilder = class extends AdapterMethodBuilder {};
		});

		specify("toBuild is set", function() {
			fixture.toBuild = () => fn;
			adapterMethodBuilder.setAdapterMethods(fixture as any);
			expect(adapterMethodBuilder.prototype.build).to.equal(fn);
		});

		specify("toSave is set", function() {
			fixture.toSave = () => fn;
			adapterMethodBuilder.setAdapterMethods(fixture as any);
			expect(adapterMethodBuilder.prototype.save).to.equal(fn);
		});

		specify("toDestroy is set", function() {
			fixture.toDestroy = () => fn;
			adapterMethodBuilder.setAdapterMethods(fixture as any);
			expect(adapterMethodBuilder.prototype.destroy).to.equal(fn);
		});

		specify("toRelate is set", function() {
			fixture.toRelate = () => fn;
			adapterMethodBuilder.setAdapterMethods(fixture as any);
			expect(adapterMethodBuilder.prototype.relate).to.equal(fn);
		});

		specify("toSet is set", function() {
			fixture.toSet = () => fn;
			adapterMethodBuilder.setAdapterMethods(fixture as any);
			expect(adapterMethodBuilder.prototype.set).to.equal(fn);
		});
	});
});
