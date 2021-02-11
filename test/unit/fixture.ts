import {DynamicAttribute} from "../../lib/attributes/dynamic-attribute";
import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {Fixture} from "../../lib/fixture";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {NullFixture} from "../../lib/null-fixture";

import {DummyModel} from "../support/dummy-model";

import {expect} from "chai";
import sinon from "sinon";

describe("Fixture", function() {
	let fixtureRiveter: FixtureRiveter;

	beforeEach(function() {
		fixtureRiveter = new FixtureRiveter();
	});

	it("has a name", function() {
		const name = "test";
		const fixture = new Fixture(fixtureRiveter, name, DummyModel);
		expect(fixture.name).to.equal(name);
	});

	it("has a model", function() {
		const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
		expect(fixture.model).to.equal(DummyModel);
	});

	it("defines default options", function() {
		const noOptions = new Fixture(fixtureRiveter, "name", DummyModel);
		expect(noOptions.aliases).to.deep.equal([]);
		expect(noOptions.traitsCache).to.be.an.instanceOf(Map);
		expect(noOptions.traitsCache.size).to.equal(0);
	});

	it("accepts aliases", function() {
		const aliases = ["alias"];
		const withAlias = new Fixture(fixtureRiveter, "name", DummyModel, {aliases});
		expect(withAlias.aliases).to.deep.equal(aliases);
	});

	it("accepts traits", function() {
		const traits = ["trait"];
		const withTrait = new Fixture(fixtureRiveter, "name", DummyModel, {traits});
		expect(withTrait.baseTraits).to.deep.equal(traits);
	});

	it("accepts both aliases and traits", function() {
		const aliases = ["alias"];
		const traits = ["trait"];
		const withTrait = new Fixture(fixtureRiveter, "name", DummyModel, {aliases, traits});
		expect(withTrait.aliases).to.deep.equal(aliases);
		expect(withTrait.baseTraits).to.deep.equal(traits);
	});

	it("doesn't define a default block", function() {
		const noBlock = new Fixture(fixtureRiveter, "name", DummyModel);
		expect(noBlock.block).to.be.undefined;
	});

	it("can take a block", function() {
		const withBlock = new Fixture(fixtureRiveter, "name", DummyModel, function() {
			return 1;
		});
		expect(withBlock.block).to.exist;
		expect(withBlock.block).to.be.a("function");
		expect(withBlock.block?.({} as any)).to.equal(1);
	});

	describe("#names", function() {
		beforeEach(function() {
			fixtureRiveter = new FixtureRiveter();
		});

		it("returns the name", function() {
			const name = "testFixture";
			const fixture = new Fixture(fixtureRiveter, name, DummyModel);
			const names = fixture.names();

			expect(names).to.have.length(1);
			expect(names[0]).to.equal(name);
		});

		it("returns the aliases", function() {
			const name = "testFixture";
			const aliases = ["fixture1", "fixture2"];
			const fixture = new Fixture(fixtureRiveter, name, DummyModel, {aliases});
			const names = fixture.names();

			expect(names).to.have.length(3);
			expect(names[0]).to.equal(name);
			expect(names[1]).to.equal(aliases[0]);
			expect(names[2]).to.equal(aliases[1]);
		});
	});

	describe("#parentFixture", function() {
		beforeEach(function() {
			fixtureRiveter = new FixtureRiveter();
		});

		it("properly finds the parent fixture", function() {
			const parentFixture = new Fixture(fixtureRiveter, "parent", DummyModel);
			const childFixture = new Fixture(
				fixtureRiveter,
				"child",
				DummyModel,
				{parent: "parent"},
			);
			fixtureRiveter.registerFixture(parentFixture);
			fixtureRiveter.registerFixture(childFixture);
			const result = childFixture.parentFixture();

			expect(result).to.equal(parentFixture);
		});

		it("instantiates the NullFixture if there's no parent", function() {
			const fixture = new Fixture(fixtureRiveter, "top", DummyModel);
			const result = fixture.parentFixture();
			expect(result).to.be.an.instanceof(NullFixture);
		});
	});

	describe("#declareAttribute", function() {
		it("stores the declaration", function() {
			fixtureRiveter = new FixtureRiveter();
			const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
			const name = "email";
			const attribute = new DynamicDeclaration(name, false, () => "a");
			fixture.declareAttribute(attribute);
			const {declarations} = fixture.declarationHandler;

			expect(declarations).to.have.length(1);
			expect(declarations.map((a) => a.name)).to.deep.equal([name]);
		});
	});

	describe("#getAttributes", function() {
		beforeEach(function() {
			fixtureRiveter = new FixtureRiveter();
		});

		it("concats child attributes to parent attributes", function() {
			const fixture = new Fixture(fixtureRiveter, "dummy", DummyModel);
			const childAttr = new DynamicAttribute("attr", false, () => true);
			fixture.attributes = [childAttr];
			fixture.compiled = true;

			const parentAttr = new DynamicAttribute("parent", false, () => true);
			sinon.stub(fixture, "parentFixture")
				.returns({getAttributes: () => [parentAttr]} as any);

			const result = fixture.getAttributes();
			expect(result).to.deep.equal([parentAttr, childAttr]);
		});
	});
});
