// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Sequelize, Model, DataTypes} from "sequelize";

import {SequelizeAdapter} from "../../../lib/adapters/sequelize-adapter";
import {FixtureRiveter} from "../../../lib/fixture-riveter";

import {expect} from "chai";

describe("Sequelize functionality", function() {
	const sequelize = new Sequelize("sqlite::memory:", {logging: false});

	class User extends Model {}
	class Post extends Model {}

	User.init({
		name: DataTypes.STRING,
		age: DataTypes.INTEGER,
	}, {
		sequelize,
		modelName: "user",
		tableName: "users",
		timestamps: false,
	});

	Post.init({
		title: DataTypes.STRING,
		userId: {
			type: DataTypes.INTEGER,
			field: "user_id",
			references: {
				model: User,
				key: "id",
			},
		},
	}, {
		sequelize,
		modelName: "post",
		tableName: "posts",
		timestamps: false,
	});

	Post.belongsTo(User);
	User.hasMany(Post);

	describe("simple relations", function() {
		let fr: FixtureRiveter;

		before(async function() {
			await sequelize.sync({force: true});

			fr = new FixtureRiveter();
			fr.setAdapter(new SequelizeAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});
			fr.fixture("post", Post, (f) => {
				f.relation("user");
				f.attr("title", () => "Post title");
			});
		});

		specify("#create creates an relation", async function() {
			const post = await fr.create("post");
			const user = await post.getUser();

			expect(post).to.be.an.instanceof(Post);
			expect(post.title).to.equal("Post title");
			expect(user).to.be.an.instanceof(User);
			expect(user.name).to.equal("Noah");
		});

		specify("null or undefined relation overrides are not set", async function() {
			expect((await fr.build("post", {user: null})).get("user")).to.be.undefined;
			expect((await fr.create("post", {user: null})).get("user")).to.be.undefined;

			expect((await fr.build("post", {user: undefined})).get("user")).to.be.undefined;
			expect((await fr.create("post", {user: undefined})).get("user")).to.be.undefined;
		});

		specify("null attribute overrides are set correctly", async function() {
			expect((await fr.attributesFor("user", {name: null})).name).to.be.null;
			expect((await fr.build("user", {name: null})).get("name")).to.be.null;
			expect((await fr.create("user", {name: null})).get("name")).to.be.null;
		});

		specify("undefined attribute overrides are not set", async function() {
			expect(await fr.attributesFor("user", {name: undefined})).to.not.have.property("name");
			expect((await fr.build("user", {name: undefined})).get("name")).to.be.undefined;
			expect((await fr.create("user", {name: undefined})).get("name")).to.be.undefined;
		});
	});

	describe(
		"multiple creates and transient attributes to dynamically build attribute list",
		function() {
			let fr: FixtureRiveter;

			before(async function() {
				await sequelize.sync({force: true});

				fr = new FixtureRiveter();
				fr.setAdapter(new SequelizeAdapter());

				fr.fixture("user", User, (f) => {
					f.attr("name", () => "Noah");
					f.fixture("userWithPosts", (ff) => {
						ff.transient((t) => {
							t.attr("postCount", () => 5);
						});

						ff.after("create", async(user: any, evaluator) => {
							const posts = await fr.createList(
								"post",
								await evaluator.attr("postCount"),
								{user},
							);
							await user.addPosts(posts);
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
				const posts = await user.getPosts();
				expect(posts).to.have.length(5);
			});

			it("allows the number of posts to be modified", async function() {
				const user = await fr.create("userWithPosts", {postCount: 2});
				const posts = await user.getPosts();
				expect(posts).to.have.length(2);
			});
		},
	);

	describe.skip("a created instance, with strategy build", function() {
		let fr: FixtureRiveter;

		before(async function() {
			await sequelize.sync({force: true});

			fr = new FixtureRiveter();
			fr.setAdapter(new SequelizeAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});

			fr.fixture("post", Post, (f) => {
				f.attr("title", () => "The City & The City");
				f.relation("user", {strategy: "build"});
			});
		});

		it(
			"saves associations (strategy: :build only affects build, not create)",
			async function() {
				const post = await fr.create("post");
				const user = await post.getUser();

				expect(user).to.be.an.instanceof(User);
				expect(user.id).to.exist;
			},
		);
	});
});
