const path = require("path");
let { getIncludePaths, MidoriPlugin } = require("./src/loader");

let includePaths = getIncludePaths();

module.exports = {
	devtool: "source-map",
	entry: {
        test: path.resolve(__dirname, "tests/webpack-test.js"),
        another:  path.resolve(__dirname, "tests/webpack-test-again.js")
    },
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
    plugins: [
        new MidoriPlugin()
    ],
	output: {
		path: path.resolve(__dirname, "tests/output"),
		filename: "[name]-bundle.js"
	}
};
