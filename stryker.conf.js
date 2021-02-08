/**
 * @type {import('@stryker-mutator/api/core').StrykerOptions}
 */
module.exports = {
	packageManager: "npm",
	reporters: ["html", "progress"],
	testRunner: "mocha",
	coverageAnalysis: "perTest",
	buildCommand: 'npm run build',
	mochaOptions: {
		"config": ".mocharc.yaml",
		"spec": [ "dist/test/**/*.js"]
	},
	checkers: ["typescript"],
	tsconfigFile: "tsconfig.json",
};
