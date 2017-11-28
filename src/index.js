#!/usr/bin/env node
'use strict';

let  { ArgumentParser } = require("argparse");
let {errput, output, getIncludePaths, getDependencyLayers, getDependencyTree, stripCssExt} = require("./functions");

const parseOptions = () => {

	let parser = new ArgumentParser({
		version: "0.0.1",
		addHelp:true,
		description: "The auto dependency generator for sass"
	});

	parser.addArgument(
		[ "-I", "--include" ],
		{
			help: "The include path, seperated by space",
			nargs: "+"
		}
	);

	parser.addArgument(
		[ "-p", "--package-config" ],
		{
			help: "The path to get the package configuration",
			defaultValue: "package.json"
		}
	);

	parser.addArgument(
		[ "-f", "--file" ],
		{
			help: "The file to parse"
		}
	);

	parser.addArgument(
		[ "-o", "--output-type" ],
		{
			help: "The output type, can be scss or include, sass is used for global import, sass include is used for adding the module's path into scss compiler, txt is for showing the dependency tree as text.",
			defaultValue: "scss"
		}
	);

	return parser.parseArgs();
}

let args = parseOptions();

const scss = (args) => {
	getDependencyLayers(args).then((layers) => {
		for(let p in layers) {
			if(p !== "0") {
				for(let n of layers[p]) {
					if(n != ".") {
                        let pp = stripCssExt(n);
						output(`@import "${pp}";`);
					}
				}
			}
		}
	}).catch((err) => {
		errput(err);
	});
}

const include = (args) => {
	getIncludePaths(args).then((paths) => {
		output("-I " + paths.join(" -I "));
	}).catch((err) => {
		errput(err);
	});
}

const txt = (args) => {
	getDependencyTree(args).then((tree) => {
		tree.show(output);
	});
}

let functions = {
	scss, include, txt
};

let type = args["output_type"];
let func = functions[type];

if(func) {
	func(args);
} else {
	output(`Can't find output type ${type}`);
}
