import {DummyModel} from "../test-fixtures/dummy-model";

import {DefaultAdapter} from "../../lib/adapters/default-adapter";
import {Fixture} from "../../lib/fixture";
import {extractAttributes, FixtureRiveter} from "../../lib/fixture-riveter";
import {Sequence} from "../../lib/sequences/sequence";
import {IntegerSequence} from "../../lib/sequences/integer-sequence";
import {Trait} from "../../lib/trait";

import {identity} from "lodash";
import {expect} from "chai";
import sinon from "sinon";

describe("extractAttributes", function() {
	it("returns an empty object", function() {
		const array = [1, 2, 3];
		const result = extractAttributes(array);
		expect(array).to.deep.equal([1, 2, 3]);
		expect(result).to.deep.equal({});
	});

	it("returns the array at the end", function() {
		const array = [1, 2, 3, {parent: "parent"}];
		const result = extractAttributes(array);
		expect(array).to.deep.equal([1, 2, 3]);
		expect(result).to.deep.equal({parent: "parent"});
	});
});

describe("FixtureRiveter", function() {
	it("can be built", function() {
		const fixtureRiveter = new FixtureRiveter();
		expect(fixtureRiveter).to.exist;
		expect(fixtureRiveter.factories).to.exist.and.to.be.empty;
	});

	describe("#getAdapter", function() {
		it("passes the call down", function() {
			const fixtureRiveter = new FixtureRiveter();
			sinon.stub(fixtureRiveter.adapterHandler, "getAdapter").returns("test");
			const result = fixtureRiveter.getAdapter("value");
			const {getAdapter} = fixtureRiveter.adapterHandler;

			expect(result).to.deep.equal("test");
			expect(getAdapter).to.be.calledOnce;
			expect(getAdapter).to.be.calledWithExactly("value");
		});
	});

	describe("#setAdapter", function() {
		it("passes the call down", function() {
			const fixtureRiveter = new FixtureRiveter();
			sinon.stub(fixtureRiveter.adapterHandler, "setAdapter").returns("test");
			const defaultAdapter = new DefaultAdapter();
			const result = fixtureRiveter.setAdapter(defaultAdapter, "value");
			const {setAdapter} = fixtureRiveter.adapterHandler;

			expect(result).to.deep.equal("test");
			expect(setAdapter).to.be.calledOnce;
			expect(setAdapter).to.be.calledWithExactly(defaultAdapter, "value");
		});
	});

	describe("#define", function() {
		it("calls the block immediately", function() {
			const fixtureRiveter = new FixtureRiveter();
			const testArray = ["test"] as any;
			fixtureRiveter.factories = testArray;

			expect(fixtureRiveter.factories).to.deep.equal(testArray);
		});
	});

	describe("#registerFixture", function() {
		it("adds the fixture by name", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			const fixture = new Fixture(fixtureRiveter, name, DummyModel);

			fixtureRiveter.registerFixture(fixture);

			expect(fixtureRiveter.factories[name]).to.equal(fixture);
		});

		it("adds the fixture by alias", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			const aliases = ["fixture1", "fixture2"];
			const fixture = new Fixture(fixtureRiveter, name, DummyModel, {aliases});

			fixtureRiveter.registerFixture(fixture);

			expect(fixtureRiveter.factories[aliases[0]]).to.equal(fixture);
			expect(fixtureRiveter.factories[aliases[1]]).to.equal(fixture);
		});

		it("adds the same fixture multiples times", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "fixture1";
			const alias = "fixture2";
			const fixture = new Fixture(fixtureRiveter, name, DummyModel, {aliases: [alias]});

			fixtureRiveter.registerFixture(fixture);

			const {factories} = fixtureRiveter;

			expect(factories[name]).to.deep.equal(factories[alias]);
		});
	});

	describe("#fixture", function() {
		it("creates a fixture", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			fixtureRiveter.fixture(name, DummyModel);

			const fixture = fixtureRiveter.factories[name];

			expect(fixtureRiveter.factories).to.not.be.empty;
			expect(fixture).to.exist;
			expect(fixture.name).to.equal(name);
		});

		it("returns the created fixture", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			const fixture = fixtureRiveter.fixture(name, DummyModel);

			expect(fixture.name).to.equal(name);
		});

		it("passes the options down to the fixture", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			const aliases = ["fixture1", "fixture2"];
			const fixture = fixtureRiveter.fixture(name, DummyModel, {aliases});

			expect(fixture.aliases).to.deep.equal(aliases);
		});

		it("registers the fixture", function() {
			const fixtureRiveter = new FixtureRiveter();
			const spy = sinon.spy(fixtureRiveter as any, "registerFixture");
			sinon.stub(fixtureRiveter, "getFixture").returns(false as any);
			fixtureRiveter.fixture("testFixture", DummyModel);

			expect(spy.calledOnce).to.be.true;
		});

		it("doesn't register a fixture twice", function() {
			const fixtureRiveter = new FixtureRiveter();
			const testFn = () => {
				fixtureRiveter.fixture("testFixture", DummyModel);
			};

			testFn();

			expect(testFn).to.throw();
		});

		it("creates child factories", function() {
			const fixtureRiveter = new FixtureRiveter();
			fixtureRiveter.fixture("user", DummyModel, (f: any) => {
				f.fixture("oldUser", DummyModel);
			});
			const result = Object
				.keys(fixtureRiveter.factories)
				.map((name: string) => fixtureRiveter.factories[name])
				.map((f: Fixture) => f.name);
			expect(result).to.deep.equal(["user", "oldUser"]);
		});
	});

	describe("#getFixture", function() {
		it("returns the requested fixture", function() {
			const name = "name";
			const fixture = new FixtureRiveter();
			fixture.fixture(name, DummyModel);
			const t = fixture.getFixture(name);
			const result = fixture.factories[name];
			expect(t).to.equal(result);
		});

		it("throws if a non-existant fixture is requested", function() {
			const fixture = new FixtureRiveter();
			fixture.fixture("t", DummyModel);
			expect(() => fixture.getFixture("f")).to.throw();
		});
	});

	describe("#attributesFor", function() {
		it("calls run correctly", async function() {
			const fr = new FixtureRiveter();
			const name = "name";
			sinon.stub(fr, "run").resolves({});
			await fr.attributesFor(name);
			expect(fr.run).to.be.calledOnceWith(name, "attributesFor", []);
		});
	});

	describe("#build", function() {
		it("calls run correctly", async function() {
			const fr = new FixtureRiveter();
			const name = "name";
			sinon.stub(fr, "run").resolves({});
			await fr.build(name);
			expect(fr.run).to.be.calledOnceWith(name, "build", []);
		});
	});

	describe("#create", function() {
		it("calls run correctly", async function() {
			const fr = new FixtureRiveter();
			const name = "name";
			sinon.stub(fr, "run").resolves({});
			await fr.create(name);
			expect(fr.run).to.be.calledOnceWith(name, "create", []);
		});
	});


	describe("#sequence", function() {
		it("returns the created sequence", function() {
			const fr = new FixtureRiveter();
			const result = fr.sequence("email");
			expect(result).to.be.an.instanceof(Sequence);
		});

		it("adds the sequence as an attribute", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			fr.sequence(name);
			expect(fr.sequenceHandler.sequences).to.be.length(1);
			expect(fr.sequenceHandler.sequences[0].name).to.equal(name);
		});

		it("delegates sequence creation to sequenceHandler", function() {
			const fr = new FixtureRiveter();
			sinon.spy(fr.sequenceHandler, "registerSequence");
			const name = "email";
			fr.sequence(name);

			expect(fr.sequenceHandler.registerSequence).to.be.calledOnce;
			expect(fr.sequenceHandler.registerSequence).to.be.calledOnceWithExactly(name);
		});
	});

	describe("#resetSequences", function() {
		it("resets all sequences", function() {
			const name = "user";
			const fr = new FixtureRiveter();
			let sequenceInFixture = new IntegerSequence("temp");
			fr.fixture(name, DummyModel, (f: any) => {
				sequenceInFixture = f.sequence("email") as IntegerSequence;
			});
			const globalSeq: any = fr.sequence("usernames");
			globalSeq.next();
			globalSeq.next();
			sequenceInFixture.next();
			sequenceInFixture.next();
			fr.resetSequences();
			expect(globalSeq.index).to.equal(1);
			expect(sequenceInFixture.index).to.equal(1);
		});
	});

	describe("#trait", function() {
		it("passes both arguments through to Trait", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			const block = identity;
			fr.trait(name, block);
			const result = fr.traits[name];

			expect(result.name).to.equal(name);
			expect(result.block).to.equal(block);
		});
	});

	describe("#getTrait", function() {
		it("returns the requested fixture", function() {
			const name = "name";
			const fixture = new FixtureRiveter();
			fixture.trait(name, identity);
			const t = fixture.getTrait(name);
			const result = fixture.traits[name];
			expect(t).to.equal(result);
		});

		it("throws if a non-existant fixture is requested", function() {
			const fixture = new FixtureRiveter();
			fixture.trait("t", identity);
			expect(() => fixture.getTrait("f")).to.throw();
		});
	});
});
