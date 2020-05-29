import { T } from '../helpers';
import { expect } from 'chai';

import { FactoryBuilder } from '../../lib/FactoryBuilder';

describe('FactoryBuilder', function() {
	let factory: FactoryBuilder;

	describe('#define', function() {
		beforeEach(function() {
			factory = new FactoryBuilder();
		});

		it('defines a factory', function() {
			factory.define(function() {
				this.factory('t', T);
			});

			const { t } = factory._factories;
			expect(factory.getFactory('t', false)).to.equal(t);
		});

		// it('only registers a single factory', function() {
		// 	expect(() => factory.define('t', T)).to.throw();
		// });
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
