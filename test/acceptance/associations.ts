import {Model as ObjectionModel} from "objection";

import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

describe("simple associations", function() {
	let fb: FactoryBuilder;

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
		});

		await createTable(Post, {
			userId: "integer",
			body: "string",
		});

		fb = new FactoryBuilder();
		fb.setAdapter(new ObjectionAdapter());

		fb.define(function() {
			fb.factory("user", User, (f: any) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});
			fb.factory("post", Post, (f: any) => {
				f.association("user");
				f.attr("body", () => "Post body");
			});
		});
	});

	specify("#attributesFor doesn't create an association", async function() {
		const post = await fb.attributesFor("post");
		expect(post).to.be.an.instanceof(Object);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.undefined;
	});

	specify("#build creates an association", async function() {
		const post = await fb.build("post");
		expect(post).to.be.an.instanceof(Object);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.an.instanceof(User);
		expect(post.user.name).to.equal("Noah");
		expect(post.user.id).to.be.undefined;
	});

	specify("#create creates an association", async function() {
		const post = await fb.create("post");

		expect(post).to.be.an.instanceof(Post);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.an.instanceof(User);
		expect(post.user.name).to.equal("Noah");

		const model = await User.query().findById(post.userId);
		expect(model.id).to.equal(post.userId);
		expect(model.id).to.equal(post.user.id);
	});
});

describe("Complex associations", function() {
	class User extends ObjectionModel {
		static tableName = "users";
		static relationMappings = {};

		id: number;
		name: string;
		age: number;
	}

	class Post extends ObjectionModel {
		static tableName = "posts";
		static relationMappings = {};

		id: number;
		title: string;
		userId: number;
		user?: User;
	}

	User.relationMappings = {
		posts: {
			relation: ObjectionModel.HasManyRelation,
			modelClass: Post,
			join: {
				from: "users.id",
				to: "posts.userId",
			},
		},
	};

	Post.relationMappings = {
		user: {
			relation: ObjectionModel.BelongsToOneRelation,
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
			let fb: FactoryBuilder;

			before(async function() {
				await createTable(User, {
					name: "string",
					age: "integer",
				});

				await createTable(Post, {
					userId: "integer",
					title: "string",
				});

				fb = new FactoryBuilder();
				fb.setAdapter(new ObjectionAdapter());

				fb.define(function() {
					fb.factory("user", User, (f: any) => {
						f.attr("name", () => "Noah");
						f.factory("userWithPosts", User, (ff: any) => {
							ff.transient((t) => {
								t.attr("postCount", () => 5);
							});

							ff.after("create", async(user, evaluator) => {
								const posts = await fb.createList(
									"post",
									await evaluator.attr("postCount"),
									{user},
								);
								await user.$appendRelated("posts", posts);
							});
						});
					});
					fb.factory("post", Post, (f: any) => {
						f.attr("title", () => "The City & The City");
						f.attr("user");
					});
				});
			});

			it("generates the correct number of posts", async function() {
				const user = await fb.create("userWithPosts");
				expect(user.posts).to.have.length(5);
			});

			it("allows the number of posts to be modified", async function() {
				const user = await fb.create("userWithPosts", {postCount: 2});
				expect(user.posts).to.have.length(2);
			});
		},
	);

	describe("a created instance, with strategy build", function() {
		let fb: FactoryBuilder;

		before(async function() {
			await createTable(User, {
				name: "string",
				age: "integer",
			});

			await createTable(Post, {
				userId: "integer",
				title: "string",
			});

			fb = new FactoryBuilder();
			fb.setAdapter(new ObjectionAdapter());

			fb.define(function() {
				fb.factory("user", User, (f) => {
					f.attr("name", () => "Noah");
					f.attr("age", () => 32);
				});

				fb.factory("post", Post, (f) => {
					f.attr("title", () => "The City & The City");
					f.association("user", {strategy: "build"});
				});
			});
		});

		it("saves associations (strategy: build only affects build, not create)", async function() {
			const post = await fb.create("post");

			expect(post.user).to.be.an.instanceof(User);
			expect(post.user.id).to.exist;
		});
	});
});
