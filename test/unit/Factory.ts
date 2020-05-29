import { T } from '../helpers';
import { expect } from 'chai';

import { Factory } from '../../lib/Factory';

describe('Factory', function() {
	it('has a name', function() {
		const name = 'test';
		const factory = new Factory(name, T);
		expect(factory.name).to.equal(name);
	});

	it('has a model', function() {
		const factory = new Factory('name', T);
		expect(factory.model).to.equal(T);
	});

	it('can take a block', function() {
		const noBlock = new Factory('name', T);
		expect(noBlock.block).to.be.undefined;

		const withBlock = new Factory('name', T, function() {
			return 1;
		});
		expect(withBlock.block).to.exist;
		expect(withBlock.block).to.a('function');
	});

	describe('block stuff', function() {
		it('executes with the right "this"', function() {
			const name = 'name';
			const factory = new Factory(name, T, function() {
				return this.name;
			});
			expect(factory.block()).to.equal(name);
		});
	});
});
