import {DummyModel} from "../../test-fixtures/dummy-model";
import {FixtureRiveter} from "../../../lib/fixture-riveter";
import {Fixture} from "../../../lib/fixture";
import {ImplicitDeclaration} from "../../../lib/declarations/implicit-declaration";
import {RelationAttribute} from "../../../lib/attributes/relation-attribute";
import {SequenceAttribute} from "../../../lib/attributes/sequence-attribute";

import {expect} from "chai";
import sinon from "sinon";

describe("ImplicitDeclaration", function() {
	const name = "email";

	it("creates an instance of ImplicitDeclaration", function() {
		const fixtureRiveter = {} as FixtureRiveter;
		const fixture = {} as Fixture<any>;
		const result = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);

		expect(result).to.be.an.instanceof(ImplicitDeclaration);
		expect(result.name).to.equal(name);
		expect(result.fixtureRiveter).to.equal(fixtureRiveter);
		expect(result.fixture).to.equal(fixture);
	});

	describe("#build", function() {
		context("with a known association", function() {
			it("calls getFixture", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(true as any);
				const fixture = {} as Fixture<any>;
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				declaration.build();

				expect(fixtureRiveter.getFixture).to.be.calledOnce;
				expect(fixtureRiveter.getFixture).to.be.calledWithExactly(name, false);
			});

			it("returns an AssociationAttribute", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(true as any);

				const fixture = {} as Fixture<any>;
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				const array = declaration.build();
				const [result] = array;

				expect(array).to.be.an.instanceof(Array);
				expect(array).to.have.length(1);
				expect(result).to.be.an.instanceof(RelationAttribute);
				expect(result.name).to.equal(name);
			});

			it("does not call later functions", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(true as any);
				sinon.stub(fixtureRiveter, "findSequence").returns(false as any);

				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				sinon.stub(fixture, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				sinon.stub(declaration, "checkSelfReference").returns(false);
				declaration.build();

				expect(fixtureRiveter.findSequence).to.not.be.called;
				expect(declaration.checkSelfReference).to.not.be.called;
				expect(fixture.inheritTraits).to.not.be.called;
			});
		});

		context("with no known associations", function() {
			it("calls findSequence", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
				sinon.stub(fixtureRiveter, "findSequence").returns(true as any);
				const fixture = {} as Fixture<any>;
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				declaration.build();

				expect(fixtureRiveter.findSequence).to.be.calledOnce;
				expect(fixtureRiveter.findSequence).to.be.calledWith(name);
			});
		});

		context("with a known sequence", function() {
			it("creates a sequence attribute", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
				fixtureRiveter.sequence(name, (n: number) => `Name ${n}`);

				const fixture = {} as Fixture<any>;
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				const array = declaration.build();
				const [result] = array;

				expect(array).to.be.an.instanceof(Array);
				expect(array).to.have.length(1);
				expect(result).to.be.an.instanceof(SequenceAttribute);
				expect(result.name).to.equal(name);
			});

			it("does not call later functions", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
				sinon.stub(fixtureRiveter, "findSequence").returns(true as any);

				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				sinon.stub(fixture, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				sinon.stub(declaration, "checkSelfReference").returns(false);
				declaration.build();

				expect(declaration.checkSelfReference).to.not.be.called;
				expect(fixture.inheritTraits).to.not.be.called;
			});
		});

		context("with no known sequences", function() {
			it("calls checkSelfReference", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
				sinon.stub(fixtureRiveter, "findSequence").returns(false as any);

				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				sinon.stub(fixture, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				sinon.stub(declaration, "checkSelfReference");

				declaration.build();

				expect(declaration.checkSelfReference).to.be.called;
			});

			it("throws if checkSelfReference is true", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
				sinon.stub(fixtureRiveter, "findSequence").returns(false as any);
				const fixture = {} as Fixture<any>;
				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				sinon.stub(declaration, "checkSelfReference").returns(true);
				const fn = () => declaration.build();

				expect(fn).to.throw(`Self-referencing trait '${name}'`);
			});

			it("does not call later functions", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
				sinon.stub(fixtureRiveter, "findSequence").returns(false as any);

				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				sinon.stub(fixture, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				sinon.stub(declaration, "checkSelfReference").returns(true);
				const fn = () => declaration.build();

				expect(fn).to.throw;
				expect(fixture.inheritTraits).to.not.be.called;
			});
		});

		context("when not self-referencing", function() {
			it("inherits the name as a trait", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
				sinon.stub(fixtureRiveter, "findSequence").returns(false as any);

				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				sinon.stub(fixture, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				sinon.stub(declaration, "checkSelfReference").returns(false);

				declaration.build();

				expect(fixture.inheritTraits).to.be.called;
				expect(fixture.inheritTraits).to.be.calledWith([name]);
			});

			it("returns an empty array", function() {
				const fixtureRiveter = new FixtureRiveter();
				sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
				sinon.stub(fixtureRiveter, "findSequence").returns(false as any);

				const fixture = new Fixture(fixtureRiveter, "name", DummyModel);
				sinon.stub(fixture, "inheritTraits");

				const declaration = new ImplicitDeclaration(name, false, fixtureRiveter, fixture);
				sinon.stub(declaration, "checkSelfReference").returns(false);

				const result = declaration.build();

				expect(result).to.deep.equal([]);
			});
		});
	});
});
