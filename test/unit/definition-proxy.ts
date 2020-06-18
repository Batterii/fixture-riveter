import {DefinitionProxy} from "../../lib/definition-proxy";
import {Factory} from "../../lib/factory";
import {FactoryBuilder} from "../../lib/factory-builder";
import {Sequence} from "../../lib/sequences/sequence";

import {DummyModel} from "../test-fixtures/dummy-model";

import {expect} from "chai";
import sinon from "sinon";

describe("DefinitionProxy", function() {
	it("can be created", function() {
		const factoryBuilder = new FactoryBuilder();
		const factory = new Factory(factoryBuilder, "dummy", DummyModel);
		const proxy = new DefinitionProxy(factory);
		expect(proxy).to.be.an.instanceof(DefinitionProxy);
	});

	it("tracks the given definition object", function() {
		const factoryBuilder = new FactoryBuilder();
		const factory = new Factory(factoryBuilder, "dummy", DummyModel);
		const proxy = new DefinitionProxy(factory);
		expect(proxy.definition).to.equal(factory);
	});

	it("creates an array for child factories", function() {
		const factoryBuilder = new FactoryBuilder();
		const factory = new Factory(factoryBuilder, "dummy", DummyModel);
		const proxy = new DefinitionProxy(factory);
		expect(proxy.childFactories).to.deep.equal([]);
	});

	describe("#execute", function() {
		it("calls the definition's block", function() {
			let result: any;
			const factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel, function() {
				result = 1;
			});
			const proxy = new DefinitionProxy(factory);
			proxy.execute();

			expect(result).to.equal(1);
		});

		it("doesn't call the definition's block when no block is given", function() {
			let result: any;
			const factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const proxy = new DefinitionProxy(factory);
			proxy.execute();

			expect(result).to.be.undefined;
		});
	});

	describe("#attr", function() {
		it("calls definiton's defineAttribute when given a block", function() {
			const factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const proxy = new DefinitionProxy(factory);
			const name = "email";
			const block = () => 1;

			const stub = sinon.stub(factory, "declareAttribute");
			proxy.attr(name, block);

			expect(stub).to.be.calledOnce;
		});
	});

	describe("#factory", function() {
		it("saves factory details as children", function() {
			const factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const proxy = new DefinitionProxy(factory);
			proxy.factory("newFactory", DummyModel);

			expect(proxy.childFactories).to.deep.equal([["newFactory", DummyModel]]);
		});
	});

	describe("#sequence", function() {
		it("returns the created sequence", function() {
			const factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const proxy = new DefinitionProxy(factory);
			const result = proxy.sequence("email");
			expect(result).to.be.an.instanceof(Sequence);
		});

		it("adds the sequence as an attribute", function() {
			const factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const proxy = new DefinitionProxy(factory);
			sinon.spy(factory, "declareAttribute");
			const name = "email";
			const result = proxy.sequence(name);
			const {declarations} = factory.declarationHandler;

			expect(declarations).to.be.length(1);
			expect(declarations[0].name).to.equal(name);
			expect(factory.declareAttribute).to.be.calledOnce;
			expect(declarations[0].name).to.equal(result.name);
		});

		it("delegates sequence creation to sequenceHandler", function() {
			const factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const proxy = new DefinitionProxy(factory);
			sinon.spy(factory.sequenceHandler, "registerSequence");
			const name = "email";
			proxy.sequence(name);

			expect(factory.sequenceHandler.registerSequence).to.be.calledOnce;
			expect(factory.sequenceHandler.registerSequence).to.be.calledOnceWithExactly(name);
		});
	});
});
