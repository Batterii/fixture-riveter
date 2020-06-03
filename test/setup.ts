import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
chai.use(sinonChai);

// Restore sinon's static sandbox after each test.
afterEach(function() {
	sinon.restore();
});
