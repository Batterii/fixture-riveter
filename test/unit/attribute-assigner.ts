import {FixtureRiveter} from "../../lib/fixture-riveter";
import {ObjectionAdapter} from "../../lib/adapters/objection-adapter";
import {Model} from "../support/model";
import {createTable} from "../support/define-helpers";

import {expect} from "chai";

describe("attribute-assigner", function() {
	describe("oveerriding attributes with null and undefined", function() {
		let fr: FixtureRiveter;

		class User extends Model {
			id: number;
			name: string;

			get props() {
				return {name: "string"};
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
				f.name(() => "Noah");
			});

			fr.fixture("post", Post, (f) => {
				f.relation("user");
			});
		});

		describe("relations set to null or undefined are set to undefined", function() {
			specify("build", async function() {
				expect((await fr.build("post", {user: null})).user).to.be.undefined;
				expect((await fr.build("post", {user: undefined})).user).to.be.undefined;
			});

			specify("create", async function() {
				expect((await fr.create("post", {user: null})).user).to.be.undefined;
				expect((await fr.create("post", {user: undefined})).user).to.be.undefined;
			});
		});

		describe("attributes set to null or undefined are changed to undefined", function() {
			specify("attributesFor", async function() {
				expect((await fr.attributesFor("user", {name: null})).name).to.be.undefined;
				expect((await fr.attributesFor("user", {name: undefined})).name).to.be.undefined;
			});

			specify("build", async function() {
				expect((await fr.build("user", {name: null})).name).to.be.undefined;
				expect((await fr.build("user", {name: undefined})).name).to.be.undefined;
			});

			specify("create", async function() {
				expect((await fr.create("user", {name: null})).name).to.be.null;
				expect((await fr.create("user", {name: undefined})).name).to.be.null;
			});
		});
	});
});
