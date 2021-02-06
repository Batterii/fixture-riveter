const config = {
	lang: "en-US",
	title: "fixture-riveter",
	description: "A fixture replacement library",
	base: "/fixture-riveter/",

	themeConfig: {
		repo: "Batterii/fixture-riveter",

		docsDir: "docs",
		editLinkPattern: ":repo/edit/:branch/:path",

		navbar: [
			{
				text: "Getting Started",
				link: "/tutorial/",
			},
			{
				text: "Guide",
				link: "/guide/",
			},
			{
				text: "API",
				link: "/api/",
			},
			{
				text: "Design Notes",
				link: "/notes/",
			},
			{
				text: "Release Notes",
				link: "/changelog/",
			},
		],

		sidebar: {
			"/tutorial/": [
				{
					isGroup: true,
					text: "Introduction",
					children: [
						"/tutorial/README.md",
					],
				},
			],
			"/guide/": [
				{
					isGroup: true,
					text: "Guides",
					children: [
						"/guide/README.md",
						"/guide/defining-fixtures.md",
						"/guide/using-fixtures.md",
						"/guide/sequences.md",
						"/guide/relations.md",
						"/guide/traits.md",
					],
				},
			],
			"/api/": [
				{
					isGroup: true,
					text: "API Reference",
					children: [],
				},
			],
			"/notes/": [
				{
					isGroup: true,
					text: "Design Notes",
					children: [
						"/notes/README.md",
						"/notes/differences-from-factory-bot.md",
						"/notes/reasons-for-name.md",
					],
				},
			],
			"/changelog/": [
				{
					isGroup: true,
					text: "Release Notes",
					children: [
						"/changelog/README.md",
					],
				},
			],
		},
	},
};

export = config;
