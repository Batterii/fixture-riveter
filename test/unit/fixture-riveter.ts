import {DummyModel} from "../support/dummy-model";
import {Model} from "../support/model";

import {Fixture} from "../../lib/fixture";
import {extractOverrides, nameGuard, FixtureRiveter} from "../../lib/fixture-riveter";
import {Sequence} from "../../lib/sequence";

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

			expect(fixtureRiveter.fixtures.get(name)).to.equal(fixture);
		});

		it("adds the fixture by alias", function() {
			const fixtureRiveter = new FixtureRiveter();
			const name = "testFixture";
			const aliases = ["fixture1", "fixture2"];
			const fixture = new Fixture(fixtureRiveter, name, DummyModel, {aliases});

			fixtureRiveter.registerFixture(fixture);

			expect(fixtureRiveter.fixtures.get("fixture1")).to.equal(fixture);
			expect(fixtureRiveter.fixtures.get("fixture2")).to.equal(fixture);
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

			const fixture = fixtureRiveter.fixtures.get(name);

			expect(fixtureRiveter.fixtures).to.not.be.empty;
			expect(fixture).to.exist;
			expect(fixture!.name).to.equal(name);
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
			expect(fixtureRiveter.fixtures.get(name)).to.not.exist;
			fixtureRiveter.fixture("testFixture", DummyModel);
			expect(fixtureRiveter.fixtures.get(name)).to.exist;
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
			const result = Array.from(fixtureRiveter.fixtures.keys())
				.map((name: string) => fixtureRiveter.fixtures.get(name) as any)
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
			const result = fixture.fixtures.get(name);
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
			expect(Array.from(fr.sequenceHandler.sequences.keys())).to.deep.equal([name]);
			expect(fr.sequenceHandler.sequences.get(name)).to.be.an.instanceof(Sequence);
		});
	});

	describe("#findSequence", function() {
		it("returns the sequence for that name", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			const sequence = fr.sequence(name);
			expect(fr.findSequence(name)).to.equal(sequence);
		});

		it("returns undefined when sequence doesn't exist", function() {
			const fr = new FixtureRiveter();
			expect(fr.findSequence("name")).to.be.undefined;
		});
	});

	describe("#generate", function() {
		it("returns the sequence for that name", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			fr.sequence(name);
			expect(fr.generate(name)).to.equal(1);
		});

		it("returns undefined when sequence doesn't exist", function() {
			const fr = new FixtureRiveter();
			expect(fr.generate("name")).to.be.undefined;
		});
	});

	describe("#resetSequences", function() {
		it("resets all sequences", function() {
			const name = "user";
			const fr = new FixtureRiveter();
			function *g() {
				while (true) {
					yield "a";
				}
			}
			let sequenceInFixture = new Sequence("temp", g, [], () => 1);
			fr.fixture(name, DummyModel, (f) => {
				sequenceInFixture = f.sequence("email");
			});
			const globalSeq = fr.sequence("usernames");
			globalSeq.next();
			globalSeq.next();
			sequenceInFixture.next();
			sequenceInFixture.next();
			fr.resetSequences();
			expect(globalSeq.value).to.equal(1);
			expect(sequenceInFixture.value).to.equal(1);
		});
	});

	describe("#trait", function() {
		it("passes both arguments through to Trait", function() {
			const fr = new FixtureRiveter();
			const name = "email";
			const block = identity;
			fr.trait(name, block);
			const result = fr.traits.get(name) as any;

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
			const result = fixture.traits.get(name);
			expect(t).to.equal(result);
		});

		it("throws if a non-existant fixture is requested", function() {
			const fixture = new FixtureRiveter();
			fixture.trait("t", identity);
			expect(() => fixture.getTrait("f")).to.throw();
		});
	});
});
