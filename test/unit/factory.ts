import {DynamicAttribute} from "../../lib/attributes/dynamic-attribute";
import {DynamicDeclaration} from "../../lib/declarations/dynamic-declaration";
import {Factory} from "../../lib/factory";
import {FactoryBuilder} from "../../lib/factory-builder";
import {DefaultAdapter} from "../../lib/adapters/default-adapter";
import {DefinitionProxy} from "../../lib/definition-proxy";
import {NullFactory} from "../../lib/null-factory";

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

	describe("#applyAttributes", function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it("creates an object", async function() {
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const result = await factory.applyAttributes();

			expect(result).to.exist;
			expect(result).to.be.instanceof(Object);
		});

		it("iterates over attributes", async function() {
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			factory.compiled = true;
			factory.attributes = [
				new DynamicAttribute("name", () => "Noah"),
				new DynamicAttribute("age", () => 32),
			];
			const result = await factory.applyAttributes();

			expect(result).to.deep.equal({name: "Noah", age: 32});
		});

		it("applies attrs argument last", async function() {
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			factory.compiled = true;
			factory.attributes = [
				new DynamicAttribute("name", () => "Noah"),
				new DynamicAttribute("age", () => 32),
			];
			const extraAttributes = {attrs: {name: "Bogart"}};
			const result = await factory.applyAttributes(extraAttributes);

			expect(result).to.deep.equal({name: "Bogart", age: 32});
		});

		it("applies attributes from parent attribute", async function() {
			factoryBuilder.define((fb: FactoryBuilder) => {
				fb.factory("parent", DummyModel, (f: DefinitionProxy) => {
					f.attr("execute1", () => 1);
					f.attr("execute2", () => 2);
				});
				fb.factory(
					"child",
					DummyModel,
					{parent: "parent"},
					(f: DefinitionProxy) => {
						f.attr("execute2", () => 20);
						f.attr("execute3", () => 3);
					},
				);
			});
			const result = await factoryBuilder.attributesFor("child");

			expect(result).to.deep.equal({execute1: 1, execute2: 20, execute3: 3});
		});

		it("doesn't call attributes that are overwritten", function() {
			let spy = false;
			factoryBuilder.define((fb: FactoryBuilder) => {
				fb.factory("parent", DummyModel, (f: DefinitionProxy) => {
					f.attr("execute1", () => 1);
					f.attr("execute2", () => {
						spy = true;
						return 2;
					});
				});
				fb.factory(
					"child",
					DummyModel,
					{parent: "parent"},
					(f: DefinitionProxy) => {
						f.attr("execute2", () => 20);
						f.attr("execute3", () => 3);
					},
				);
			});
			factoryBuilder.attributesFor("child");
			expect(spy).to.be.false;
		});
	});

	describe("#build", function() {
		it("calls the adapter's build method", async function() {
			const adapter = new DefaultAdapter();
			sinon.stub(adapter, "build");
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			const instance = {};
			await factory.build(adapter, instance);

			expect(adapter.build).to.be.calledOnce;
			expect(adapter.build).to.be.calledOnceWithExactly(instance, DummyModel);
		});
	});

	describe("#create", function() {
		it("calls save on the adapter", async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, "dummy", DummyModel);
			sinon.stub(adapter, "save");
			const instance = {};
			await factory.create(adapter, instance);

			expect(adapter.save).to.be.calledOnce;
			expect(adapter.save).to.be.calledOnceWithExactly(instance, DummyModel);
		});
	});

	describe("#run", function() {
		context("calls applyAttributes unconditionally", function() {
			let adapter: DefaultAdapter;
			let factory: Factory;
			let instance: any;

			beforeEach(function() {
				adapter = new DefaultAdapter();
				factory = new Factory(factoryBuilder, "dummy", DummyModel);
				instance = {};

				sinon.stub(factory, "applyAttributes").resolves(instance);
				sinon.stub(factory, "build").resolves(instance);
				sinon.stub(factory, "create").resolves(instance);
			});

			it("with attributesFor", async function() {
				const buildStrategy = "attributesFor";

				const result = await factory.run(buildStrategy, adapter);

				expect(result).to.equal(instance);
				expect(factory.applyAttributes).to.be.calledOnceWithExactly(undefined);
				expect(factory.build).to.not.be.called;
				expect(factory.create).to.not.be.called;
			});

			it("with build", async function() {
				const buildStrategy = "build";

				const result = await factory.run(buildStrategy, adapter);

				expect(result).to.equal(instance);
				expect(factory.applyAttributes).to.be.calledOnce;
				expect(factory.applyAttributes).to.be.calledOnceWith();
				expect(factory.build).to.be.calledOnceWithExactly(adapter, instance);
				expect(factory.create).to.not.be.called;
			});

			it("with create", async function() {
				const buildStrategy = "create";

				const result = await factory.run(buildStrategy, adapter);

				expect(result).to.equal(instance);
				expect(factory.applyAttributes).to.be.calledOnce;
				expect(factory.applyAttributes).to.be.calledOnceWith();
				expect(factory.build).to.be.calledOnceWithExactly(adapter, instance);
				expect(factory.create).to.be.calledOnceWithExactly(adapter, instance);
			});
		});
	});
});
