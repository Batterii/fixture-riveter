// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at https://mozilla.org/MPL/2.0/.

import {Model} from "../support/model";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("Nested fixtures", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		execute1: number;
		execute2: number;
		execute3: number;
		execute4: number;
		execute5: number;
	}

	beforeEach(async function() {
		fr = new FixtureRiveter();
	});

	it("applies attributes from parent attribute", async function() {
		fr.fixture(
			"great-grand-parent",
			User,
			(f1) => {
				f1.execute1(() => 1);
				f1.execute2(() => 2);

				f1.fixture(
					"grand-parent",
					(f2) => {
						f2.execute2(() => 20);
						f2.execute3(() => 3);

						f2.fixture(
							"parent",
							(f3) => {
								f3.execute3(() => 30);
								f3.execute4(() => 4);

								f3.fixture(
									"child",
									(f4) => {
										f4.execute4(() => 40);
										f4.execute5(() => 5);
									},
								);
							},
						);
					},
				);
			},
		);
		const result = await fr.attributesFor("child");

		expect(result).to.deep.equal({
			execute1: 1,
			execute2: 20,
			execute3: 30,
			execute4: 40,
			execute5: 5,
		});
	});

	class Author extends User {
		execute6: number;
	}

	class GhostWriter extends Author {
		static tableName: "ghostWriters";
		execute7: number;
	}

	it("handles changing class", async function() {
		fr.fixture("user", User, (f) => {
			f.execute1(() => 1);

			f.fixture("author", {model: Author}, (a) => {
				a.execute6(() => 6);

				a.fixture(GhostWriter, (as) => {
					as.execute7(() => 7);
				});
			});
		});

		const author = await fr.attributesFor("author");
		const ghostWriter = await fr.attributesFor("ghostWriters");

		expect(author).to.deep.equal({
			execute1: 1,
			execute6: 6,
		});

		expect(ghostWriter).to.deep.equal({
			execute1: 1,
			execute6: 6,
			execute7: 7,
		});
	});
});
