import {Model} from "../test-fixtures/model";

import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

describe("checking various call", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		id: number;
		name: string;
		age: number;

		get props() {
			return {
				name: "string",
				age: "integer",
			};
		}
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

		get props() {
			return {
				body: "string",
				age: "integer",
			};
		}
	}

	beforeEach(async function() {
		await createTable(User);
		await createTable(Post);

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);

			f.trait("old", (t) => {
				t.attr("age", () => true);
			});
		});
	});

	describe("definition proxy", function() {
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
				f.association<User>("user", ["old"], {name: "Bogart", strategy: "create"});
			});
		});
	});

	describe("evaluator", function() {
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
				f.body((e) => e.association("user", {strategy: "create"}));
				f.body((e) => e.association("user", ["old"], {name: "Bogart"}));
				f.body((e) => e.association("user", ["old"], {strategy: "create"}));
				f.body((e) => e.association<User>("user", ["old"], {name: "Bogart"}));
				f.body((e) => {
					return e.association<User>(
						"user",
						["old"],
						{name: "Bogart", strategy: "create"},
					);
				});
			});
		});
	});
});
