import {fr} from "../../lib/index";
import {expect} from "chai";
import fs from "fs-extra";
import {resolve} from "path";

function fixtureFile(dir: string) {
	return `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const {fr} = require("${dir}/lib/index");

class User {}

fr.fixture("user", User, (f) => {
	f.name(() => "Noah");
	f.age(() => 30 + Math.floor(Math.random() * 10));
	f.sequence("email", "a", (s) => ("example-" + s + "@email.com"));
});
`;
}

describe("#loadFixtures", function() {
	beforeEach(function() {
		fr.fixtures = new Map();
		fr.instances = [];
	});

	after(async function() {
		await fs.remove(resolve(".", "fixtures"));
		await fs.remove(resolve(".", "test", "support", "fixtures"));
	});

	it("defaults to node's '.'", async function() {
		const dirPath = resolve(".", "fixtures");
		await fs.ensureDir(dirPath);
		const filepath = resolve(".", "fixtures/user-fixture.js");
		await fs.writeFile(filepath, fixtureFile(".."));

		await fr.loadFixtures();
		const user = await fr.build("user");
		expect(user).to.exist;
	});

	it("accepts a file path", async function() {
		const dirPath = resolve(".", "test/support/fixtures");
		await fs.ensureDir(dirPath);
		const filepath = resolve(".", "test/support/fixtures/user-fixture.js");
		await fs.writeFile(filepath, fixtureFile("../../.."));

		await fr.loadFixtures("test/support");
		const user = await fr.build("user");
		expect(user).to.exist;
	});
});
