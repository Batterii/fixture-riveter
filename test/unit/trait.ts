import {DynamicDeclaration} from '../../lib/declarations/dynamic-declaration';
import {FactoryBuilder} from '../../lib/factory-builder';
import {Trait} from '../../lib/trait';

import {expect} from 'chai';

describe('Trait', function() {
	let factoryBuilder: FactoryBuilder;

	beforeEach(function() {
		factoryBuilder = new FactoryBuilder();
	});

	it('creates an instance', function() {
		const result = new Trait('trait', factoryBuilder);
		expect(result).to.be.an.instanceof(Trait);
	});

	it('creates an instance with the correct initial values', function() {
		const result = new Trait('trait', factoryBuilder);
		expect(result.attributes).to.deep.equal([]);
		expect(result.traits).to.deep.equal(new Set());
	});

	it('executes the given block immediately', function() {
		let result = false;
		const trait = new Trait('trait', factoryBuilder, (t: any) => {
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
			const factory = new Trait(name, factoryBuilder);
			const names = factory.names();

			expect(names).to.have.length(1);
			expect(names).to.deep.equal([name]);
		});
	});

	describe('#declareAttribute', function() {
		it('stores the function', function() {
			factoryBuilder = new FactoryBuilder();
			const trait = new Trait('trait', factoryBuilder, () => true);
			const name = 'email';
			const declaration = new DynamicDeclaration(name, () => 'a');
			trait.declareAttribute(declaration);
			const {declarations} = trait.declarationHandler;

			expect(declarations).to.have.length(1);
			expect(declarations.map((a) => a.name)).to.deep.equal([name]);
		});
	});

	describe('#defineTrait', function() {
		it('throws an error', function() {
			factoryBuilder = new FactoryBuilder();
			const trait = new Trait('trait', factoryBuilder, () => true);
			const trait2 = new Trait('trait2', factoryBuilder, () => false);
			expect(() => trait.defineTrait(trait2)).to.throw();
		});
	});
});
