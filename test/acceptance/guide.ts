import {defineModel} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe.only("All of the code from the guide", function() {
	let fr: FixtureRiveter;
	let User: any;
	let Post: any;

	describe("Overview", function() {
		specify("example", async function() {
			User = await defineModel("User", {
				name: "string",
				age: "integer",
				email: "string",
			});

			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			fr.fixture("user", User, (f: any) => {
				f.attr("name", () => "Noah");
				f.age(() => 32);
				f.sequence("email", (n: any) => `test${n}@example.com`);
			});

			const user = await fr.create("user", {name: "Bogart"});

			expect(user).to.be.an.instanceof(User);
			expect(user.id).to.exist;
			expect(user.name).to.equal("Bogart");
			expect(user.age).to.equal(32);
			expect(user.email).to.equal("test1@example.com");
		});
	});

	describe("Defining fixtures", function() {
		before(async function() {
			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());

			Post = await defineModel("Post", {
				title: "string",
				body: "string",
				sequence: "string",
			});

			fr.fixture("post", Post, (f: any) => {
				f.attr("title", () => "First post!");
				f.body(() => "Thank you for reading.");
				f.attr("sequence", () => "12345");
			});

			User = await defineModel("User", {
				firstName: "string",
				lastName: "string",
				email: "string",
			});

			fr.fixture("user", User, (f: any) => {
				f.firstName(() => "Noah");
				f.email(async(e: any) => {
					// Attributes can be referenced explicitly
					const firstName = await e.attr("firstName");
					// or implicitly, just like in a definition
					const lastName = await e.lastName();
					return `${firstName}-${lastName}@example.com`.toLowerCase();
				});
				f.lastName(() => "Bogart");
			});

			fr.fixture("contextUser", User, function() {
				// eslint-disable-next-line no-invalid-this
				this.firstName(() => "Noah");
				// eslint-disable-next-line no-invalid-this
				this.lastName(() => "Bogart");
				// eslint-disable-next-line no-invalid-this
				this.email(async function() {
					// eslint-disable-next-line no-invalid-this
					const firstName = await this.firstName();
					// eslint-disable-next-line no-invalid-this
					const lastName = await this.lastName();
					return `${firstName}-${lastName}@example.com`.toLowerCase();
				});
			});
		});

		specify("Explicit vs Implicit", async function() {
			const post = await fr.create("post");

			expect(post.title).to.equal("First post!");
			expect(post.body).to.equal("Thank you for reading.");
			expect(post.sequence).to.equal("12345");
		});

		specify("Dependent attributes", async function() {
			const user = await fr.create("user");
			expect(user.email).to.equal("noah-bogart@example.com");
		});

		specify("Argument passing vs Context", async function() {
			const user = await fr.create("contextUser");
			expect(user.email).to.equal("noah-bogart@example.com");
		});
	});

	describe("Using fixtures", function() {
		beforeEach(async function() {
			fr = new FixtureRiveter();
			fr.setAdapter(new ObjectionAdapter());
			Post = await defineModel("Post", {title: "string"});
			fr.fixture("post", Post, (f: any) => f.title(() => "First post!"));
		});

		specify("attributesFor", async function() {
			const post = await fr.attributesFor("post");
			expect(post).to.not.be.an.instanceof(Post);
		});

		specify("build", async function() {
			const post = await fr.build("post");
			expect(post).to.be.an.instanceof(Post);
			expect(post.id).to.be.undefined;
		});

		specify("create", async function() {
			const post = await fr.create("post");
			expect(post).to.be.an.instanceof(Post);
			expect(post.id).to.exist;
		});

		specify("overriding attributes", async function() {
			const post = await fr.build("post", {title: "The best post in the universe"});
			expect(post.title).to.equal("The best post in the universe");
		});

		specify("transient attributes", async function() {
			User = await defineModel("User", {name: "string"});

			fr.fixture("user", User, (f) => {
				f.transient((t: any) => {
					t.attr("cool", () => false);
				});

				f.attr("name", async(user: any) => {
					let cool = "";
					if (await user.attr("cool")) cool = '"The Coolest Dude"';
					return `Noah ${cool} Bogart`;
				});
			});

			const user = await fr.build("user", {cool: true});
			expect(user.name).to.equal('Noah "The Coolest Dude" Bogart');
			expect(Reflect.has(user, "cool")).to.be.false;
		});

		specify("transient attribute with callbacks", async function() {
			User = await defineModel("User", {name: "string"});

			fr.fixture("user", User, (f: any) => {
				f.transient((t: any) => {
					t.attr("cool", () => false);
				});

				f.name(() => "Noah Bogart");

				f.after("build", async(user: any, evaluator: any) => {
					let cool = "";
					if (await evaluator.attr("cool")) cool = '"The Coolest Dude"';
					const [first, last] = user.name.split(" ");
					user.name = [first, cool, last].join(" ");
				});
			});

			const user = await fr.build("user", {cool: true});
			expect(user.name).to.equal('Noah "The Coolest Dude" Bogart');
			expect(Reflect.has(user, "cool")).to.be.false;
		});
	});
});
