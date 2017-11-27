/**
 * The basic functions
 *
 * @author Jack <jack.fu@cxagroup.com>
 * @version 0.0.1
 * @date Tue Nov 21 17:17:36 2017
 */

const IMPORT_PREFIX = "* @import";
const fs = require("fs");
let path_resolve = require("path").resolve;
let { isArray } = require("underscore");
let { DependencyTreeNode, DependencyTree } = require("./dependency");

/**
 * The global include paths
 */
let globalIncludePaths = ["node_modules", ".", "node_modules/midori"];

/**
 * Merge the arraies
 */
function arrayMerge() {
    let ret = [];
    Array.from(arguments).map(a => {
        if(isArray(a)) {
            for(let i of a) {
                ret.push(i);
            }
        } else {
            ret.push(a);
        }
    });
    return ret;
}

/**
 * Set and get the global include paths, will append them after the default
 * global include paths.
 *
 * Will skip the path if the path is alreay in the paths
 */
const setGlobalIncludePaths = (arr = []) => {
    if(globalIncludePaths.length == 3) {
        // We didn't insert the NODE_PATH into it
        if(process.env.NODE_PATH) {
            process.env.NODE_PATH.split(":").map(i => globalIncludePaths.push(i));
        }
    }
    if(arr && arr.length) {
        // Update the global include paths if arr is not empty
        globalIncludePaths = arrayMerge(globalIncludePaths, arr.filter(i => globalIncludePaths.indexOf(i) == -1));
    }
    return globalIncludePaths;
}

const errput = (err) => {
    console.info("Error: " + err);
}

const output = (msg) => {
    console.info(msg);
}

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

const getIncludePathsSync = (args = { package_config: "package.json" }) => {
    let module = args.package_config;
    let data = getFileContentsSync(module);
    // Added current folder and the node modules folder by default
    let includePaths = setGlobalIncludePaths();
    if(data) {
        let include = args.include || [];

        let includePaths = setGlobalIncludePaths(include);
        let config = JSON.parse(data);

        // Update the config to the scss part of the package.json
        config = config.scss;

        if(config) {
            // Then, let's add module's paths
            for(let p in config) {
                let m = config[p];
                if(m && m.path) {
                    includePaths.push(m.path);
                }
            }
        }
    }
    return includePaths;
}

const getIncludePaths = (args = { package_config: "package.json" }) => {
    return new Promise((resolve, reject) => {
        let module = args.package_config;
        return getFileContents(module).then(data => {
            let include = args.include || [];
            // Added current folder and the node modules folder by default
            let includePaths = setGlobalIncludePaths(include);

            let config = JSON.parse(data);
            // Update the config to the scss part of the package.json
            config = config.scss;

            if(config) {
                // Then, let's add module's paths
                for(let p in config) {
                    let m = config[p];
                    if(m && m.path) {
                        includePaths.push(m.path);
                    }
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
                    return path_resolve(path);
                }
            }
        }
    }
    console.error("Can't find any files.", files, includes);
    return false;
}

const calculateTree = (name, path, dependencies, includes, tree) => {
    if(tree == null) {
        tree = new DependencyTree();
    }

    if(name.indexOf("(") != -1) {
        // This is the pattern of xxx(xxx xxx xxx) force dependency mode
        let data = name.replace(")", "").split("(");
        // Recalculate the name
        name = data[0];

        // Add the force dependency to the dependencies
        data[1].split(" ").map(item => {
            dependencies.push({ name: item.trim(), path: resolveImportFiles(item.trim().split("/"), includes) });
        });
    }

    if(dependencies) {
        // Add the dependencies first
        for(let d of dependencies) {
            let imports = getImportsSync(d.path);

            if(imports) {
                calculateTree(d.name, d.path, getDependencies(d.path, includes), includes, tree);
            }
        }
    }

    // Add the node into it at last
    tree.addNode(name, path, dependencies);
    return tree;
}

const getDependencyTree = (args) => {
    return new Promise((resolve, reject) => {
        return getIncludePaths(args).then((includes) => {
            if(!args.file) {
                reject(`Must input the file that needs to be processed`);
            } else {
                // TODO, maybe we should guess what module name of current module using the package.json?
                // Using "." for place holder now.
                resolve(calculateTree(".", path_resolve(args.file), getDependencies(args.file, includes), includes));
            }
        });
    });
}

const getDependencyLayers = (args) => {
    return new Promise((resolve, reject) => {
        return getDependencyTree(args).then(tree => resolve(tree.layers()));
    });
}

const getDependencies = (file, includes) => {
    return getImportsSync(file).map(i => {
        let filePath = i;
        if(filePath.indexOf("(") != -1) {
            filePath = filePath.split("(")[0];
        }
        return { name: i, path: resolveImportFiles(filePath.split("/"), includes) }
    }).filter(f => f.path);
}

module.exports = {errput, output, getIncludePaths, calculateTree, getDependencies, getDependencyLayers, getDependencyTree, getIncludePathsSync, setGlobalIncludePaths};
