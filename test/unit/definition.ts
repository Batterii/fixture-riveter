import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {Definition} from "../../lib/definition";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";
import sinon from "sinon";

describe("Definition", function() {
	const name = "definition";
	let factoryBuilder: FactoryBuilder;
	let definition: Definition;

	beforeEach(function() {
		factoryBuilder = {} as FactoryBuilder;
		definition = new Definition(name, factoryBuilder);
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
