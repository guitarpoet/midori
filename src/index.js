#!/usr/bin/env node
'use strict';

let  { ArgumentParser } = require("argparse");
let { DependencyTreeNode, DependencyTree } = require("./dependency");

const IMPORT_PREFIX = "* @import";
const fs = require("fs");
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
            help: "The output type, can be scss or include, sass is used for global import, sass include is used for adding the module's path into scss compiler.",
            defaultValue: "scss"
        }
    );

    return parser.parseArgs();
}

const errput = (err) => {
    console.info("Error: " + err);
}

const output = (msg) => {
    console.info(msg);
}

let args = parseOptions();

const getFileContents = (path) => {
    return new Promise((resolve, reject) => {
        fs.access(path, fs.constants.R_OK | fs.constants.W_OK, (err) => {
            if(err) {
                reject(`Error: Reading file ${path} -> ${err}`);
            } else {
                fs.readFile(path, (err, data) => {
                    if(err) {
                        reject(`Error: Reading file ${module} -> ${err}`);
                    } else {
                        resolve(data);
                    }
                });
            }
        });
    });
}

const getFileContentsSync = (path) => {
    if(fs.existsSync(path)) {
        return fs.readFileSync(path);
    }
    return false;
}

const getIncludePaths = (args) => {
    return new Promise((resolve, reject) => {
        let module = args.package_config;
        return getFileContents(module).then(data => {
            let include = args.include || [];
            let includePaths = [];

            let config = JSON.parse(data);
            if(include) {
                // Let's add the include paths first
                for(let i of include) {
                    includePaths.push(i);
                }
            }

            // Update the config to the scss part of the package.json
            config = config.scss;

            // Then, let's add module's paths
            for(let p in config) {
                let m = config[p];
                if(m && m.path) {
                    includePaths.push(m.path);
                }
            }
            resolve(includePaths);
        });
    });
}

const getImportsSync = (file) => {
    let data = getFileContentsSync(file);
    let imports = [];
    new String(data).split("\n").map((line) => {
        let code = line.trim();
        if(code.indexOf(IMPORT_PREFIX) === 0) {
            let d = code.substring(IMPORT_PREFIX.length).trim();
            d.split(",").map((e) => {
                imports.push(e.trim());
            });
        }
    });
    return imports;
}

const getImports = (file) => {
    return new Promise((resolve, reject) => {
        return getFileContents(file).then(data => {
            let imports = [];
            new String(data).split("\n").map((line) => {
                let code = line.trim();
                if(code.indexOf(IMPORT_PREFIX) === 0) {
                    let d = code.substring(IMPORT_PREFIX.length).trim();
                    d.split(",").map((e) => {
                        imports.push(e.trim());
                    });
                }
            });
            resolve(imports);
        });
    });
}

const generateImportNames = (imp) => {
    let files = [];
    let first = imp.shift();
    if(imp.length) {
        for(let name of generateImportNames(imp)) {
            files.push(`_${first}/${name}`);
            files.push(`${first}/${name}`);
        }
    } else {
        files = ["_" + first, first];
    }
    return files;
}

const resolveImportFiles = (imp, includes) => {
    let files = generateImportNames(imp);
    for(let i of includes) {
        for(let file of files) {
            for(let ext of ["scss", "sass", "css"]) {
                let path = `${i}/${file}.${ext}`;
                if(fs.existsSync(path)) {
                    return path;
                }
            }
        }
    }
	console.error("Can't find any files.", files, includes);
    return false;
}

const calculateTree = (name, dependencies, includes, tree) => {
    if(dependencies) {
        // Add the dependencies first
        for(let d of dependencies) {
            let imports = getImportsSync(d.path);

            if(imports) {
                calculateTree(d.name, getDependencies(d.path, includes), includes, tree);
            }
        }
    }

    // Add the node into it at last
    tree.addNode(name, dependencies);
}

const getDependencies = (file, includes) => {
    return getImportsSync(file).map(i => {
        return { name: i, path: resolveImportFiles(i.split("/"), includes) }
    }).filter(f => f.path);
}

const scss = (args) => {
    getIncludePaths(args).then((includes) => {
        if(!args.file) {
            errput(`Must input the file that needs to be processed`);
        } else {
            let tree = new DependencyTree();
            calculateTree(".", getDependencies(args.file, includes), includes, tree );
            let layers = tree.layers();
            for(let p in layers) {
                if(p !== "0") {
                    for(let n of layers[p]) {
                        if(n != ".") {
                            output(`@import "${n}";`);
                        }
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

let functions = {
    scss, include
};

let type = args["output_type"];
let func = functions[type];

if(func) {
    func(args);
} else {
    output(`Can't find output type ${type}`);
}
