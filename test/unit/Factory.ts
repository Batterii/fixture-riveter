import { T } from '../helpers';
import { expect } from 'chai';
import { size } from 'lodash';

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
		const aliases = [ 'alias' ];
		const withAlias = new Factory('name', T, { aliases });
		expect(withAlias.aliases).to.equal(aliases);
	});

	it('accepts traits', function() {
		const traits = [ 'trait' ];
		const withTrait = new Factory('name', T, { traits });
		expect(withTrait.traits).to.equal(traits);
	});

	it('accepts both aliases and traits', function() {
		const aliases = [ 'alias' ];
		const traits = [ 'trait' ];
		const withTrait = new Factory('name', T, { aliases, traits });
		expect(withTrait.aliases).to.equal(aliases);
		expect(withTrait.traits).to.equal(traits);
	});

	it("doesn't define a default block", function() {
		const noBlock = new Factory('name', T);
		expect(noBlock.block).to.be.undefined;
	});

	it('can take a block', function() {
		const withBlock = new Factory('name', T, function() {
			return 1;
		});
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
			const factory = new Factory(name, T, { aliases });
			const names = factory.names();

			expect(names).to.have.length(3);
			expect(names[0]).to.equal(name);
			expect(names[1]).to.equal(aliases[0]);
			expect(names[2]).to.equal(aliases[1]);
		});
	});

	describe('compile', function() {
		it('executes the block with correct context', function() {
			const name = 'name';
			const factory = new Factory(name, T, function() {
				return this.name;
			});
			expect(factory.compile()).to.equal(name);
		});
	});

	describe('#defineAttribute', function() {
		it('stores the function', function() {
			const factory = new Factory('name', T);
			const name = 'email';
			factory.defineAttribute(name, () => 'a');

			expect(size(factory.attributes)).to.equal(1);
			expect(Object.keys(factory.attributes)).to.deep.equal([ name ]);
			expect(factory.attributes[name].call()).to.equal('a');
		});
	});
});
