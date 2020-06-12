import {DummyModel} from '../test-fixtures/dummy-model';

import {DefaultAdapter} from '../../lib/adapters/default-adapter';
import {Factory} from '../../lib/factory';
import {FactoryBuilder} from '../../lib/factory-builder';
import {Sequence} from '../../lib/sequences/sequence';
import {IntegerSequence} from '../../lib/sequences/integer-sequence';

import {expect} from 'chai';
import sinon from 'sinon';

describe('FactoryBuilder', function() {
	it('can be built', function() {
		const factoryBuilder = new FactoryBuilder();
		expect(factoryBuilder).to.exist;
		expect(factoryBuilder.factories).to.exist.and.to.be.empty;
	});

	describe('#getAdapter', function() {
		it('passes the call down', function() {
			const factoryBuilder = new FactoryBuilder();
			sinon.stub(factoryBuilder.adapterHandler, 'getAdapter').returns('test');
			const result = factoryBuilder.getAdapter('value');
			const {getAdapter} = factoryBuilder.adapterHandler;

			expect(result).to.deep.equal('test');
			expect(getAdapter).to.be.calledOnce;
			expect(getAdapter).to.be.calledWithExactly('value');
		});
	});

	describe('#setAdapter', function() {
		it('passes the call down', function() {
			const factoryBuilder = new FactoryBuilder();
			sinon.stub(factoryBuilder.adapterHandler, 'setAdapter').returns('test');
			const defaultAdapter = new DefaultAdapter();
			const result = factoryBuilder.setAdapter(defaultAdapter, 'value');
			const {setAdapter} = factoryBuilder.adapterHandler;

			expect(result).to.deep.equal('test');
			expect(setAdapter).to.be.calledOnce;
			expect(setAdapter).to.be.calledWithExactly(defaultAdapter, 'value');
		});
	});

	describe('#define', function() {
		it('calls the block immediately', function() {
			const factoryBuilder = new FactoryBuilder();
			const testArray = ['test'] as any;
			factoryBuilder.define(function() {
				factoryBuilder.factories = testArray;
			});

			expect(factoryBuilder.factories).to.deep.equal(testArray);
		});
	});

	describe('#registerFactory', function() {
		it('adds the factory by name', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const factory = new Factory(factoryBuilder, name, DummyModel);

			factoryBuilder.registerFactory(factory);

			expect(factoryBuilder.factories[name]).to.equal(factory);
		});

		it('adds the factory by alias', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'testFactory';
			const aliases = ['factory1', 'factory2'];
			const factory = new Factory(factoryBuilder, name, DummyModel, {aliases});

			factoryBuilder.registerFactory(factory);

			expect(factoryBuilder.factories[aliases[0]]).to.equal(factory);
			expect(factoryBuilder.factories[aliases[1]]).to.equal(factory);
		});

		it('adds the same factory multiples times', function() {
			const factoryBuilder = new FactoryBuilder();
			const name = 'factory1';
			const alias = 'factory2';
			const factory = new Factory(factoryBuilder, name, DummyModel, {aliases: [alias]});

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

			expect(testFn).to.throw();
		});

		it('creates child factories', function() {
			const factoryBuilder = new FactoryBuilder();
			factoryBuilder.factory('user', DummyModel, (f: any) => {
				f.factory('oldUser', DummyModel);
			});
			const result = Object
				.keys(factoryBuilder.factories)
				.map((name: string) => factoryBuilder.factories[name])
				.map((f: Factory) => f.name);
			expect(result).to.deep.equal(['user', 'oldUser']);
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

		it('can build from an alias', async function() {
			const factory = new FactoryBuilder();
			factory.factory('dummy', DummyModel, {aliases: ['user']});
			const result = await factory.build('user');

			expect(result).to.be.instanceof(DummyModel);
		});

		it('calls the right functions', async function() {
			const fb = new FactoryBuilder();
			const name = 'name';
			const adapter = new DefaultAdapter();
			const factory = new Factory(fb, name, DummyModel);
			fb.factory(name, DummyModel);
			sinon.stub(fb, 'getAdapter').returns(adapter);
			sinon.stub(fb, 'getFactory').returns(factory);
			sinon.spy(factory, 'build');
			await fb.build(name);

			expect(fb.getAdapter).to.be.calledOnce;
			expect(fb.getFactory).to.be.calledOnce;
			expect(fb.getFactory).to.be.calledOnceWithExactly(name);
			expect(factory.build).to.be.calledOnce;
			expect(factory.build).to.be.calledOnceWith(adapter);
		});
	});

	describe('#create', function() {
		it('returns an instance of the model', async function() {
			const name = 'name';
			const factory = new FactoryBuilder();
			factory.factory(name, DummyModel);
			const result = await factory.create(name);

			expect(result).to.be.instanceof(DummyModel);
		});

		it('can create from an alias', async function() {
			const factory = new FactoryBuilder();
			factory.factory('dummy', DummyModel, {aliases: ['user']});
			const result = await factory.create('user');

			expect(result).to.be.instanceof(DummyModel);
		});

		it('calls the right functions', async function() {
			const fb = new FactoryBuilder();
			const name = 'name';
			const adapter = new DefaultAdapter();
			const factory = new Factory(fb, name, DummyModel);
			fb.factory(name, DummyModel);
			sinon.stub(fb, 'getAdapter').returns(adapter);
			sinon.stub(fb, 'getFactory').returns(factory);
			sinon.spy(factory, 'create');
			await fb.create(name);

			expect(fb.getAdapter).to.be.calledOnce;
			expect(fb.getFactory).to.be.calledOnce;
			expect(fb.getFactory).to.be.calledOnceWithExactly(name);
			expect(factory.create).to.be.calledOnce;
			expect(factory.create).to.be.calledOnceWith(adapter);
		});
	});

	describe('#attributesFor', function() {
		it('returns an object with the defined attributes', function() {
			const name = 'Noah';
			const age = 32;

			const fb = new FactoryBuilder();
			fb.define(function() {
				fb.factory('user', DummyModel, (f: any) => {
					f.attr('name', () => name);
					f.attr('age', () => age);
				});
			});
			const result = fb.attributesFor('user');
			const expected = new DummyModel(name, age);

			expect(result).to.be.an('object');
			expect(result).to.deep.equal(expected);
		});
	});

	describe('#sequence', function() {
		it('returns the created sequence', function() {
			const fb = new FactoryBuilder();
			const result = fb.sequence('email');
			expect(result).to.be.an.instanceof(Sequence);
		});

		it('adds the sequence as an attribute', function() {
			const fb = new FactoryBuilder();
			const name = 'email';
			fb.sequence(name);
			expect(fb.sequenceHandler.sequences).to.be.length(1);
			expect(fb.sequenceHandler.sequences[0].name).to.equal(name);
		});

		it('delegates sequence creation to sequenceHandler', function() {
			const fb = new FactoryBuilder();
			sinon.spy(fb.sequenceHandler, 'registerSequence');
			const name = 'email';
			fb.sequence(name);

			expect(fb.sequenceHandler.registerSequence).to.be.calledOnce;
			expect(fb.sequenceHandler.registerSequence).to.be.calledOnceWithExactly(name);
		});
	});

	describe('#resetSequences', function() {
		it('resets all sequences', function() {
			const name = 'user';
			const fb = new FactoryBuilder();
			let sequenceInFactory = new IntegerSequence('temp');
			fb.factory(name, DummyModel, (f: any) => {
				sequenceInFactory = f.sequence('email') as IntegerSequence;
			});
			const globalSeq: any = fb.sequence('usernames');
			globalSeq.next();
			globalSeq.next();
			sequenceInFactory.next();
			sequenceInFactory.next();
			fb.resetSequences();
			expect(globalSeq.index).to.equal(1);
			expect(sequenceInFactory.index).to.equal(1);
		});
	});
});
