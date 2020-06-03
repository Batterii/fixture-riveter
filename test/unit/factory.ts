import {Factory} from '../../lib/factory';
import {DefaultAdapter} from '../../lib/adapters/default-adapter';

import {DummyModel} from '../test-fixtures/dummy-model';

import {expect} from 'chai';
import {size} from 'lodash';
import sinon from 'sinon';

describe('Factory', function() {
	it('has a name', function() {
		const name = 'test';
		const factory = new Factory(name, DummyModel);
		expect(factory.name).to.equal(name);
	});

	it('has a model', function() {
		const factory = new Factory('name', DummyModel);
		expect(factory.model).to.equal(DummyModel);
	});

	it('defines default options', function() {
		const noOptions = new Factory('name', DummyModel);
		expect(noOptions.aliases).to.deep.equal([]);
		expect(noOptions.traits).to.deep.equal([]);
	});

	it('accepts aliases', function() {
		const aliases = ['alias'];
		const withAlias = new Factory('name', DummyModel, {aliases});
		expect(withAlias.aliases).to.equal(aliases);
	});

	it('accepts traits', function() {
		const traits = ['trait'];
		const withTrait = new Factory('name', DummyModel, {traits});
		expect(withTrait.traits).to.equal(traits);
	});

	it('accepts both aliases and traits', function() {
		const aliases = ['alias'];
		const traits = ['trait'];
		const withTrait = new Factory('name', DummyModel, {aliases, traits});
		expect(withTrait.aliases).to.equal(aliases);
		expect(withTrait.traits).to.equal(traits);
	});

	it("doesn't define a default block", function() {
		const noBlock = new Factory('name', DummyModel);
		expect(noBlock.block).to.be.undefined;
	});

	it('can take a block', function() {
		const withBlock = new Factory('name', DummyModel, function() {
			return 1;
		});
		expect(withBlock.block).to.exist;
		expect(withBlock.block).to.be.a('function');
		expect(withBlock.block()).to.equal(1);
	});

	describe('#names', function() {
		it('returns the name', function() {
			const name = 'testFactory';
			const factory = new Factory(name, DummyModel);
			const names = factory.names();

			expect(names).to.have.length(1);
			expect(names[0]).to.equal(name);
		});

		it('returns the aliases', function() {
			const name = 'testFactory';
			const aliases = ['factory1', 'factory2'];
			const factory = new Factory(name, DummyModel, {aliases});
			const names = factory.names();

			expect(names).to.have.length(3);
			expect(names[0]).to.equal(name);
			expect(names[1]).to.equal(aliases[0]);
			expect(names[2]).to.equal(aliases[1]);
		});
	});

	describe('#compile', function() {
		it('executes the block with correct context', function() {
			const name = 'name';
			let result = '';
			const factory = new Factory(name, DummyModel, function() {
				result = this.name;
			});
			factory.compile();
			expect(result).to.equal(name);
		});

		it('is idempotent', function() {
			const name = 'name';
			let counter = 0;
			const factory = new Factory(name, DummyModel, function() {
				counter += 1;
			});
			factory.compile();
			factory.compile();
			expect(counter).to.equal(1);
		});
	});

	describe('#defineAttribute', function() {
		it('stores the function', function() {
			const factory = new Factory('name', DummyModel);
			const name = 'email';
			factory.defineAttribute(name, () => 'a');

			expect(size(factory.attributes)).to.equal(1);
			expect(Object.keys(factory.attributes)).to.deep.equal([name]);
			expect(factory.attributes[name].call()).to.equal('a');
		});
	});

	describe('#applyAttributes', function() {
		it('creates an object', async function() {
			const factory = new Factory('dummy', DummyModel);
			const result = await factory.applyAttributes();

			expect(result).to.exist;
			expect(result).to.be.instanceof(Object);
		});

		it('iterates over attributes', async function() {
			const factory = new Factory('dummy', DummyModel);
			factory.attributes = {
				name: () => 'Noah',
				age: () => 32,
			};
			const result = await factory.applyAttributes();

			expect(result).to.deep.equal({name: 'Noah', age: 32});
		});

		it('awaits all attributes', async function() {
			const factory = new Factory('dummy', DummyModel);
			const result = new Set();

			factory.attributes = {
				name: async() => result.add('Noah'),
				age: async() => result.add(32),
			};
			await factory.applyAttributes();

			expect(result).to.deep.equal(new Set(['Noah', 32]));
		});

		it('returns a promise', function() {
			const factory = new Factory('dummy', DummyModel);
			const result = factory.applyAttributes();

			expect(result.then).to.be.a('function');
			expect(result).to.be.eventually.fulfilled;
		});

		it('applies attrs argument last', async function() {
			const factory = new Factory('dummy', DummyModel);
			factory.attributes = {
				name: () => 'Noah',
				age: () => 32,
			};
			const extraAttributes = {attrs: {name: 'Bogart'}};
			const result = await factory.applyAttributes(extraAttributes);

			expect(result).to.deep.equal({name: 'Bogart', age: 32});
		});

		it('applies traits properly');
	});

	describe('#build', function() {
		it('creates an instance of the model', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory('dummy', DummyModel);
			const result = await factory.build(adapter);

			expect(result).to.be.instanceof(DummyModel);
		});

		it('returns a promise', function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory('dummy', DummyModel);
			const result = factory.build(adapter);

			expect(result.then).to.be.a('function');
			expect(result).to.be.eventually.fulfilled;
		});

		it('creates an instance with the right values', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory('dummy', DummyModel);
			factory.attributes = {
				name: () => 'Noah',
				age: () => 32,
			};
			const result = await factory.build(adapter);

			expect(result).to.deep.equal({name: 'Noah', age: 32});
		});

		it('calls applyAttributes', async function() {
			const adapter = new DefaultAdapter();
			const factory = new Factory('dummy', DummyModel);
			sinon.stub(factory, 'applyAttributes').resolves({name: 'Noah', age: 32});
			await factory.build(adapter);

			expect(factory.applyAttributes).to.be.calledOnce;
		});

		it("calls the adapter's build method", async function() {
			const adapter = new DefaultAdapter();
			sinon.stub(adapter, 'build').resolves({name: 'Noah', age: 32});
			const factory = new Factory('dummy', DummyModel);
			await factory.build(adapter);

			expect(adapter.build).to.be.calledOnce;
		});
	});
});
