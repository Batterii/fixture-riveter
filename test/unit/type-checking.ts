import {Model} from "../test-fixtures/model";
import {FixtureRiveter} from "../../lib/fixture-riveter";
import {SequenceHandler} from "../../lib/sequence-handler";
import {expect} from "chai";

describe("type checking", function() {
	describe("Definition Proxy", function() {
		let fr: FixtureRiveter;

		class User extends Model {
			id: number;
			name: string;
			age: number;
		}

		class Post extends Model {
			static relationMappings = {
				user: {
					relation: Model.BelongsToOneRelation,
					modelClass: User,
					join: {
						from: "posts.userId",
						to: "users.id",
					},
				},
			};

			id: number;
			body: string;
			userId: number;
			user?: User;
		}

		beforeEach(async function() {
			fr = new FixtureRiveter();

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);

				f.trait("old", (t) => {
					t.attr("age", () => true);
				});
			});
		});

		specify("attr function signatures", function() {
			fr.fixture("post", Post, (f) => {
				f.attr("user");
				f.attr("user", ["old"]);
				f.attr<User>("user", ["old"], {name: "Bogart"});

				f.attr("body", () => "body text");
			});
		});

		specify("implicit signatures", function() {
			fr.fixture("post", Post, (f) => {
				f.user();
				f.user(["old"]);
				f.user<User>(["old"], {name: "Bogart"});

				f.body(() => "body text");
			});
		});

		specify("assocation signatures", function() {
			fr.fixture("post", Post, (f) => {
				f.association("user");
				f.association("user", ["old"]);
				f.association<User>("user", {name: "Bogart"});
				f.association("user", {strategy: "create"});
				f.association("user", ["old"], {strategy: "build"});
				f.association<User>("user", ["old"], {name: "Bogart"});
				f.association<User>("user", ["old"], {name: "Bogart", strategy: "build"});
			});
		});
	});

	describe("Evaluator", function() {
		let fr: FixtureRiveter;

		class User extends Model {
			id: number;
			name: string;
			age: number;
		}

		class Post extends Model {
			static relationMappings = {
				user: {
					relation: Model.BelongsToOneRelation,
					modelClass: User,
					join: {
						from: "posts.userId",
						to: "users.id",
					},
				},
			};

			id: number;
			body: string;
			userId: number;
			user?: User;
		}

		beforeEach(async function() {
			fr = new FixtureRiveter();

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);

				f.trait("old", (t) => {
					t.attr("age", () => true);
				});
			});
		});

		specify("attr function signatures", function() {
			fr.fixture("post", Post, (f) => {
				f.body((e) => e.attr("user"));

				// disallowed
				// f.body((e) => e.attr("user", ["old"]));
				// f.body((e) => e.attr<User>("user", {name: "Bogart"}));
			});
		});

		specify("implicit signatures", function() {
			fr.fixture("post", Post, (f) => {
				f.body((e) => e.user());

				// disallowed
				// f.body((e) => e.user(["old"]));
				// f.body((e) => e.user<User>({name: "Bogart"}));
			});
		});


		specify("association signatures", function() {
			fr.fixture("post", Post, (f) => {
				f.body((e) => e.association("user"));
				f.body((e) => e.association("user", ["old"]));
				f.body((e) => e.association("user", {name: "Bogart"}));
				f.body((e) => e.association("user", {strategy: "build"}));
				f.body((e) => e.association("user", ["old"], {name: "Bogart"}));
				f.body((e) => e.association("user", ["old"], {strategy: "build"}));
				f.body((e) => e.association<User>("user", ["old"], {name: "Bogart"}));
				f.body((e) => {
					return e.association<User>(
						"user",
						["old"],
						{name: "Bogart", strategy: "build"},
					);
				});
			});
		});
	});

	describe("FixtureRiveter", function() {
		let fr: FixtureRiveter;

		beforeEach(async function() {
			fr = new FixtureRiveter();
		});

		describe("#sequence", function() {
			specify("1 arg", function() {
				fr.sequence("email");
				expect(fr.generate("email")).to.equal(1);
			});

			specify("2 args", function() {
				fr.sequence("email1", 2);
				expect(fr.generate("email1")).to.equal(2);

				fr.sequence("email2", "b");
				expect(fr.generate("email2")).to.equal("b");

				fr.sequence("email3", ["alias3"]);
				expect(fr.generate("alias3")).to.equal(1);

				fr.sequence("email4", (n) => `test${n}@gmail.com`);
				expect(fr.generate("email4")).to.equal("test1@gmail.com");
			});

			specify("3 args", function() {
				fr.sequence("email1", 1, ["alias1"]);
				expect(fr.generate("email1")).to.equal(1);
				expect(fr.generate("alias1")).to.equal(2);

				fr.sequence("email2", 1, (n) => `test${n}@gmail.com`);
				expect(fr.generate("email2")).to.equal("test1@gmail.com");

				fr.sequence("email3", "a", ["alias3"]);
				expect(fr.generate("email3")).to.equal("a");
				expect(fr.generate("alias3")).to.equal("b");

				fr.sequence("email4", "a", (n) => `test${n}@gmail.com`);
				expect(fr.generate("email4")).to.equal("testa@gmail.com");

				fr.sequence("email5", ["alias5"], (n) => `test${n}@gmail.com`);
				expect(fr.generate("email5")).to.equal("test1@gmail.com");
				expect(fr.generate("alias5")).to.equal("test2@gmail.com");
			});

			specify("4 args", function() {
				fr.sequence("email1", 1, ["alias1"], (n) => `test${n}@gmail.com`);
				expect(fr.generate("email1")).to.equal("test1@gmail.com");
				expect(fr.generate("alias1")).to.equal("test2@gmail.com");

				fr.sequence("email2", "a", ["alias2"], (n) => `test${n}@gmail.com`);
				expect(fr.generate("email2")).to.equal("testa@gmail.com");
				expect(fr.generate("alias2")).to.equal("testb@gmail.com");
			});
		});
	});

	describe("Fixture", function() {
		let fr: FixtureRiveter;

		beforeEach(async function() {
			fr = new FixtureRiveter();
		});

		class User extends Model {
			id: number;
			email: string;
			email1: string;
			email2: string;
			email3: string;
			email4: string;
			email5: string;
		}

		describe("#sequence", function() {
			specify("1 arg", async function() {
				fr.fixture(User, (f) => {
					f.sequence("email");
				});

				const user = await fr.build(User);
				expect(user.email).to.equal(1);
			});

			specify("2 args", async function() {
				fr.fixture(User, (f) => {
					f.sequence("email1", 1);
					f.sequence("email2", "a");
					f.sequence("email3", ["alias3"]);
					f.sequence("email4", (n) => `test${n}@gmail.com`);
				});

				const user = await fr.build(User);
				expect(user.email1).to.equal(1);
				expect(user.email2).to.equal("a");
				expect(user.email3).to.equal(1);
				expect(fr.generate("alias3")).to.equal(2);
				expect(user.email4).to.equal("test1@gmail.com");
			});

			specify("3 args", async function() {
				fr.fixture(User, (f) => {
					f.sequence("email1", 1, ["alias1"]);
					f.sequence("email2", 1, (n) => `test${n}@gmail.com`);
					f.sequence("email3", "a", ["alias3"]);
					f.sequence("email4", "a", (n) => `test${n}@gmail.com`);
					f.sequence("email5", ["alias5"], (n) => `test${n}@gmail.com`);
				});

				const user = await fr.build(User);
				expect(user.email1).to.equal(1);
				expect(fr.generate("alias1")).to.equal(2);
				expect(user.email2).to.equal("test1@gmail.com");
				expect(user.email3).to.equal("a");
				expect(fr.generate("alias3")).to.equal("b");
				expect(user.email4).to.equal("testa@gmail.com");
				expect(user.email5).to.equal("test1@gmail.com");
				expect(fr.generate("alias5")).to.equal("test2@gmail.com");
			});

			specify("4 args", async function() {
				fr.fixture(User, (f) => {
					f.sequence("email1", 1, ["alias1"], (n) => `test${n}@gmail.com`);
					f.sequence("email2", "a", ["alias2"], (n) => `test${n}@gmail.com`);
				});

				const user = await fr.build(User);
				expect(user.email1).to.equal("test1@gmail.com");
				expect(fr.generate("alias1")).to.equal("test2@gmail.com");
				expect(user.email2).to.equal("testa@gmail.com");
				expect(fr.generate("alias2")).to.equal("testb@gmail.com");
			});
		});
	});

	describe("SequenceHandler", function() {
		specify("1 arg", function() {
			const seq = new SequenceHandler();
			seq.registerSequence("name");
		});

		specify("2 args", function() {
			const seq = new SequenceHandler();
			seq.registerSequence("name1", "a");
			seq.registerSequence("name2", 1);

			function *g() {
				while (true) {
					yield "a";
				}
			}
			seq.registerSequence("name3", g());
			seq.registerSequence("name4", ["alias4"]);
			seq.registerSequence("name5", (x) => `5result${x}`);
		});

		specify("3 args", function() {
			const seq = new SequenceHandler();
			seq.registerSequence("name1", "a", ["alias1"]);
			seq.registerSequence("name2", "a", (x) => `2result${x}`);
			seq.registerSequence("name3", 1, ["alias3"]);
			seq.registerSequence("name4", 1, (x) => `4result${x}`);
			seq.registerSequence("name5", ["alias5"], (x) => `5result${x}`);
		});

		specify("4 args", function() {
			const seq = new SequenceHandler();
			seq.registerSequence("name1", "a", ["alias1"], (x) => `1result${x}`);
			seq.registerSequence("name2", 1, ["alias2"], (x) => `2result${x}`);
		});
	});
});
