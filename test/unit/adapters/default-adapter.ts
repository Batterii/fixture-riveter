import {DefaultAdapter} from "../../../lib/adapters/default-adapter";
import {DummyModel} from "../../test-fixtures/dummy-model";

import {expect} from "chai";
import sinon from "sinon";

describe("DefaultAdapter", function() {
	it("can be created", function() {
		const adapter = new DefaultAdapter();
		expect(adapter).to.exist;
		expect(adapter).to.be.an.instanceof(DefaultAdapter);
	});

	describe("#build", function() {
		it("builds the model", async function() {
			const adapter = new DefaultAdapter();
			const spiedDM = sinon.spy(DummyModel as any);
			const model = adapter.build(
				{name: "Bruce", age: 204},
				spiedDM,
			);
			expect(model).to.be.an.instanceof(DummyModel);
			expect(model.name).to.be.equal("Bruce");
			expect(model.age).to.be.equal(204);
			expect(spiedDM).to.be.calledOnce;
		});
	});

	describe("#save", function() {
		it("calls save on the model", async function() {
			const adapter = new DefaultAdapter();
			const model = new DummyModel();
			sinon.spy(model, "save");
			await adapter.save(model);
			expect(model.save).to.be.calledOnce;
		});

		it("returns a promise", function() {
			const adapter = new DefaultAdapter();
			const model = new DummyModel();
			sinon.spy(model, "save");
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

	describe("#destroy", function() {
		it("calls destroy on the model", async function() {
			const adapter = new DefaultAdapter();
			const model = new DummyModel();
			sinon.spy(model, "destroy");
			await adapter.destroy(model);
			expect(model.destroy).to.be.calledOnce;
		});

		it("returns a promise", function() {
			const adapter = new DefaultAdapter();
			const model = new DummyModel();
			sinon.spy(model, "destroy");
			const result = adapter.destroy(model);
			expect(result.then).to.be.a("function");
			return expect(result).to.be.eventually.fulfilled;
		});

		it("resolves to the object itself", async function() {
			const adapter = new DefaultAdapter();
			const model = new DummyModel();
			const result = await adapter.destroy(model);
			expect(result).to.deep.equal(model);
		});
	});
});
