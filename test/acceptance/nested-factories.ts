import {Model} from "../test-fixtures/model";
import {FixtureRiveter} from "../../lib/fixture-riveter";

import {expect} from "chai";

describe("Nested factories", function() {
	let fr: FixtureRiveter;

	class User extends Model {
		static tableName = "users";
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
					User,
					(f2) => {
						f2.execute2(() => 20);
						f2.execute3(() => 3);

						f2.fixture(
							"parent",
							User,
							(f3) => {
								f3.execute3(() => 30);
								f3.execute4(() => 4);

								f3.fixture(
									"child",
									User,
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
});
