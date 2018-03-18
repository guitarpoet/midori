/**
 * The midori scss loader, will use the dependency management support of midori
 *
 * @author Jack <jack.fu@cxagroup.com>
 * @version 0.0.1
 * @date Tue Nov 21 16:19:43 2017
 */

const { getIncludePaths, getIncludePathsSync, calculateTree, stripCssExt, saveImportCache, getRootRequest } = require("./functions");
const { keys, values, isArray } = require("lodash");
const MidoriPlugin = require("./plugin");

let deps = {};
let tree = null;
let processed = null;

// Using node sass
const sass = require("node-sass");

const getEntries = (context) => {
    // Get the entries first
    let { options: { entry } } = context;

    // Get the entries
    return values(entry);
}

const getDepends = (module) => {
    if(isArray(module) && module.length > 1) {
        // We are in the dev server now
        module = module[1];
    }
    let map = {};
    // Let's get the dependes now
    let m = global._midori_modules_data[module];
    if(m && m.dependencies) {
        for(let d of m.dependencies) {
            // Add the dependency first
            map[d] = 1;
            // Then, let's add the deps of the dependency
            for(let dd of getDepends(d)) {
                map[dd] = 1;
            }
        }
    }
    return keys(map).filter(i => i.indexOf("scss") != -1 || i.indexOf("sass") != -1);
}

/**
 * The sass loader which will support source map
 */
const loader = function(content, map) {
    let callback = this.async();
    let entries = getEntries(this._compilation);

    let { _module: { resource } } = this;

    let success = false;
    entries.map(e => {
        if(success) {
            return;
        }
        let deps = getDepends(e);
        if(deps.indexOf(resource) != -1) {
            if(!processed[e]) {
                // Only do the process when it is not processed
                processed[e] = true;
                getIncludePaths().then((includes) => {
                    if(!tree) {
                        tree = calculateTree(".", "-STD-", deps.map(path => { return { name:path, path:path} }), includes);
                    }

                    // Let's save the import cache then
                    saveImportCache();

                    let data = [];
                    let layers = tree.layers();
                    for(let p in layers) {
                        if(p !== "0") {
                            for(let n of layers[p]) {
                                if(n != "-STD-") {
                                    this.dependency(n);
                                    n = stripCssExt(n);
                                    data.push(`@import "${n}";`);
                                }
                            }
                        }
                    }
                    data = data.join("\n");

                    let sourceMapContents = true;
                    let sourceMap = "./sass.map";

                    let omitSourceMapUrl = true;
                    sass.render({
                        data,
                        sourceMap,
                        includes,
                        sourceMapContents,
                        omitSourceMapUrl
                    }, (err, result) => {
                        if(err) {
                            callback(err);
                        } else {
                            // Remove the data after the build to avoid the out of memory
                            delete data;
                            data = null; // Force update it again
                            let {map} = result;
                            if(map) {
                                map = JSON.parse(map);
                                delete map.file;
                                map.sources[0] = "--midori-generated--";
                            } else {
                                map = {};
                            }
                            callback(null, result.css, map);
                        }
                    });
                }).catch(callback);
            } else {
                // Only return empty string for other require
                callback(null,"");
            }
            success = true;
        }
    });
}

loader.pitch = () => {
    processed = {};
}

loader.getIncludePaths = getIncludePathsSync;
loader.__midori__ = true;
loader.MidoriPlugin = MidoriPlugin;

module.exports = loader;
module.exports.default = loader;
