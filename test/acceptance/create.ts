import {Model as ObjectionModel} from "objection";
import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("#create", function() {
	let fr: FixtureRiveter;

	class User extends ObjectionModel {
		static tableName = "users";
		id: number;
		name: string;
		age: number;
		email: string;
	}

	before(async function() {
		await createTable(User, {
			name: "string",
			age: "integer",
			email: "string",
		});

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);
		});
	});

	it("inserts into the database", async function() {
		const user = await fr.create("user", {name: "Bogart"});

		expect(user.id).to.exist;
		expect(user.name).to.equal("Bogart");
		expect(user.email).to.equal("test1@foo.bar");
		expect(user).to.be.an.instanceof(User);

		const model = await User.query().findById(user.id);
		expect(model.id).to.equal(user.id);
	});
});

describe("a created instance, with strategy build", function() {
	let fr: FixtureRiveter;

	class User extends ObjectionModel {
		static tableName = "users";
		id: number;
		name: string;
		age: number;
	}

	class Post extends ObjectionModel {
		static tableName = "posts";
		static relationMappings = {
			user: {
				relation: ObjectionModel.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: "posts.userId",
					to: "users.id",
				},
			},
		};

		id: number;
		userId: number;
		user?: User;
	}

	before(async function() {
		await createTable(User, {
			name: "string",
			age: "integer",
			email: "string",
		});
		await createTable(Post, {userId: "integer"});

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.sequence("email", (n) => `test${n}@foo.bar`);
		});

		fr.fixture("post", Post, (f) => {
			f.association("user", {strategy: "build"});
		});
	});

	it("saves associations (strategy: :build only affects build, not create)", async function() {
		const post = await fr.create("post");
		expect(post.user).to.be.an.instanceof(User);
		expect(post.user.id).to.exist;
	});
});
