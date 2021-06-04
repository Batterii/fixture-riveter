// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Model} from "../support/model";
import {FixtureRiveter} from "../../lib/fixture-riveter";
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
				f.relation("user");
				f.relation("user", ["old"]);
				f.relation<User>("user", {name: "Bogart"});
				f.relation("user", {strategy: "create"});
				f.relation("user", ["old"], {strategy: "build"});
				f.relation<User>("user", ["old"], {name: "Bogart"});
				f.relation<User>("user", ["old"], {name: "Bogart", strategy: "build"});
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
				f.body((e) => e.relation("user"));
				f.body((e) => e.relation("user", ["old"]));
				f.body((e) => e.relation("user", {name: "Bogart"}));
				f.body((e) => e.relation("user", {strategy: "build"}));
				f.body((e) => e.relation("user", ["old"], {name: "Bogart"}));
				f.body((e) => e.relation("user", ["old"], {strategy: "build"}));
				f.body((e) => e.relation<User>("user", ["old"], {name: "Bogart"}));
				f.body((e) => {
					return e.relation<User>(
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

				fr.sequence("email3", {aliases: ["alias3"]});
				expect(fr.generate("alias3")).to.equal(1);

				fr.sequence("email4", (n) => `test${n}@gmail.com`);
				expect(fr.generate("email4")).to.equal("test1@gmail.com");
			});

			specify("3 args", function() {
				fr.sequence("email1", 1, {aliases: ["alias1"]});
				expect(fr.generate("email1")).to.equal(1);
				expect(fr.generate("alias1")).to.equal(2);

				fr.sequence("email2", 1, (n) => `test${n}@gmail.com`);
				expect(fr.generate("email2")).to.equal("test1@gmail.com");

				fr.sequence("email3", "a", {aliases: ["alias3"]});
				expect(fr.generate("email3")).to.equal("a");
				expect(fr.generate("alias3")).to.equal("b");

				fr.sequence("email4", "a", (n) => `test${n}@gmail.com`);
				expect(fr.generate("email4")).to.equal("testa@gmail.com");

				fr.sequence("email5", {aliases: ["alias5"]}, (n) => `test${n}@gmail.com`);
				expect(fr.generate("email5")).to.equal("test1@gmail.com");
				expect(fr.generate("alias5")).to.equal("test2@gmail.com");
			});

			specify("4 args", function() {
				fr.sequence("email1", 1, {aliases: ["alias1"]}, (n) => `test${n}@gmail.com`);
				expect(fr.generate("email1")).to.equal("test1@gmail.com");
				expect(fr.generate("alias1")).to.equal("test2@gmail.com");

				fr.sequence("email2", "a", {aliases: ["alias2"]}, (n) => `test${n}@gmail.com`);
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
				function *g() {
					while (true) {
						yield "X";
					}
				}

				fr.fixture(User, (f) => {
					f.sequence("email1", 1);
					f.sequence("email2", "a");
					f.sequence("email3", (n) => `test${n}@gmail.com`);
					f.sequence("email4", g);
				});

				const user = await fr.build(User);
				expect(user.email1).to.equal(1);
				expect(user.email2).to.equal("a");
				expect(user.email3).to.equal("test1@gmail.com");
				expect(user.email4).to.equal("X");
			});

			specify("3 args", async function() {
				function *g() {
					while (true) {
						yield "X";
					}
				}

				fr.fixture(User, (f) => {
					f.sequence("email1", 1, (n) => `test${n}@gmail.com`);
					f.sequence("email2", "a", (n) => `test${n}@gmail.com`);
					f.sequence("email3", g, (n) => `test${n}@gmail.com`);
				});

				const user = await fr.build(User);
				expect(user.email1).to.equal("test1@gmail.com");
				expect(user.email2).to.equal("testa@gmail.com");
				expect(user.email3).to.equal("testX@gmail.com");
			});
		});
	});
});
