import {Sequelize, Model, DataTypes} from "sequelize";

import {SequelizeAdapter} from "../../../lib/adapters/sequelize-adapter";
import {FactoryBuilder} from "../../../lib/factory-builder";

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

	describe("simple associations", function() {
		let fb: FactoryBuilder;

		before(async function() {
			await sequelize.sync({force: true});

			fb = new FactoryBuilder();
			fb.setAdapter(new SequelizeAdapter());

			fb.define(function() {
				fb.factory("user", User, (f: any) => {
					f.attr("name", () => "Noah");
					f.attr("age", () => 32);
				});
				fb.factory("post", Post, (f: any) => {
					f.association("user");
					f.attr("title", () => "Post title");
				});
			});
		});

		specify("#create creates an association", async function() {
			const post = await fb.create("post");
			const user = await post.getUser();

			expect(post).to.be.an.instanceof(Post);
			expect(post.title).to.equal("Post title");
			expect(user).to.be.an.instanceof(User);
			expect(user.name).to.equal("Noah");
		});
	});

	describe(
		"multiple creates and transient attributes to dynamically build attribute list",
		function() {
			let fb: FactoryBuilder;

			before(async function() {
				await sequelize.sync({force: true});

				fb = new FactoryBuilder();
				fb.setAdapter(new SequelizeAdapter());

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
								await user.addPosts(posts);
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
				const posts = await user.getPosts();
				expect(posts).to.have.length(5);
			});

			it("allows the number of posts to be modified", async function() {
				const user = await fb.create("userWithPosts", {postCount: 2});
				const posts = await user.getPosts();
				expect(posts).to.have.length(2);
			});
		},
	);

	describe.skip("a created instance, with strategy build", function() {
		let fb: FactoryBuilder;

		before(async function() {
			await sequelize.sync({force: true});

			fb = new FactoryBuilder();
			fb.setAdapter(new SequelizeAdapter());

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

		it("saves associations (strategy: :build only affects build, not create)", async function() {
			const post = await fb.create("post");
			const user = await post.getUser();

			expect(user).to.be.an.instanceof(User);
			expect(user.id).to.exist;
		});
	});
});
