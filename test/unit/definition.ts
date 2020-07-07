import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {Definition} from "../../lib/definition";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";
import sinon from "sinon";

describe("Definition", function() {
	const name = "definition";
	let fixtureRiveter: FixtureRiveter;
	let definition: Definition;

	beforeEach(function() {
		fixtureRiveter = {} as FixtureRiveter;
		definition = new Definition(name, fixtureRiveter);
	});

	it("can be created", function() {
		expect(definition).to.exist;
		expect(definition).to.be.an.instanceof(Definition);
	});

	// describe("#getAttributes", function() {
	// 	it("works", function() {
	// 		sinon.stub(definition, "compile");

	// 		const dName = "dName";
	// 		definition.declareAttribute(new DynamicDeclaration(dName, () => dName));

	// 		const result = definition.getAttributes();

	// 		expect(result).to.equal("heck");
	// 	});
	// });
});
