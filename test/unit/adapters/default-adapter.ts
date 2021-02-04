import {DefaultAdapter} from "../../../lib/adapters/default-adapter";
import {DummyModel} from "../../test-fixtures/dummy-model";

import {expect} from "chai";

describe("DefaultAdapter", function() {
	describe("#build", function() {
		it("builds the model", async function() {
			const adapter = new DefaultAdapter();
			const model = adapter.build(DummyModel);
			expect(model).to.be.an.instanceof(DummyModel);
		});
	});

	describe("#save", function() {
		it("calls save on the model", async function() {
			const adapter = new DefaultAdapter();
			const model = new DummyModel();
			let i = 0;
			model.save = function() {
				i += 1;
				return this;
			};
			await adapter.save(model);
			expect(i).to.equal(1);
		});

		it("returns a promise", function() {
			const adapter = new DefaultAdapter();
			const model = new DummyModel();
			const result = adapter.save(model);
			expect(result.then).to.be.a("function");
			return expect(result).to.be.eventually.fulfilled;
		});

		it("resolves to the object itself", async function() {
			const adapter = new DefaultAdapter();
			const model = new DummyModel();
			const result = await adapter.save(model);
			expect(result).to.deep.equal(model);
		});
	});
});
