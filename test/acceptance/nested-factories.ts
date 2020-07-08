import {FixtureRiveter} from "../../lib/fixture-riveter";
import {DefinitionProxy} from "../../lib/definition-proxy";

import {expect} from "chai";
import {defineModel} from "../test-fixtures/define-helpers";

describe("Nested factories", function() {
	let fr: FixtureRiveter;
	let User: any;

	beforeEach(async function() {
		fr = new FixtureRiveter();
		User = await defineModel("User", {
			execute1: "integer",
			execute2: "integer",
			execute3: "integer",
			execute4: "integer",
			execute5: "integer",
		});
	});

	it("applies attributes from parent attribute", async function() {
		fr.fixture(
			"great-grand-parent",
			User,
			(f1) => {
				f1.attr("execute1", () => 1);
				f1.attr("execute2", () => 2);

				f1.fixture(
					"grand-parent",
					User,
					(f2) => {
						f2.attr("execute2", () => 20);
						f2.attr("execute3", () => 3);

						f2.fixture(
							"parent",
							User,
							(f3) => {
								f3.attr("execute3", () => 30);
								f3.attr("execute4", () => 4);

								f3.fixture(
									"child",
									User,
									(f4) => {
										f4.attr("execute4", () => 40);
										f4.attr("execute5", () => 5);
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
