import {Attribute} from "../../lib/attributes/attribute";
import {Declaration} from "../../lib/declarations/declaration";
import {DeclarationHandler} from "../../lib/declaration-handler";

import {expect} from "chai";
import sinon from "sinon";

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
			const attributes = [] as Attribute[];
			sinon.stub(dh, "toAttributes");
			dh.attributes = attributes;
			dh.getAttributes();

			expect(dh.toAttributes).to.not.be.called;
		});

		it("calls toAttributes to populate list if empty or non-existent", function() {
			const dh = new DeclarationHandler(name);
			delete dh.attributes;
			const attributes = [] as Attribute[];
			sinon.stub(dh, "toAttributes").returns(attributes);
			dh.getAttributes();

			expect(dh.toAttributes).to.be.calledOnce;
		});
	});

	describe("#toAttributes", function() {
		it("calls flatMap on the declarations", function() {
			const dh = new DeclarationHandler(name);
			dh.declarations = [] as any;
			const list = [1];
			const flatMap = sinon.stub(dh.declarations, "flatMap").returns(list);
			const result = dh.toAttributes();
			expect(result).to.equal(list);
			expect(flatMap).to.be.calledOnce;
			expect(flatMap).to.be.calledOn(dh.declarations);
		});

		it("iterates over the declarations", function() {
			const dh = new DeclarationHandler(name);
			dh.declarations = [
				{build: () => 1} as any,
				{build: () => 2} as any,
			];
			const result = dh.toAttributes();
			expect(result).to.deep.equal([1, 2]);
		});
	});
});
