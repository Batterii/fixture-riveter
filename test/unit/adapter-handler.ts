import {AdapterHandler} from '../../lib/adapter-handler';
import {DefaultAdapter} from '../../lib/adapters/default-adapter';
import {expect} from 'chai';
import sinon from 'sinon';

describe('Adapters', function() {
	describe('creation', function() {
		it('can be instanced', function() {
			const handler = new AdapterHandler();

			expect(handler).to.exist;
			expect(handler).to.be.an.instanceOf(AdapterHandler);
		});

		it('sets the defaults correctly', function() {
			const handler = new AdapterHandler();

			expect(handler.adapters).to.deep.equal({});
			expect(handler.defaultAdapter).to.be.an.instanceOf(DefaultAdapter);
			expect(handler.currentAdapter).to.be.an.instanceOf(DefaultAdapter);
		});

		it('can set the currentAdapter', function() {
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler(adapter);

			expect(handler.defaultAdapter).to.not.equal(handler.currentAdapter);
			expect(handler.currentAdapter).to.equal(adapter);
		});
	});

	describe('#getAdapter', function() {
		it('returns the current adapter', function() {
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler(adapter);

			expect(handler.getAdapter()).to.equal(adapter);
		});

		it('returns the current adapter with no match', function() {
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler(adapter);

			expect(handler.getAdapter('does not exist')).to.equal(adapter);
		});

		it('returns the chosen adapter', function() {
			const key = 'key';
			const value = new DefaultAdapter();
			const handler = new AdapterHandler();
			handler.adapters[key] = value;

			expect(handler.getAdapter(key)).to.equal(value);
		});
	});

	describe('#setAdapter', function() {
		it('returns the given adapter', function() {
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler();
			expect(handler.setAdapter(adapter)).to.equal(adapter);
		});

		it('calls setAdapters', function() {
			const key = 'key';
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler();
			const stub = sinon.stub(handler, 'setAdapters');

			handler.setAdapter(adapter, key);

			expect(stub).to.be.calledOnce;
			expect(stub).to.be.calledWithExactly(adapter, key);
		});
	});

	describe('#coerceNames', function() {
		it('returns an array if given an array', function() {
			const array = ['key'];
			const handler = new AdapterHandler();
			const result = handler.coerceNames(array);

			expect(result).to.equal(array);
			expect(result).to.deep.equal(array);
		});

		it('returns an array if not given an array', function() {
			const key = 'key';
			const handler = new AdapterHandler();
			const result = handler.coerceNames(key);

			expect(result).to.deep.equal([key]);
		});

		it('returns an empty array if not given anything', function() {
			const handler = new AdapterHandler();
			const result = handler.coerceNames();

			expect(result).to.deep.equal([]);
		});
	});

	describe('#setAdapters', function() {
		it('coerces the name properly', function() {
			const key = 'key';
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler();
			sinon.stub(handler, 'coerceNames').returns([key]);
			handler.setAdapters(adapter, key);

			expect(handler.coerceNames).to.be.calledOnce;
			expect(handler.coerceNames).to.be.calledOnceWithExactly(key);
		});

		it('assigns to all given names', function() {
			const key = 'key';
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler();
			sinon.stub(handler, 'assignMultiple');
			handler.setAdapters(adapter, key);

			expect(handler.assignMultiple).to.be.calledOnce;
			expect(handler.assignMultiple).to.be.calledOnceWithExactly(adapter, [key]);
		});

		it('works with both single strings and lists of strings', function() {
			const key = 'key';
			const listOfKeys = ['key1', 'key2'];
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler();
			handler.setAdapters(adapter, key);
			handler.setAdapters(adapter, listOfKeys);

			expect(handler.adapters[key]).to.equal(adapter);
			expect(handler.adapters[listOfKeys[0]]).to.equal(adapter);
			expect(handler.adapters[listOfKeys[1]]).to.equal(adapter);
		});
	});
});
