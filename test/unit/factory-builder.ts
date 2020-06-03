import {DummyModel} from '../test-fixtures/dummy-model';

import {DefaultAdapter} from '../../lib/adapters/default-adapter';
import {AdapterHandler} from '../../lib/adapter-handler';
import {Factory} from '../../lib/factory';
import {FactoryBuilder} from '../../lib/factory-builder';

import {expect} from 'chai';
import sinon from 'sinon';

// describe('experiment', function() {
// 	it('works', async function() {
// 		const fb = new FactoryBuilder();
// 		fb.define(function() {
// 			this.factory('user', DummyModel, function() {
// 				this.attr('email', () => 'a');
// 				this.attr('password', () => 'batterii2020');
// 				this.attr('passwordConfirmation', () => 'batterii2020');
// 				this.attr('firstName', () => 'noah');
// 				this.attr('lastName', () => 'bogart');
// 				this.attr('role', () => 'guest');

// 				this.sequence('seq', 'a', (e) => `testEmail${e}@batterii.com`);

// 				this.trait('admin', function() {
// 					this.attr('role', 'admin');
// 				});

// 				this.factory('adminUser', { traits: [ 'admin' ] });
// 			});
// 		});

// 		const user1 = await fb.build('user');
// 		const user2 = await fb.build('user', {traits: ['admin']});
// 		const user3 = await fb.build('user', {attrs: {email: 'fake2@email.com'}});
// 		const user4 = await fb.build('user', {
// 			traits: ['admin'],
// 			attrs: {
// 				email: 'fake4@email.com',
// 			},
// 		});

// 		expect(user1).to.exist;
// 		expect(user2).to.exist;
// 		expect(user3).to.exist;
// 		expect(user4).to.exist;
// 	});
// });

describe('FactoryBuilder', function() {
	it('can be built', function() {
		const factoryBuilder = new FactoryBuilder();
		expect(factoryBuilder).to.exist;
		expect(factoryBuilder.factories).to.exist.and.to.be.empty;
	});

	describe('#getAdapter', function() {
		it('passes the call down', function() {
			const factoryBuilder = new FactoryBuilder();
			sinon.stub(factoryBuilder.adapters, 'getAdapter').returns('test');
			const result = factoryBuilder.getAdapter('value');
			const {getAdapter} = factoryBuilder.adapters;

			expect(result).to.deep.equal('test');
			expect(getAdapter).to.be.calledOnce;
			expect(getAdapter).to.be.calledWithExactly('value');
		});
	});

	describe('#setAdapter', function() {
		it('passes the call down', function() {
			const factoryBuilder = new FactoryBuilder();
			sinon.stub(factoryBuilder.adapters, 'setAdapter').returns('test');
			const defaultAdapter = new DefaultAdapter();
			const result = factoryBuilder.setAdapter(defaultAdapter, 'value');
			const {setAdapter} = factoryBuilder.adapters;

			expect(result).to.deep.equal('test');
			expect(setAdapter).to.be.calledOnce;
			expect(setAdapter).to.be.calledWithExactly(defaultAdapter, 'value');
		});
	});

	describe('#define', function() {
		it('binds function call correctly', function() {
			const factoryBuilder = new FactoryBuilder();
			const testArray = ['test'];
			factoryBuilder.define(function() {
				this.factories = testArray;
			});

			expect(factoryBuilder.factories).to.deep.equal(testArray);
		});
	});

	describe('#registerFactory', function() {
		it('adds the factory by name', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const factory = new Factory(name, DummyModel);

			factoryBuilder.registerFactory(factory);

			expect(factoryBuilder.factories[name]).to.equal(factory);
		});

		it('adds the factory by alias', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const aliases = ['factory1', 'factory2'];
			const factory = new Factory(name, DummyModel, {aliases});

			factoryBuilder.registerFactory(factory);

			expect(factoryBuilder.factories[aliases[0]]).to.equal(factory);
			expect(factoryBuilder.factories[aliases[1]]).to.equal(factory);
		});

		it('adds the same factory multiples times', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'factory1';
			const alias = 'factory2';
			const factory = new Factory(name, DummyModel, {aliases: [alias]});

			factoryBuilder.registerFactory(factory);

			const {factories} = factoryBuilder;

			expect(factories[name]).to.deep.equal(factories[alias]);
		});
	});

	describe('#factory', function() {
		it('creates a factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			factoryBuilder.factory(name, DummyModel);

			const factory = factoryBuilder.factories[name];

			expect(factoryBuilder.factories).to.not.be.empty;
			expect(factory).to.exist;
			expect(factory.name).to.equal(name);
		});

		it('returns the created factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const factory = factoryBuilder.factory(name, DummyModel);

			expect(factory.name).to.equal(name);
		});

		it('passes the options down to the factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const aliases = ['factory1', 'factory2'];
			const factory = factoryBuilder.factory(name, DummyModel, {aliases});

			expect(factory.aliases).to.deep.equal(aliases);
		});

		it('registers the factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const spy = sinon.spy(factoryBuilder as any, 'registerFactory');
			sinon.stub(factoryBuilder, 'getFactory').returns(false as any);
			factoryBuilder.factory('testFactory', DummyModel);

			expect(spy.calledOnce).to.be.true;
		});

		it("doesn't register a factory twice", function() {
			const factoryBuilder = new FactoryBuilder();
			const testFn = () => {
				factoryBuilder.factory('testFactory', DummyModel);
			};

			testFn();

			expect(testFn).to.throw;
		});
	});

	describe('#getFactory', function() {
		it('returns the requested factory', function() {
			const name = 'name';
			const factory = new FactoryBuilder();
			factory.factory(name, DummyModel);
			const t = factory.getFactory(name);
			const result = factory.factories[name];
			expect(t).to.equal(result);
		});

		it('throws if a non-existant factory is requested', function() {
			const factory = new FactoryBuilder();
			factory.factory('t', DummyModel);
			expect(() => factory.getFactory('f')).to.throw();
		});
	});

	describe('#build', function() {
		it('returns an instance of the model', async function() {
			const name = 'name';
			const factory = new FactoryBuilder();
			factory.factory(name, DummyModel);
			const result = await factory.build(name);

			expect(result).to.be.instanceof(DummyModel);
		});
	});
});
