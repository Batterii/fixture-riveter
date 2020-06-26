import {DynamicAttribute} from "../../lib/attributes/dynamic-attribute";
import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {Factory} from "../../lib/factory";
import {FactoryBuilder} from "../../lib/factory-builder";
import {DefaultAdapter} from "../../lib/adapters/default-adapter";
import {DefinitionProxy} from "../../lib/definition-proxy";
import {NullFactory} from "../../lib/null-factory";

import {AttributesForStrategy} from "../../lib/strategies/attributes-for-strategy";

import {DummyModel} from "../test-fixtures/dummy-model";

import {expect} from "chai";
import sinon from "sinon";

describe("Factory", function() {
	let factoryBuilder: FactoryBuilder;

	beforeEach(function() {
		factoryBuilder = new FactoryBuilder();
	});

	it("has a name", function() {
		const name = "test";
		const factory = new Factory(factoryBuilder, name, DummyModel);
		expect(factory.name).to.equal(name);
	});

	it("has a model", function() {
		const factory = new Factory(factoryBuilder, "name", DummyModel);
		expect(factory.model).to.equal(DummyModel);
	});

	it("defines default options", function() {
		const noOptions = new Factory(factoryBuilder, "name", DummyModel);
		expect(noOptions.aliases).to.deep.equal([]);
		expect(noOptions.definedTraits).to.deep.equal([]);
	});

	it("accepts aliases", function() {
		const aliases = ["alias"];
		const withAlias = new Factory(factoryBuilder, "name", DummyModel, {aliases});
		expect(withAlias.aliases).to.deep.equal(aliases);
	});

	it("accepts traits", function() {
		const traits = ["trait"];
		const withTrait = new Factory(factoryBuilder, "name", DummyModel, {traits});
		expect(withTrait.baseTraits).to.deep.equal(traits);
	});

	it("accepts both aliases and traits", function() {
		const aliases = ["alias"];
		const traits = ["trait"];
		const withTrait = new Factory(factoryBuilder, "name", DummyModel, {aliases, traits});
		expect(withTrait.aliases).to.deep.equal(aliases);
		expect(withTrait.baseTraits).to.deep.equal(traits);
	});

	it("doesn't define a default block", function() {
		const noBlock = new Factory(factoryBuilder, "name", DummyModel);
		expect(noBlock.block).to.be.undefined;
	});

	it("can take a block", function() {
		const withBlock = new Factory(factoryBuilder, "name", DummyModel, function() {
			return 1;
		}) as Required<Factory>;
		expect(withBlock.block).to.exist;
		expect(withBlock.block).to.be.a("function");
		expect(withBlock.block({} as DefinitionProxy)).to.equal(1);
	});

	describe("#names", function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it("returns the name", function() {
			const name = "testFactory";
			const factory = new Factory(factoryBuilder, name, DummyModel);
			const names = factory.names();

			expect(names).to.have.length(1);
			expect(names[0]).to.equal(name);
		});

		it("returns the aliases", function() {
			const name = "testFactory";
			const aliases = ["factory1", "factory2"];
			const factory = new Factory(factoryBuilder, name, DummyModel, {aliases});
			const names = factory.names();

			expect(names).to.have.length(3);
			expect(names[0]).to.equal(name);
			expect(names[1]).to.equal(aliases[0]);
			expect(names[2]).to.equal(aliases[1]);
		});
	});

	describe("#parentFactory", function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it("properly finds the parent factory", function() {
			const parentFactory = new Factory(factoryBuilder, "parent", DummyModel);
			const childFactory = new Factory(
				factoryBuilder,
				"child",
				DummyModel,
				{parent: "parent"},
			);
			factoryBuilder.registerFactory(parentFactory);
			factoryBuilder.registerFactory(childFactory);
			const result = childFactory.parentFactory();

			expect(result).to.equal(parentFactory);
		});

		it("instantiates the NullFactory if there's no parent", function() {
			const factory = new Factory(factoryBuilder, "top", DummyModel);
			const result = factory.parentFactory();
			expect(result).to.be.an.instanceof(NullFactory);
		});
	});

	describe("#declareAttribute", function() {
		it("stores the declaration", function() {
			factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, "name", DummyModel);
			const name = "email";
			const attribute = new DynamicDeclaration(name, () => "a");
			factory.declareAttribute(attribute);
			const {declarations} = factory.declarationHandler;

			expect(declarations).to.have.length(1);
			expect(declarations.map((a) => a.name)).to.deep.equal([name]);
		});
	});

	describe("#getParentAttributes", function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it("calls attributeNames", function() {
			const parentFactory = new Factory(factoryBuilder, "parent", DummyModel);
			const childFactory = new Factory(factoryBuilder, "child", DummyModel);
			sinon.stub(childFactory, "parentFactory")
				.returns(parentFactory);
			sinon.spy(childFactory, "attributeNames");

			childFactory.getParentAttributes();
			expect(childFactory.attributeNames).to.be.calledOnce;
		});

		it("calls parentFactory", function() {
			const parentFactory = new Factory(factoryBuilder, "parent", DummyModel);
			const childFactory = new Factory(factoryBuilder, "child", DummyModel);
			sinon.stub(childFactory, "parentFactory")
				.returns(parentFactory);

			childFactory.getParentAttributes();
			expect(childFactory.parentFactory).to.be.calledOnce;
		});

		it("calls getAttributes on the parent", function() {
			const parentFactory = new Factory(factoryBuilder, "parent", DummyModel);
			const attr = new DynamicAttribute("attr", () => true);
			sinon.stub(parentFactory, "getAttributes")
				.returns([attr]);
			const childFactory = new Factory(factoryBuilder, "child", DummyModel);
			sinon.stub(childFactory, "parentFactory")
				.returns(parentFactory);

			childFactory.getParentAttributes();
			expect(parentFactory.getAttributes).to.be.calledOnce;
		});

		it("returns all non-filtered attributes", function() {
			const parentFactory = new Factory(factoryBuilder, "parent", DummyModel);
			const attr = new DynamicAttribute("attr", () => true);
			sinon.stub(parentFactory, "getAttributes")
				.returns([attr]);

			const childFactory = new Factory(factoryBuilder, "child", DummyModel);
			sinon.stub(childFactory, "parentFactory")
				.returns(parentFactory);
			sinon.stub(childFactory, "attributeNames")
				.returns([]);

			const result = childFactory.getParentAttributes();
			expect(result).to.deep.equal([attr]);
		});

		it("filters existing attributes", function() {
			const parentFactory = new Factory(factoryBuilder, "parent", DummyModel);
			const attr = new DynamicAttribute("attr", () => true);
			sinon.stub(parentFactory, "getAttributes")
				.returns([attr]);

			const childFactory = new Factory(factoryBuilder, "child", DummyModel);
			sinon.stub(childFactory, "parentFactory")
				.returns(parentFactory);
			sinon.stub(childFactory, "attributeNames")
				.returns(["attr"]);

			const result = childFactory.getParentAttributes();
			expect(result).to.deep.equal([]);
		});
	});

	describe("#getAttributes", function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it("calls getParentAttributes", function() {
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			sinon.spy(factory, "getParentAttributes");
			factory.getAttributes();

			expect(factory.getParentAttributes).to.be.calledOnce;
		});

		it("concats child attributes to parent attributes", function() {
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const childAttr = new DynamicAttribute("attr", () => true);
			factory.attributes = [childAttr];
			factory.compiled = true;

			const parentAttr = new DynamicAttribute("parent", () => true);
			sinon.stub(factory, "getParentAttributes").returns([parentAttr]);

			const result = factory.getAttributes();
			expect(result).to.deep.equal([parentAttr, childAttr]);
		});
	});

	describe("attributesToApply", function() {
		let overrides: Record<string, any>;
		let factory: Factory;

		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
			factory = new Factory(factoryBuilder, "dummy", DummyModel);
			overrides = {};
		});

		it("calls #getAttributes", function() {
			sinon.stub(factory, "getAttributes").returns([]);

			factory.attributesToApply(overrides);
			expect(factory.getAttributes).to.be.calledOnce;
		});

		it("filters out any keys from overrides", function() {
			const a = {name: "a"} as any;
			const b = {name: "b"} as any;
			sinon.stub(factory, "getAttributes").returns([a, b]);
			const result = factory.attributesToApply({a: true, c: true});

			expect(result).to.have.length(1);
			expect(result[0]).to.equal(b);
		});
	});

	describe("#run", function() {
		it("calls attributesFor", async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const instance = [];

			sinon.stub(factory, "attributesToApply").returns(instance);

			const buildStrategy = new AttributesForStrategy(factoryBuilder, adapter);
			sinon.stub(buildStrategy, "result").resolves(instance);

			const result = await factory.run(buildStrategy);

			expect(result).to.equal(instance);
			expect(factory.attributesToApply).to.be.calledOnceWithExactly({});
		});
	});
});
