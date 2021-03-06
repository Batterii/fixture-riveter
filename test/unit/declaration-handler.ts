// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Attribute} from "../../lib/attributes/attribute";
import {Declaration} from "../../lib/declarations/declaration";
import {DeclarationHandler} from "../../lib/declaration-handler";
import {expect} from "chai";

describe("DeclarationHandler", function() {
	const name = "name";

	it("can be created", function() {
		const instance = new DeclarationHandler(name);
		expect(instance).to.be.an.instanceof(DeclarationHandler);
		expect(instance.name).to.equal(name);
		expect(instance.declarations).to.be.an.instanceof(Array);
		expect(instance.declarations).to.be.empty;
	});

	describe("#declareAttribute", function() {
		it("adds items to the list of declarations", function() {
			const dh = new DeclarationHandler(name);
			const item = {} as Declaration;
			dh.declareAttribute(item);
			expect(dh.declarations).to.be.length(1);
			expect(dh.declarations[0]).to.equal(item);
		});

		it("returns the given declaration", function() {
			const dh = new DeclarationHandler(name);
			const item = {} as Declaration;
			const result = dh.declareAttribute(item);
			expect(result).to.equal(item);
		});
	});

	describe("#getAttributes", function() {
		it("returns the list of attributes", function() {
			const dh = new DeclarationHandler(name);
			const attributes = [] as Attribute[];
			dh.attributes = attributes;
			const result = dh.getAttributes();
			expect(result).to.equal(attributes);
		});

		it("doesn't call toAttributes if the list already exists", function() {
			const dh = new DeclarationHandler(name);
			dh.declarations = [{build: () => [1]} as any];
			const attributes = [] as Attribute[];
			dh.attributes = attributes;
			dh.getAttributes();
			expect(dh.attributes).to.equal(attributes);
		});

		it("calls toAttributes to populate list if empty or non-existent", function() {
			const dh = new DeclarationHandler(name);
			dh.declarations = [{build: () => [1]} as any];
			dh.getAttributes();
			expect(dh.attributes).to.deep.equal([1]);
		});
	});

	describe("#toAttributes", function() {
		it("iterates over the declarations", function() {
			const dh = new DeclarationHandler(name);
			dh.declarations = [
				{build: () => [1]} as any,
				{build: () => [2]} as any,
			];
			const result = dh.toAttributes();
			expect(result).to.deep.equal([1, 2]);
		});
	});
});
