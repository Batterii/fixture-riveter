import { T } from '../helpers';
import { expect } from 'chai';

import { Factory } from '../../lib/Factory';
import { FactoryBuilder } from '../../lib/FactoryBuilder';

describe('FactoryBuilder', function() {
	describe('#define', function() {
		it('defines a factory', function() {
			const factoryBuilder = new FactoryBuilder();
			factoryBuilder.define(function() {
				this.factory('t', T);
			});

			const { t } = factoryBuilder._factories;
			expect(factoryBuilder.getFactory('t', false)).to.equal(t);
		});

		it('only registers a single factory', function() {
			const factoryBuilder = new FactoryBuilder();
			const testFn = () => {
				factoryBuilder.define(function() {
					this.factory('t', T);
				});
			};

			testFn();

			expect(testFn).to.throw;
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
			const factory = new Factory(name, T, { options: { aliases } });

			factoryBuilder.registerFactory(factory);

			expect(factoryBuilder._factories[aliases[0]]).to.equal(factory);
			expect(factoryBuilder._factories[aliases[1]]).to.equal(factory);
		});
	});

	// describe('#getFactory', function() {
	// 	beforeEach(function() {
	// 		factory = new FactoryBuilder();
	// 		factory.define('t', T);
	// 	});

	// 	it('returns the requested factory', function() {
	// 		const t = factory.getFactory('t');
	// 		expect(t).to.equal(T);
	// 	});

	// 	it('throws if a non-existant factory is requested', function() {
	// 		expect(() => factory.getFactory('f')).to.throw();
	// 	});
	// });
});
