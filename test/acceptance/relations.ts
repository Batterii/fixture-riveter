// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Model} from "../support/model";

import {createTable} from "../support/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("Relations", function() {
	describe("simple relationships", function() {
		let fr: FixtureRiveter;

		class User extends Model {
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
			user: User;

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
		});

		beforeEach(function() {
			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
				f.attr("admin", () => false);

				f.trait("admin", (t) => {
					t.admin(() => true);
				});

				f.fixture("oldUser", (ff) => {
					ff.attr("age", () => 100);
				});
			});

			fr.fixture("post", Post, (f) => {
				f.relation("user");
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

		it("reads the fixture property", async function() {
			fr.fixture("fixturePost", Post, (f) => {
				f.relation("user", {fixture: "oldUser"});
				f.attr("body", () => "Post body");
			});

			const post = await fr.build("fixturePost");
			expect(post.user.age).to.equal(100);
		});

		it("the fixture property can be a list", async function() {
			fr.fixture("fixturePost", Post, (f) => {
				f.relation("user", {fixture: ["oldUser", "admin"]});
				f.attr("body", () => "Post body");
			});

			const post = await fr.build("fixturePost");
			expect(post.user.age).to.equal(100);
			expect(post.user.admin).to.be.true;
		});

		it("can use attributes from the current fixture", async function() {
			fr.fixture("currentAttrPost", Post, (f) => {
				f.attr("body", () => "Post body");
				f.attr("user", async(e) => e.relation("user", {name: await e.body()}));
			});

			const post = await fr.build("currentAttrPost");
			expect(post.user.name).to.equal("Post body");
		});
	});

	describe("Complex relationships", function() {
		class User extends Model {
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
						f.fixture("userWithPosts", (ff) => {
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
					f.relation("user");
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
					f.relation("user");
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
					f.relation("user", {strategy: "build"});
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

	describe("Relations with a join table", function() {
		class User extends Model {
			static relationMappings = {};

			id: number;
			name: string;
			teams?: Team[];

			get props() {
				return {
					name: "string",
				};
			}
		}

		class Team extends Model {
			static relationMappings = {};

			id: number;
			title: string;
			users?: User[];

			get props() {
				return {
					title: "string",
				};
			}
		}

		class Membership extends Model {
			static idColumn = ["teamId", "userId"];
			static relationMappings = {};

			teamId: number;
			userId: number;

			team?: Team;
			user?: User;

			get props() {
				return {
					teamId: "integer",
					userId: "integer",
				};
			}
		}

		User.relationMappings = {
			teams: {
				relation: Model.ManyToManyRelation,
				modelClass: Team,
				join: {
					from: "users.id",
					through: {
						from: "memberships.userId",
						to: "memberships.teamId",
					},
					to: "teams.id",
				},
			},
		};

		Team.relationMappings = {
			users: {
				relation: Model.ManyToManyRelation,
				modelClass: User,
				join: {
					from: "teams.id",
					through: {
						from: "memberships.teamId",
						to: "memberships.userId",
					},
					to: "users.id",
				},
			},
		};

		Membership.relationMappings = {
			team: {
				relation: Model.BelongsToOneRelation,
				modelClass: Team,
				join: {
					from: "memberships.teamId",
					to: "teams.id",
				},
			},
			user: {
				relation: Model.BelongsToOneRelation,
				modelClass: User,
				join: {
					from: "memberships.userId",
					to: "users.id",
				},
			},
		};

		let fr: FixtureRiveter;

		before(async function() {
			await createTable(User);
			await createTable(Team);
			await createTable(Membership, false);

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");

				f.transient((t) => {
					t.attr("team", () => false);
				});

				f.trait("on a team", (t) => {
					t.after("create", async(user, evaluator: any) => {
						let team = await evaluator.team();
						if (!team) {
							team = await fr.create("team");
						}

						await fr.create("membership", {user, team});
						user.$setRelated("teams", [team]);
					});
				});
			});

			fr.fixture("team", Team, (f) => {
				f.attr("title", () => "The City & The City");

				f.transient((t) => {
					t.attr("users", () => false);
					t.attr("userCount", () => 1);
				});

				f.trait("with memberships", (t) => {
					t.after("create", async(team, evaluator) => {
						let users: User[] = await evaluator.attr("users");
						const userCount: number = await evaluator.attr("userCount");

						if (!users) {
							users = await fr.createList<User>("user", userCount);
						}

						await Promise.all(users.map(async(user) => {
							return fr.create("membership", {team, user});
						}));

						team.$setRelated("users", users);
					});
				});
			});

			fr.fixture("membership", Membership, (f) => {
				f.user();
				f.team();
			});
		});

		it("works", async function() {
			const user = await fr.create<User>("user", ["on a team"]);
			expect(user.teams).to.exist.and.to.have.length(1);
			const team = await fr.create<Team>("team", ["with memberships"]);
			expect(team.users).to.exist.and.to.have.length(1);
		});
	});

	describe("not relying on built-in relation methods", function() {
		let fr: FixtureRiveter;

		class User extends Model {
			id: number;
			name: string;
			age: number;
			admin: boolean;

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
			userId: number;
			user: User;

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
		});

		beforeEach(function() {
			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
				f.attr("age", () => 32);
			});

			fr.fixture("post", Post, (f) => {
				f.attr("body", () => "Post body");
				f.attr("user", async(e) => e.relation("user"));
				f.attr("userId", async(e) => (await e.attr("user"))?.id);
			});
		});

		specify("#attributesFor doesn't create an association", async function() {
			const post = await fr.attributesFor("post");
			expect(post).to.be.an.instanceof(Object);
			expect(post.body).to.equal("Post body");
			expect(post.user).to.be.null;
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
	});


	describe("when building interrelated relations", function() {
		it("assigns the instance pass as a relation attribute", async function() {
			class Supplier extends Model {
				account: Account;
			}

			class Account extends Model {
				supplier: Supplier;
			}

			const fr = new FixtureRiveter();

			fr.fixture("supplier", Supplier);
			fr.fixture("account", Account, (f) => {
				f.supplier((e) => e.relation("supplier", {account: e.instance}));
			});

			const account = await fr.build("account");
			expect(account.supplier.account).to.equal(account);
		});

		it("connects records with interdependent relationships", async function() {
			class School extends Model {
				static relationMappings = {};
				id: number;
				students: Student[];
				profiles: Profile[];
			}

			class Student extends Model {
				static relationMappings = {};
				id: number;
				schoolId: number;
				school: School;
				profile: Profile;

				get props() {
					return {
						schoolId: "integer",
					};
				}
			}

			class Profile extends Model {
				static relationMappings = {};
				id: number;
				schoolId: number;
				school: School;
				studentId: number;
				student: Student;

				get props() {
					return {
						schoolId: "integer",
						studentId: "integer",
					};
				}
			}

			School.relationMappings = {
				students: {
					relation: Model.HasManyRelation,
					modelClass: Student,
					join: {
						from: "schools.id",
						to: "students.id",
					},
				},
				profiles: {
					relation: Model.HasManyRelation,
					modelClass: Profile,
					join: {
						from: "schools.id",
						to: "profiles.id",
					},
				},
			};

			Student.relationMappings = {
				school: {
					relation: Model.BelongsToOneRelation,
					modelClass: School,
					join: {
						from: "students.id",
						to: "schools.id",
					},
				},
				profile: {
					relation: Model.HasOneRelation,
					modelClass: Profile,
					join: {
						from: "students.id",
						to: "profiles.id",
					},
				},
			};

			Profile.relationMappings = {
				school: {
					relation: Model.BelongsToOneRelation,
					modelClass: School,
					join: {
						from: "profiles.id",
						to: "schools.id",
					},
				},
				student: {
					relation: Model.BelongsToOneRelation,
					modelClass: Student,
					join: {
						from: "profiles.id",
						to: "students.id",
					},
				},
			};

			await createTable(School);
			await createTable(Student);
			await createTable(Profile);

			const fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("student", Student, (f) => {
				f.school();
				f.profile(async(e) => e.relation(
					"profile",
					{student: e.instance, school: await e.school()},
				));
			});

			fr.fixture("profile", Profile, (f) => {
				f.school();
				f.student(async(e) => e.relation(
					"student",
					{profile: e.instance, school: await e.school()},
				));
			});

			fr.fixture("school", School);

			const student = await fr.create("student");
			expect(student.profile.school).to.equal(student.school);
			expect(student.profile.student).to.equal(student);

			const profile = await fr.create("profile");
			expect(profile.student.school).to.equal(profile.school);
			expect(profile.student.profile).to.equal(profile);
		});
	});

	describe("when building collection relations", function() {
		it("builds the relation according to the strategy", async function() {
			class Photo extends Model {
				static relationMappings = {};

				id: number;
				name: string;
				listingId: number;
				listing: Listing;

				get props() {
					return {
						name: "string",
						listingId: "integer",
					};
				}
			}

			class Listing extends Model {
				static relationMappings = {};

				id: number;
				title: string;
				photos?: Photo[];

				get props() {
					return {
						title: "string",
					};
				}
			}

			Photo.relationMappings = {
				listing: {
					relation: Model.BelongsToOneRelation,
					modelClass: Listing,
					join: {
						from: "photos.id",
						to: "listings.id",
					},
				},
			};

			Listing.relationMappings = {
				photos: {
					relation: Model.HasManyRelation,
					modelClass: Photo,
					join: {
						from: "listings.id",
						to: "photos.id",
					},
				},
			};

			await createTable(Photo);
			await createTable(Listing);

			const fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("photo", Photo);

			fr.fixture("listing", Listing, (f) => {
				f.attr("photos", async(e) => [await e.relation("photo")]);
			});

			const recordListing = await fr.attributesFor("listing");
			expect(recordListing.photos[0]).to.be.null;

			const builtListing = await fr.build("listing");
			expect(builtListing.photos[0]).to.be.an.instanceof(Photo);
			expect(builtListing.photos[0].id).to.not.exist;

			const createdListing = await fr.create("listing");
			expect(createdListing.photos[0]).to.be.an.instanceof(Photo);
			expect(createdListing.photos[0].id).to.exist;
		});
	});

	describe("overriding a relation to be null or undefined", function() {
		let fr: FixtureRiveter;

		class User extends Model {
			id: number;
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
			userId: number;
			user: User;

			get props() {
				return {
					userId: "integer",
				};
			}
		}

		before(async function() {
			await createTable(User);
			await createTable(Post);
		});

		beforeEach(function() {
			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User);

			fr.fixture("post", Post, (f) => {
				f.relation("user");
			});
		});

		specify("null is set", async function() {
			expect((await fr.build("post", {user: null})).user).to.be.null;
			expect((await fr.create("post", {user: null})).user).to.be.null;
		});

		specify("undefined is excluded", async function() {
			expect(await fr.build("post", {user: undefined})).to.not.have.property("user");
			expect(await fr.create("post", {user: undefined})).to.not.have.property("user");
		});
	});

	describe("evaluator passing", function() {
		let fr: FixtureRiveter;

		class User extends Model {
			id: number;
			name: string;
			age: number;
			admin: boolean;

			get props() {
				return {
					name: "string",
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
			subject: string;
			userId: number;
			user: User;

			get props() {
				return {
					userId: "integer",
					subject: "string",
				};
			}
		}

		class Comment extends Model {
			static relationMappings = {
				user: {
					relation: Model.BelongsToOneRelation,
					modelClass: User,
					join: {
						from: "comments.userId",
						to: "users.id",
					},
				},
				post: {
					relation: Model.BelongsToOneRelation,
					modelClass: Post,
					join: {
						from: "comments.postId",
						to: "posts.id",
					},
				},
			};

			id: number;
			userId: number;
			user: User;
			postId: number;
			post: Post;
			body: string;

			get props() {
				return {
					userId: "integer",
					postId: "integer",
					body: "string",
				};
			}
		}

		before(async function() {
			await createTable(User);
			await createTable(Post);
			await createTable(Comment);
		});

		beforeEach(function() {
			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User, (f) => {
				f.attr("name", () => "Noah");
			});

			fr.fixture("post", Post, (f) => {
				f.relation("user");
				f.attr("subject", () => "Post subject");
			});

			fr.fixture("comment", Comment, (f) => {
				f.user();
				f.post(async(e) => e.relation("post", {user: await e.user()}));
				f.postId(async(e) => (await e.post())?.id);

				f.body(() => "Comment body");
			});
		});

		specify("e.X is not a function bug", async function() {
			const comment = await fr.create("comment");

			expect(comment).to.be.an.instanceof(Comment);
			expect(comment.body).to.equal("Comment body");
			expect(comment.user).to.be.an.instanceof(User);
			expect(comment.user.name).to.equal("Noah");
			expect(comment.post).to.be.an.instanceof(Post);
			expect(comment.post.subject).to.equal("Post subject");
		});
	});
});
