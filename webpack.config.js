const path = require("path");
let { getIncludePaths } = require("./src/loader");

let includePaths = getIncludePaths();

module.exports = {
	devtool: "source-map",
	entry: path.resolve(__dirname, "tests/webpack-test.js"),
	module: {
		rules: [
			{
				test: /\.jsx|js$/,
				exclude: /(node_modules)/,
				include: path.join(__dirname, "src"),
				use: {
					loader: "babel-loader",
					options: {
						cacheDirectory: true,
					}
				},
			},
			{
				test: /\.scss|css$/,
				include: path.resolve(__dirname, "tests"),
				use: [
					"style-loader",
					{
						loader: "css-loader",
						options: {
							sourceMap: true,
							modules: true,
							importLoaders: 1,
							localIdentName: '[name]-[local]___[hash:base64:5]'
						}
					},
					"./src/loader"
				]
			}
		]
	},
	output: {
		path: path.resolve(__dirname, "tests"),
		filename: "webpack-test-bundle.js"
	}
};
