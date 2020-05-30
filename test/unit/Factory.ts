import { T } from '../helpers';
import { expect } from 'chai';

import { Factory } from '../../lib/factory';

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

	it('defines default options', function() {
		const noOptions = new Factory('name', T);
		expect(noOptions.aliases).to.deep.equal([]);
		expect(noOptions.traits).to.deep.equal([]);
	});

	it('accepts aliases', function() {
		const aliases = [ 'alias1' ];
		const options = { options: { aliases } };
		const withAlias = new Factory('name', T, options);
		expect(withAlias.aliases).to.equal(aliases);
	});

	it('accepts traits', function() {
		const traits = [ 'trait1' ];
		const options = { options: { traits } };
		const withTrait = new Factory('name', T, options);
		expect(withTrait.traits).to.equal(traits);
	});

	it("doesn't define a default block", function() {
		const noBlock = new Factory('name', T);
		expect(noBlock.block).to.be.undefined;
	});

	it('can take a block', function() {
		const withBlock = new Factory('name', T, { block() {
			return 1;
		} });
		expect(withBlock.block).to.exist;
		expect(withBlock.block).to.be.a('function');
		expect(withBlock.block()).to.equal(1);
	});

	describe('#names', function() {
		it('returns the name', function() {
			const name = 'testFactory';
			const factory = new Factory(name, T);
			const names = factory.names();

			expect(names).to.have.length(1);
			expect(names[0]).to.equal(name);
		});

		it('returns the aliases', function() {
			const name = 'testFactory';
			const aliases = [ 'factory1', 'factory2' ];
			const factory = new Factory(name, T, { options: { aliases } });
			const names = factory.names();

			expect(names).to.have.length(3);
			expect(names[0]).to.equal(name);
			expect(names[1]).to.equal(aliases[0]);
			expect(names[2]).to.equal(aliases[1]);
		});
	});

	describe('block stuff', function() {
		it('executes with the right "this"', function() {
			const name = 'name';
			const factory = new Factory(name, T, { block() {
				return this.name;
			} });
			expect(factory.block()).to.equal(name);
		});
	});
});
