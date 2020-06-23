import {FactoryBuilder} from "../../../lib/factory-builder";
import {Factory} from "../../../lib/factory";
import {ImplicitDeclaration} from "../../../lib/declarations/implicit-declaration";
import {AssociationAttribute} from "../../../lib/attributes/association-attribute";
import {SequenceAttribute} from "../../../lib/attributes/sequence-attribute";

import {expect} from "chai";
import sinon from "sinon";

describe("ImplicitDeclaration", function() {
	const name = "email";

	it("creates an instance of ImplicitDeclaration", function() {
		const factoryBuilder = {} as FactoryBuilder;
		const factory = {} as Factory;
		const result = new ImplicitDeclaration(name, factoryBuilder, factory);

		expect(result).to.be.an.instanceof(ImplicitDeclaration);
		expect(result.name).to.equal(name);
		expect(result.factoryBuilder).to.equal(factoryBuilder);
		expect(result.factory).to.equal(factory);
	});

	describe("#build", function() {
		context("with a known association", function() {
			it("calls getFactory", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(true as any);
				const factory = {} as Factory;
				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				declaration.build();

				expect(factoryBuilder.getFactory).to.be.calledOnce;
				expect(factoryBuilder.getFactory).to.be.calledWithExactly(name, false);
			});

			it("returns an AssociationAttribute", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(true as any);

				const factory = {} as Factory;
				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				const array = declaration.build();
				const [result] = array;

				expect(array).to.be.an.instanceof(Array);
				expect(array).to.have.length(1);
				expect(result).to.be.an.instanceof(AssociationAttribute);
				expect(result.name).to.equal(name);
			});

			it("does not call later functions", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(true as any);
				sinon.stub(factoryBuilder, "findSequence").returns(false as any);

				const factory = new Factory(factoryBuilder, "name", {});
				sinon.stub(factory, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				sinon.stub(declaration, "checkSelfReference").returns(false);
				declaration.build();

				expect(factoryBuilder.findSequence).to.not.be.called;
				expect(declaration.checkSelfReference).to.not.be.called;
				expect(factory.inheritTraits).to.not.be.called;
			});
		});

		context("with no known associations", function() {
			it("calls findSequence", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(false as any);
				sinon.stub(factoryBuilder, "findSequence").returns(true as any);
				const factory = {} as Factory;
				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				declaration.build();

				expect(factoryBuilder.findSequence).to.be.calledOnce;
				expect(factoryBuilder.findSequence).to.be.calledWith(name);
			});
		});

		context("with a known sequence", function() {
			it("creates a sequence attribute", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(false as any);
				factoryBuilder.sequence(name, (n: number) => `Name ${n}`);

				const factory = {} as Factory;
				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				const array = declaration.build();
				const [result] = array;

				expect(array).to.be.an.instanceof(Array);
				expect(array).to.have.length(1);
				expect(result).to.be.an.instanceof(SequenceAttribute);
				expect(result.name).to.equal(name);
			});

			it("does not call later functions", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(false as any);
				sinon.stub(factoryBuilder, "findSequence").returns(true as any);

				const factory = new Factory(factoryBuilder, "name", {});
				sinon.stub(factory, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				sinon.stub(declaration, "checkSelfReference").returns(false);
				declaration.build();

				expect(declaration.checkSelfReference).to.not.be.called;
				expect(factory.inheritTraits).to.not.be.called;
			});
		});

		context("with no known sequences", function() {
			it("calls checkSelfReference", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(false as any);
				sinon.stub(factoryBuilder, "findSequence").returns(false as any);

				const factory = new Factory(factoryBuilder, "name", {});
				sinon.stub(factory, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				sinon.stub(declaration, "checkSelfReference");

				declaration.build();

				expect(declaration.checkSelfReference).to.be.called;
			});

			it("throws if checkSelfReference is true", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(false as any);
				sinon.stub(factoryBuilder, "findSequence").returns(false as any);
				const factory = {} as Factory;
				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				sinon.stub(declaration, "checkSelfReference").returns(true);
				const fn = () => declaration.build();

				expect(fn).to.throw(`Self-referencing trait '${name}'`);
			});

			it("does not call later functions", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(false as any);
				sinon.stub(factoryBuilder, "findSequence").returns(false as any);

				const factory = new Factory(factoryBuilder, "name", {});
				sinon.stub(factory, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				sinon.stub(declaration, "checkSelfReference").returns(true);
				const fn = () => declaration.build();

				expect(fn).to.throw;
				expect(factory.inheritTraits).to.not.be.called;
			});
		});

		context("when not self-referencing", function() {
			it("inherits the name as a trait", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(false as any);
				sinon.stub(factoryBuilder, "findSequence").returns(false as any);

				const factory = new Factory(factoryBuilder, "name", {});
				sinon.stub(factory, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				sinon.stub(declaration, "checkSelfReference").returns(false);

				declaration.build();

				expect(factory.inheritTraits).to.be.called;
				expect(factory.inheritTraits).to.be.calledWith([name]);
			});

			it("returns an empty array", function() {
				const factoryBuilder = new FactoryBuilder();
				sinon.stub(factoryBuilder, "getFactory").returns(false as any);
				sinon.stub(factoryBuilder, "findSequence").returns(false as any);

				const factory = new Factory(factoryBuilder, "name", {});
				sinon.stub(factory, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, factoryBuilder, factory);
				sinon.stub(declaration, "checkSelfReference").returns(false);

				const result = declaration.build();

				expect(result).to.deep.equal([]);
			});
		});
	});
});
