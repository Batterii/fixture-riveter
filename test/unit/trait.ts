import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {Trait} from "../../lib/trait";
import {DummyModel} from "../support/dummy-model";
import {Fixture} from "../../lib/fixture";

import {expect} from "chai";

describe("Trait", function() {
	let fixtureRiveter: FixtureRiveter;

	beforeEach(function() {
		fixtureRiveter = new FixtureRiveter();
	});

	describe("constructor", function() {
		it("creates an instance", function() {
			const result = new Trait("trait", fixtureRiveter);
			expect(result).to.be.an.instanceof(Trait);
		});

		it("creates an instance with the correct initial values", function() {
			const block = () => true;
			const result = new Trait("trait", fixtureRiveter, block);
			expect(result.block).to.equal(block);
		});

		it("executes the given block immediately", function() {
			let result = false;
			const trait = new Trait("trait", fixtureRiveter, (t) => {
				result = true;
				t.definition.name = "traitor";
			});

			expect(trait.name).to.equal("traitor");
			expect(result).to.be.true;
		});

		it("disallows children fixtures", function() {
			const child = ["name"] as any;
			const trait = () => new Trait("trait", fixtureRiveter, function() {
				// eslint-disable-next-line no-invalid-this
				this.childFixtures = [child];
			});
			expect(trait).to.throw("Can't define a fixture (name) inside trait (trait)");
		});
	});

	describe("#names", function() {
		it("returns the name", function() {
			const name = "trait";
			const fixture = new Trait(name, fixtureRiveter);
			const names = fixture.names();

			expect(names).to.have.length(1);
			expect(names).to.deep.equal([name]);
		});
	});

	describe("#declareAttribute", function() {
		it("stores the function", function() {
			const trait = new Trait("trait", fixtureRiveter, () => true);
			const name = "email";
			const declaration = new DynamicDeclaration(name, false, () => "a");
			trait.declareAttribute(declaration);
			const {declarations} = trait.declarationHandler;

			expect(declarations).to.have.length(1);
			expect(declarations.map((a) => a.name)).to.deep.equal([name]);
		});
	});

	describe("#defineTrait", function() {
		it("throws an error", function() {
			const trait = new Trait("trait", fixtureRiveter, () => true);
			const newTrait = new Trait("newTrait", fixtureRiveter, () => true);
			const f = () => trait.defineTrait(newTrait);
			expect(f).to.throw("Can't define nested traits: newTrait inside trait");
		});
	});

	describe("#traitByName", function() {
		it("looks at the fixture first", function() {
			const trait = new Trait("trait", fixtureRiveter, () => true);
			const fixture = new Fixture(fixtureRiveter, "fixture", DummyModel);
			const testTrait = {} as any;
			fixture.traitsCache.set("test", testTrait);
			trait.setFixture(fixture);
			expect(trait.traitByName("test")).to.equal(testTrait);
		});

		it("defaults to global FR", function() {
			const trait = new Trait("trait", fixtureRiveter, () => true);
			const testTrait = {} as any;
			fixtureRiveter.traits.set("test", testTrait);
			expect(trait.traitByName("test")).to.equal(testTrait);
		});
	});
});
