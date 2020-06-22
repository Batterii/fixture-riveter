import {FactoryBuilder} from "../../lib/factory-builder";
import {NullFactory} from "../../lib/null-factory";

import {expect} from "chai";

describe("NullFactory", function() {
	let factoryBuilder: FactoryBuilder;
	let nullFactory: NullFactory;

	beforeEach(function() {
		factoryBuilder = new FactoryBuilder();
		nullFactory = new NullFactory(factoryBuilder);
	});

	it("can be created", function() {
		expect(nullFactory).to.be.an.instanceof(NullFactory);
		expect(nullFactory.name).to.equal("nullFactory");
	});

	it("#getAttributes returns an empty array", function() {
		expect(nullFactory.getAttributes()).to.deep.equal([]);
	});
});
