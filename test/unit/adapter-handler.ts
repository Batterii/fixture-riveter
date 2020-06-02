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
			const testAdapter = 'testAdapter';
			const handler = new AdapterHandler(testAdapter);

			expect(handler.defaultAdapter).to.not.equal(handler.currentAdapter);
			expect(handler.currentAdapter).to.equal(testAdapter);
		});
	});

	describe('#getAdapter', function() {
		it('returns the current adapter', function() {
			const testAdapter = 'testAdapter';
			const handler = new AdapterHandler(testAdapter);

			expect(handler.getAdapter()).to.equal(testAdapter);
		});

		it('returns the current adapter with no match', function() {
			const testAdapter = 'testAdapter';
			const handler = new AdapterHandler(testAdapter);

			expect(handler.getAdapter('t')).to.equal(testAdapter);
		});

		it('returns the chosen adapter', function() {
			const key = 'key';
			const value = 'testAdapter';
			const handler = new AdapterHandler();
			handler.adapters[key] = value;

			expect(handler.getAdapter(key)).to.equal(value);
		});
	});

	describe('#setAdapter', function() {
		it('returns the given adapter', function() {
			const adapter = 'adapter';
			const handler = new AdapterHandler();
			expect(handler.setAdapter(adapter)).to.equal(adapter);
		});

		it('calls setAdapters', function() {
			const adapter = 'adapter';
			const handler = new AdapterHandler();
			const stub = sinon.stub(handler, 'setAdapters');

			handler.setAdapter(adapter, true);

			expect(stub).to.be.calledOnce;
			expect(stub).to.be.calledWithExactly(adapter, true);
		});
	});
});
