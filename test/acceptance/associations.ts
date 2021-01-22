import {Model} from "../test-fixtures/model";

import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("simple associations", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		static tableName = "users";
		id: number;
		name: string;
		age: number;
		admin: boolean;

		get props() {
			return {
				name: "string",
				age: "integer",
				admin: "boolean",
			};
		}
	}

	class Post extends Model {
		static tableName = "posts";
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
		userId: number;
		user?: User;

		get props() {
			return {
				userId: "integer",
				body: "string",
			};
		}
	}

	before(async function() {
		await createTable(User);

		await createTable(Post);

		fr = new FixtureRiveter();
		fr.setAdapter(new ObjectionAdapter());

		fr.fixture("user", User, (f) => {
			f.attr("name", () => "Noah");
			f.attr("age", () => 32);
			f.attr("admin", () => false);

			f.trait("admin", (t) => {
				t.admin(() => true);
			});
		});

		fr.fixture("post", Post, (f) => {
			f.association("user");
			f.attr("body", () => "Post body");

			f.trait("admin", (t) => {
				t.user(["admin"]);
			});

			f.trait("old admin", (t) => {
				t.user<User>(["admin"], {age: 100});
			});
		});
	});

	specify("#attributesFor doesn't create an association", async function() {
		const post = await fr.attributesFor("post");
		expect(post).to.be.an.instanceof(Object);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.undefined;
	});

	specify("#build creates an association", async function() {
		const post = await fr.build("post");
		expect(post).to.be.an.instanceof(Object);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.an.instanceof(User);
		expect(post.user.name).to.equal("Noah");
		expect(post.user.id).to.be.undefined;
	});

	specify("#create creates an association", async function() {
		const post = await fr.create("post");

		expect(post).to.be.an.instanceof(Post);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.an.instanceof(User);
		expect(post.user.name).to.equal("Noah");

		const model = await User.query().findById(post.userId);
		expect(model.id).to.equal(post.userId);
		expect(model.id).to.equal(post.user.id);
	});

	it("can handle traits and overrides", async function() {
		const post = await fr.build("post", ["old admin"]);

		expect(post.user.age).to.equal(100);
		expect(post.user.admin).to.be.true;
	});
});

describe("Complex associations", function() {
	class User extends Model {
		static tableName = "users";
		static relationMappings = {};

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
		static tableName = "posts";
		static relationMappings = {};

		id: number;
		title: string;
		userId: number;
		user?: User;

		get props() {
			return {
				userId: "integer",
				title: "string",
			};
		}
	}

	User.relationMappings = {
		posts: {
			relation: Model.HasManyRelation,
			modelClass: Post,
			join: {
				from: "users.id",
				to: "posts.userId",
			},
		},
	};

	Post.relationMappings = {
		user: {
			relation: Model.BelongsToOneRelation,
			modelClass: User,
			join: {
				from: "posts.userId",
				to: "users.id",
			},
		},
	};

	describe(
		"multiple creates and transient attributes to dynamically build attribute list",
		function() {
			let fr: FixtureRiveter;

			before(async function() {
				await createTable(User);

				await createTable(Post);

				fr = new FixtureRiveter();
				fr.setAdapter(new ObjectionAdapter());

				fr.fixture("user", User, (f) => {
					f.attr("name", () => "Noah");
					f.fixture("userWithPosts", User, (ff) => {
						ff.transient((t) => {
							t.attr("postCount", () => 5);
						});

						ff.after("create", async(user, evaluator) => {
							const posts = await fr.createList<Post>(
								"post",
								await evaluator.attr("postCount"),
								{user},
							);
							user.$appendRelated("posts", posts);
						});
					});
				});
				fr.fixture("post", Post, (f) => {
					f.attr("title", () => "The City & The City");
					f.attr("user");
				});
			});

			it("generates the correct number of posts", async function() {
				const user = await fr.create("userWithPosts");
				expect(user.posts).to.have.length(5);
			});

			it("allows the number of posts to be modified", async function() {
				const user = await fr.create("userWithPosts", {postCount: 2});
				expect(user.posts).to.have.length(2);
			});
		},
	);

	describe("association strategy stuff", function() {
		let fr: FixtureRiveter;

		beforeEach(async function() {
			await createTable(User);
			await createTable(Post);

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});
		});

		it("default is the same build strategy as parent", async function() {
			fr.fixture("post", Post, (f) => {
				f.attr("title", () => "The City & The City");
				f.association("user");
			});

			const post1 = await fr.build("post");
			expect(post1.id).to.be.undefined;
			expect(post1.user).to.be.an.instanceof(User);
			expect(post1.user.id).to.be.undefined;

			const post2 = await fr.create("post");
			expect(post2.id).to.exist;
			expect(post2.user).to.be.an.instanceof(User);
			expect(post2.user.id).to.exist;
		});

		it("useParentStragety defaults to create", async function() {
			fr.fixture("post", Post, (f) => {
				f.attr("title", () => "The City & The City");
				f.association("user");
			});

			fr.useParentStrategy = false;

			const post1 = await fr.build("post");
			expect(post1.id).to.be.undefined;
			expect(post1.user).to.be.an.instanceof(User);
			expect(post1.user.id).to.exist;

			const post2 = await fr.create("post");
			expect(post2.id).to.exist;
			expect(post2.user).to.be.an.instanceof(User);
			expect(post2.user.id).to.exist;
		});

		it("association strategy overrides useParentStrategy", async function() {
			fr.fixture("post", Post, (f) => {
				f.attr("title", () => "The City & The City");
				f.association("user", {strategy: "build"});
			});

			fr.useParentStrategy = false;

			const post1 = await fr.build("post");
			expect(post1.id).to.be.undefined;
			expect(post1.user).to.be.an.instanceof(User);
			expect(post1.user.id).to.be.undefined;

			const post2 = await fr.create("post");
			expect(post2.id).to.exist;
			expect(post2.user).to.be.an.instanceof(User);
			expect(post2.user.id).to.be.undefined;
		});
	});
});
