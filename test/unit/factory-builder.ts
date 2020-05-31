import { T } from '../helpers';
import { expect } from 'chai';
import sinon from 'sinon';

import { Factory } from '../../lib/factory';
import { FactoryBuilder } from '../../lib/factory-builder';

describe('experiment', function() {
	it('works', function() {
		const factoryBuilder = new FactoryBuilder();
		factoryBuilder.define(function() {
			this.factory('user', T, function() {
				this.attr('email', () => 'a');
				this.attr('password', () => 'batterii2020');
				this.attr('passwordConfirmation', () => 'batterii2020');
				this.attr('firstName', () => 'noah');
				this.attr('lastName', () => 'bogart');
				this.attr('role', () => 'guest');

				// this.trait('batteriiUser', function() {
				// 	this.sequence('email', 'a', (e) => `testEmail${e}@batterii.com`);
				// 	this.attr('role', 'user');
				// });

				// this.trait('admin', function() {
				// 	this.attr('batteriiUser');
				// 	this.attr('role', 'admin');
				// });

				// this.factory('adminUser', { traits: [ 'admin' ] });
			});
		});
	});
});

describe('FactoryBuilder', function() {
	it('can be built', function() {
		const factoryBuilder = new FactoryBuilder();
		expect(factoryBuilder).to.exist;
		expect(factoryBuilder._factories).to.exist.and.to.be.empty;
	});

	describe('#define', function() {
		it('binds function call correctly', function() {
			const factoryBuilder = new FactoryBuilder();
			const testArray = [ 'test' ];
			factoryBuilder.define(function() {
				this._factories = testArray;
			});

			expect(factoryBuilder._factories).to.deep.equal(testArray);
		});
	});

	describe('#registerFactory', function() {
		it('adds the factory by name', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const factory = new Factory(name, T);

			factoryBuilder.registerFactory(factory);

			expect(factoryBuilder._factories[name]).to.equal(factory);
		});

		it('adds the factory by alias', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const aliases = [ 'factory1', 'factory2' ];
			const factory = new Factory(name, T, { aliases });

			factoryBuilder.registerFactory(factory);

			expect(factoryBuilder._factories[aliases[0]]).to.equal(factory);
			expect(factoryBuilder._factories[aliases[1]]).to.equal(factory);
		});

		it('adds the same factory multiples times', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'factory1';
			const alias = 'factory2';
			const factory = new Factory(name, T, {
				aliases: [ alias ],
			});

			factoryBuilder.registerFactory(factory);

			const factories = factoryBuilder._factories;

			expect(factories[name]).to.deep.equal(factories[alias]);
		});
	});

	describe('#factory', function() {
		it('creates a factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			factoryBuilder.factory(name, T);

			const factory = factoryBuilder._factories[name];

			expect(factoryBuilder._factories).to.not.be.empty;
			expect(factory).to.exist;
			expect(factory.name).to.equal(name);
		});

		it('returns the created factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const factory = factoryBuilder.factory(name, T);

			expect(factory.name).to.equal(name);
		});

		it('passes the options down to the factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const aliases = [ 'factory1', 'factory2' ];
			const factory = factoryBuilder.factory(name, T, { aliases });

			expect(factory.aliases).to.deep.equal(aliases);
		});

		it('registers the factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const spy = sinon.spy(factoryBuilder as any, 'registerFactory');
			sinon.stub(factoryBuilder, 'getFactory').returns(false as any);
			factoryBuilder.factory('testFactory', T);

			expect(spy.calledOnce).to.be.true;
		});

		it("doesn't register a factory twice", function() {
			const factoryBuilder = new FactoryBuilder();
			const testFn = () => {
				factoryBuilder.factory('testFactory', T);
			};

			testFn();

			expect(testFn).to.throw;
		});
	});

	describe('#getFactory', function() {
		it('returns the requested factory', function() {
			const name = 'name';
			const factory = new FactoryBuilder();
			factory.factory(name, T);
			const t = factory.getFactory(name);
			const result = factory._factories[name];
			expect(t).to.equal(result);
		});

		it('throws if a non-existant factory is requested', function() {
			const factory = new FactoryBuilder();
			factory.factory('t', T);
			expect(() => factory.getFactory('f')).to.throw();
		});
	});
});
