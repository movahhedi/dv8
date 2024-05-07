/* eslint-env node */

// import { defineConfig } from "cspell";
// export default defineConfig({

module.exports = {
	version: "0.2",
	ignorePaths: ["node_modules/**", "**/vendor/**", "temp/**", "dist/**", "build/**"],
	minWordLength: 4,
	allowCompoundWords: true,
	dictionaryDefinitions: [
		{
			name: "Shahab",
			path: "./.cspell/Shahab.txt",
			addWords: true,
		},
	],
	dictionaries: ["Shahab"],
	words: [],
	ignoreWords: [],
	import: [],
};

// });
