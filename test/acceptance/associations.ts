import {Model as ObjectionModel} from "objection";

import {createTable} from "../test-fixtures/define-helpers";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {FactoryBuilder} from "../../lib/factory-builder";

import {expect} from "chai";

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

describe("simple associations", function() {
	let fb: FactoryBuilder;

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

	specify("attributesFor doesn't create an association", async function() {
		const post = await fb.attributesFor("post");
		expect(post).to.be.an.instanceof(Object);
		expect(post.body).to.equal("Post body");
		expect(post.user).to.be.undefined;
	});

	specify("create creates an association", async function() {
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
