import {Attribute} from '../../lib/attribute';
import {factoryOptionsParser, FactoryOptions, Factory} from '../../lib/factory';
import {FactoryBuilder} from '../../lib/factory-builder';
import {DefaultAdapter} from '../../lib/adapters/default-adapter';

import {DummyModel} from '../test-fixtures/dummy-model';

import {expect} from 'chai';
import {size} from 'lodash';
import sinon from 'sinon';

describe('factoryOptionsParser', function() {
	it('returns an array', function() {
		const result = factoryOptionsParser();
		expect(result).to.be.an.instanceof(Array);
	});

	it('returns an empty object and undefined when given nothing', function() {
		const [resultObj, resultFn] = factoryOptionsParser();
		expect(resultObj).to.deep.equal({});
		expect(resultFn).to.be.undefined;
	});

	it('accepts an object as the only argument', function() {
		const options = {temp: 1} as FactoryOptions;
		const [result] = factoryOptionsParser(options);
		expect(result).to.deep.equal(options);
	});

	it('accepts a function as the only argument', function() {
		const options = (x: any) => x;
		const [, resultFn] = factoryOptionsParser(options);
		expect(resultFn).to.be.a('function');
		expect(resultFn).to.equal(options);
	});

	it('accepts both an object and a function', function() {
		const objOption = {temp: 1} as FactoryOptions;
		const fnOption = (x: any) => x;
		const [resultObj, resultFn] = factoryOptionsParser(objOption, fnOption);
		expect(resultObj).to.deep.equal(objOption);
		expect(resultFn).to.equal(fnOption);
	});
});

describe('Factory', function() {
	let factoryBuilder: FactoryBuilder;

	beforeEach(function() {
		factoryBuilder = new FactoryBuilder();
	});

	it('has a name', function() {
		const name = 'test';
		const factory = new Factory(factoryBuilder, name, DummyModel);
		expect(factory.name).to.equal(name);
	});

	it('has a model', function() {
		const factory = new Factory(factoryBuilder, 'name', DummyModel);
		expect(factory.model).to.equal(DummyModel);
	});

	it('defines default options', function() {
		const noOptions = new Factory(factoryBuilder, 'name', DummyModel);
		expect(noOptions.aliases).to.deep.equal([]);
		expect(noOptions.traits).to.deep.equal([]);
	});

	it('accepts aliases', function() {
		const aliases = ['alias'];
		const withAlias = new Factory(factoryBuilder, 'name', DummyModel, {aliases});
		expect(withAlias.aliases).to.deep.equal(aliases);
	});

	it('accepts traits', function() {
		const traits = ['trait'];
		const withTrait = new Factory(factoryBuilder, 'name', DummyModel, {traits});
		expect(withTrait.traits).to.deep.equal(traits);
	});

	it('accepts both aliases and traits', function() {
		const aliases = ['alias'];
		const traits = ['trait'];
		const withTrait = new Factory(factoryBuilder, 'name', DummyModel, {aliases, traits});
		expect(withTrait.aliases).to.deep.equal(aliases);
		expect(withTrait.traits).to.deep.equal(traits);
	});

	it("doesn't define a default block", function() {
		const noBlock = new Factory(factoryBuilder, 'name', DummyModel);
		expect(noBlock.block).to.be.undefined;
	});

	it('can take a block', function() {
		const withBlock = new Factory(factoryBuilder, 'name', DummyModel, function() {
			return 1;
		});
		expect(withBlock.block).to.exist;
		expect(withBlock.block).to.be.a('function');
		expect(withBlock.block()).to.equal(1);
	});

	describe('#names', function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it('returns the name', function() {
			const name = 'testFactory';
			const factory = new Factory(factoryBuilder, name, DummyModel);
			const names = factory.names();

			expect(names).to.have.length(1);
			expect(names[0]).to.equal(name);
		});

		it('returns the aliases', function() {
			const name = 'testFactory';
			const aliases = ['factory1', 'factory2'];
			const factory = new Factory(factoryBuilder, name, DummyModel, {aliases});
			const names = factory.names();

			expect(names).to.have.length(3);
			expect(names[0]).to.equal(name);
			expect(names[1]).to.equal(aliases[0]);
			expect(names[2]).to.equal(aliases[1]);
		});
	});

	describe('#parentFactory', function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it('properly finds the parent factory', function() {
			const parentFactory = new Factory(factoryBuilder, 'parent', DummyModel);
			const childFactory = new Factory(
				factoryBuilder,
				'child',
				DummyModel,
				{parent: 'parent'},
			);
			factoryBuilder.registerFactory(parentFactory);
			factoryBuilder.registerFactory(childFactory);
			const result = childFactory.parentFactory();
			expect(result).to.equal(parentFactory);
		});
	});

	describe('#defineAttribute', function() {
		it('stores the function', function() {
			factoryBuilder = new FactoryBuilder();
			const factory = new Factory(factoryBuilder, 'name', DummyModel);
			const name = 'email';
			factory.defineAttribute(name, () => 'a');

			expect(size(factory.attributes)).to.equal(1);
			expect(factory.attributes.map((a) => a.name)).to.deep.equal([name]);
			expect(factory.attributes[0].build()).to.equal('a');
		});
	});

	describe('#applyAttributes', function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it('creates an object', function() {
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const result = factory.applyAttributes();

			expect(result).to.exist;
			expect(result).to.be.instanceof(Object);
		});

		it('iterates over attributes', function() {
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			factory.attributes = [
				new Attribute('name', () => 'Noah'),
				new Attribute('age', () => 32),
			];
			const result = factory.applyAttributes();

			expect(result).to.deep.equal({name: 'Noah', age: 32});
		});

		it('applies attrs argument last', function() {
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			factory.attributes = [
				new Attribute('name', () => 'Noah'),
				new Attribute('age', () => 32),
			];
			const extraAttributes = {attrs: {name: 'Bogart'}};
			const result = factory.applyAttributes(extraAttributes);

			expect(result).to.deep.equal({name: 'Bogart', age: 32});
		});

		it('executes the attribute block with the factory as context', function() {
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			factory.attributes = [
				new Attribute('self', function() {
					return this.names(); // eslint-disable-line no-invalid-this
				}),
			];
			const result = factory.applyAttributes();

			expect(result).to.deep.equal({self: ['dummy']});
		});

		it('passes the factory into the attribute function', function() {
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			factory.attributes = [
				new Attribute('self', (f: Factory) => f.names()),
			];
			const result = factory.applyAttributes();

			expect(result).to.deep.equal({self: ['dummy']});
		});

		it('applies traits properly');
	});

	describe('#build', function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it('builds an instance of the model', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const result = await factory.build(adapter);

			expect(result).to.be.an.instanceof(DummyModel);
		});

		it('builds an instance from an alias', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const result = await factory.build(adapter);

			expect(result).to.be.an.instanceof(DummyModel);
		});

		it('returns a promise', function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const result = factory.build(adapter);

			expect(result.then).to.be.a('function');
			expect(result).to.be.eventually.fulfilled;
		});

		it('builds an instance with the right values', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			factory.attributes = [
				new Attribute('name', () => 'Noah'),
				new Attribute('age', () => 32),
			];
			const result = await factory.build(adapter);

			expect(result).to.deep.equal({name: 'Noah', age: 32});
		});

		it('calls applyAttributes', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const model = {name: 'Noah', age: 32};
			sinon.stub(factory, 'applyAttributes').returns(model);
			await factory.build(adapter);

			expect(factory.applyAttributes).to.be.calledOnce;
		});

		it("calls the adapter's build method", async function() {
			const adapter = new DefaultAdapter();
			sinon.stub(adapter, 'build').resolves({name: 'Noah', age: 32});
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			await factory.build(adapter);

			expect(adapter.build).to.be.calledOnce;
		});
	});

	describe('#create', function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it('creates an instance of the model', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const result = await factory.create(adapter);

			expect(result).to.be.an.instanceof(DummyModel);
		});

		it('returns a promise', function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const result = factory.create(adapter);

			expect(result.then).to.be.a('function');
			expect(result).to.be.eventually.fulfilled;
		});

		it('uses #build to build the instance', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const model = new DummyModel('Noah', 32);
			sinon.stub(factory, 'build').resolves(model);
			await factory.create(adapter);

			expect(factory.build).to.be.calledOnce;
			expect(factory.build).to.be.calledOnceWith(adapter);
		});

		it('calls save on the adapter', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory(factoryBuilder, 'dummy', DummyModel);
			const model = new DummyModel('Noah', 32);
			sinon.stub(adapter, 'save').resolves(model);
			await factory.create(adapter);

			expect(adapter.save).to.be.calledOnce;
			expect(adapter.save).to.be.calledOnceWithExactly(model, factory.model);
		});
	});
});
