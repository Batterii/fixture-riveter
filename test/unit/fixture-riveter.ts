import {DummyModel} from "../test-fixtures/dummy-model";
import {Model} from "../test-fixtures/model";

import {Fixture} from "../../lib/fixture";
import {extractOverrides, nameGuard, FixtureRiveter} from "../../lib/fixture-riveter";
import {Sequence} from "../../lib/sequences/sequence";
import {IntegerSequence} from "../../lib/sequences/integer-sequence";

import {identity} from "lodash";
import {expect} from "chai";

describe("extractAttributes", function() {
	it("returns an empty object", function() {
		const array = [1, 2, 3];
		const result = extractOverrides(array);
		expect(array).to.deep.equal([1, 2, 3]);
		expect(result).to.deep.equal({});
	});

	it("returns the array at the end", function() {
		const array = [1, 2, 3, {parent: "parent"}];
		const result = extractOverrides(array);
		expect(array).to.deep.equal([1, 2, 3]);
		expect(result).to.deep.equal({parent: "parent"});
	});
});

describe("nameGuard", function() {
	it("accepts strings", function() {
		expect(nameGuard("name")).to.equal("name");
	});

	it("accepts ObjectionModels", function() {
		// eslint-disable-next-line @typescript-eslint/no-extraneous-class
		class User extends Model {}
		expect(nameGuard(User)).to.equal(User.tableName);
	});

	it("accepts classes", function() {
		expect(nameGuard(DummyModel)).to.equal(DummyModel.name);
	});
});

describe("FixtureRiveter", function() {
	it("can be built", function() {
		const fixtureRiveter = new FixtureRiveter();
		expect(fixtureRiveter).to.exist;
		expect(fixtureRiveter.fixtures).to.exist.and.to.be.empty;
	});

	it("#getAdapter");
	it("#setAdapter");
	it("#define");

	describe("#registerFixture", function() {
		it("adds the fixture by name", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			const fixture = new Fixture(fixtureRiveter, name, DummyModel);

			fixtureRiveter.registerFixture(fixture);

			expect(fixtureRiveter.fixtures[name]).to.equal(fixture);
		});

		it("adds the fixture by alias", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			const aliases = ["fixture1", "fixture2"];
			const fixture = new Fixture(fixtureRiveter, name, DummyModel, {aliases});

			fixtureRiveter.registerFixture(fixture);

			expect(fixtureRiveter.fixtures[aliases[0]]).to.equal(fixture);
			expect(fixtureRiveter.fixtures[aliases[1]]).to.equal(fixture);
		});

		it("adds the same fixture multiples times", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "fixture1";
			const alias = "fixture2";
			const fixture = new Fixture(fixtureRiveter, name, DummyModel, {aliases: [alias]});

			fixtureRiveter.registerFixture(fixture);

			const {fixtures} = fixtureRiveter;

			expect(fixtures[name]).to.deep.equal(fixtures[alias]);
		});
	});

	describe("#fixture", function() {
		it("creates a fixture", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			fixtureRiveter.fixture(name, DummyModel);

			const fixture = fixtureRiveter.fixtures[name];

			expect(fixtureRiveter.fixtures).to.not.be.empty;
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
			const name = "testFixture";
			expect(fixtureRiveter.fixtures[name]).to.not.exist;
			fixtureRiveter.fixture("testFixture", DummyModel);
			expect(fixtureRiveter.fixtures[name]).to.exist;
		});

		it("doesn't register a fixture twice", function() {
			const fixtureRiveter = new FixtureRiveter();
			const testFn = () => {
				fixtureRiveter.fixture("testFixture", DummyModel);
			};
			testFn();
			expect(testFn).to.throw();
		});

		it("creates child fixtures", function() {
			const fixtureRiveter = new FixtureRiveter();
			fixtureRiveter.fixture("user", DummyModel, (f) => {
				f.fixture("oldUser", DummyModel);
			});
			const result = Object
				.keys(fixtureRiveter.fixtures)
				.map((name: string) => fixtureRiveter.fixtures[name])
				.map((f) => f.name);
			expect(result).to.deep.equal(["user", "oldUser"]);
		});
	});

	describe("#getFixture", function() {
		it("returns the requested fixture", function() {
			const name = "name";
			const fixture = new FixtureRiveter();
			fixture.fixture(name, DummyModel);
			const t = fixture.getFixture(name);
			const result = fixture.fixtures[name];
			expect(t).to.equal(result);
		});

		it("throws if a non-existant fixture is requested", function() {
			const fixture = new FixtureRiveter();
			fixture.fixture("t", DummyModel);
			expect(() => fixture.getFixture("f")).to.throw();
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
	});

	describe("#resetSequences", function() {
		it("resets all sequences", function() {
			const name = "user";
			const fr = new FixtureRiveter();
			let sequenceInFixture = new IntegerSequence("temp");
			fr.fixture(name, DummyModel, (f) => {
				sequenceInFixture = f.sequence("email") as IntegerSequence;
			});
			const globalSeq = fr.sequence("usernames") as IntegerSequence;
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
