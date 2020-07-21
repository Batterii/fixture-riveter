import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {Trait} from "../../lib/trait";

import {expect} from "chai";

describe("Trait", function() {
	let fixtureRiveter: FixtureRiveter;

	beforeEach(function() {
		fixtureRiveter = new FixtureRiveter();
	});

	it("creates an instance", function() {
		const result = new Trait("trait", fixtureRiveter);
		expect(result).to.be.an.instanceof(Trait);
	});

	it("creates an instance with the correct initial values", function() {
		const result = new Trait("trait", fixtureRiveter);
		expect(result.attributes).to.deep.equal([]);
		expect(result.traits).to.deep.equal({});
	});

	it("executes the given block immediately", function() {
		let result = false;
		const trait = new Trait("trait", fixtureRiveter, (t: any) => {
			result = true;
			t.definition.name = "traitor";
		});

		expect(trait.name).to.equal("traitor");
		expect(result).to.be.true;
	});

	describe("#names", function() {
		beforeEach(function() {
			fixtureRiveter = new FixtureRiveter();
		});

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
			fixtureRiveter = new FixtureRiveter();
			const trait = new Trait("trait", fixtureRiveter, () => true);
			const name = "email";
			const declaration = new DynamicDeclaration(name, false, () => "a");
			trait.declareAttribute(declaration);
			const {declarations} = trait.declarationHandler;

			expect(declarations).to.have.length(1);
			expect(declarations.map((a) => a.name)).to.deep.equal([name]);
		});
	});
});
