const path = require("path");

module.exports = {
    entry: path.resolve(__dirname, "tests/webpack-test.js"),
    module: {
        rules: [
            {
                test: /\.scss|css$/,
                include: path.resolve(__dirname, "tests"),
                use: [
                    "style-loader",
                    "css-loader",
                    {
                        loader: "sass-loader?sourceMap",
                        options: {
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
