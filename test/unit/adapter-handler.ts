import {AdapterHandler, coerceNames} from "../../lib/adapter-handler";
import {DefaultAdapter} from "../../lib/adapters/default-adapter";
import {expect} from "chai";

describe("Adapters", function() {
	describe("#getAdapter", function() {
		it("returns the current adapter", function() {
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler(adapter);

			expect(handler.getAdapter()).to.equal(adapter);
		});

		it("returns the current adapter with no match", function() {
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler(adapter);

			expect(handler.getAdapter("does not exist")).to.equal(adapter);
		});

		it("returns the chosen adapter", function() {
			const key = "key";
			const value = new DefaultAdapter();
			const handler = new AdapterHandler();
			handler.adapters.set(key, value);

			expect(handler.getAdapter(key)).to.equal(value);
		});
	});

	describe("#setAdapter", function() {
		it("returns the given adapter", function() {
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler();
			expect(handler.setAdapter(adapter)).to.equal(adapter);
		});
	});

	describe("#coerceNames", function() {
		it("returns an array if given an array", function() {
			const array = ["key"];
			const result = coerceNames(array);

			expect(result).to.equal(array);
			expect(result).to.deep.equal(array);
		});

		it("returns an array if not given an array", function() {
			const key = "key";
			const result = coerceNames(key);

			expect(result).to.deep.equal([key]);
		});

		it("returns an empty array if not given anything", function() {
			const result = coerceNames();

			expect(result).to.deep.equal([]);
		});
	});

	describe("#setAdapters", function() {
		it("works with both single strings and lists of strings", function() {
			const key = "key";
			const listOfKeys = ["key1", "key2"];
			const adapter = new DefaultAdapter();
			const handler = new AdapterHandler();
			handler.setAdapters(adapter, key);
			handler.setAdapters(adapter, listOfKeys);

			expect(handler.adapters.get(key)).to.equal(adapter);
			expect(handler.adapters.get("key1")).to.equal(adapter);
			expect(handler.adapters.get("key2")).to.equal(adapter);
		});
	});
});
