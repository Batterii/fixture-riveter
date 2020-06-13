import {Attribute} from '../../lib/attribute';
import {FactoryBuilder} from '../../lib/factory-builder';
import {Trait} from '../../lib/trait';

import {expect} from 'chai';

describe('Trait', function() {
	let factoryBuilder: FactoryBuilder;

	beforeEach(function() {
		factoryBuilder = new FactoryBuilder();
	});

	it('creates an instance', function() {
		const result = new Trait(factoryBuilder, 'trait');
		expect(result).to.be.an.instanceof(Trait);
	});

	it('creates an instance with the correct initial values', function() {
		const result = new Trait(factoryBuilder, 'trait');
		expect(result.attributes).to.deep.equal([]);
		expect(result.traits).to.deep.equal(new Set());
	});

	it('executes the given block immediately', function() {
		let result = false;
		const trait = new Trait(factoryBuilder, 'trait', (t: any) => {
			result = true;
			t.definition.name = 'traitor';
		});

		expect(trait.name).to.equal('traitor');
		expect(result).to.be.true;
	});

	describe('#names', function() {
		beforeEach(function() {
			factoryBuilder = new FactoryBuilder();
		});

		it('returns the name', function() {
			const name = 'trait';
			const factory = new Trait(factoryBuilder, name);
			const names = factory.names();

			expect(names).to.have.length(1);
			expect(names[0]).to.equal(name);
		});
	});

	describe('#defineAttribute', function() {
		it('stores the function', function() {
			factoryBuilder = new FactoryBuilder();
			const trait = new Trait(factoryBuilder, 'trait', () => true);
			const name = 'email';
			const attribute = new Attribute(name, () => 'a');
			trait.defineAttribute(attribute);

			expect(trait.attributes).to.have.length(1);
			expect(trait.attributes.map((a) => a.name)).to.deep.equal([name]);
			expect(trait.attributes[0].build()).to.equal('a');
		});
	});

	describe('#defineTrait', function() {
		it('throws an error', function() {
			factoryBuilder = new FactoryBuilder();
			const trait = new Trait(factoryBuilder, 'trait', () => true);
			const trait2 = new Trait(factoryBuilder, 'trait2', () => false);
			expect(() => trait.defineTrait(trait2)).to.throw();
		});
	});
});
