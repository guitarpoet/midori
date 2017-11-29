/**
 * The midori scss loader, will use the dependency management support of midori
 *
 * @author Jack <jack.fu@cxagroup.com>
 * @version 0.0.1
 * @date Tue Nov 21 16:19:43 2017
 */

let { getIncludePaths, getIncludePathsSync, calculateTree, stripCssExt } = require("./functions");

let deps = [];
let tree = null;
let data = null;
let processed = false;
// Using node sass
const sass = require("node-sass");

/**
 * The sass loader which will support source map
 */
const loader = function(content, map) {
    let callback = this.async();
    if(!processed) {
        getIncludePaths().then((includes) => {
            if(!tree) {
                tree = calculateTree(".", "-STD-", deps, includes);
            }

            if(!data) {
                data = [];
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
            }

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
        processed = true;
    } else {
        // Only return empty string for other require
        callback(null,"");
    }
}

/**
 * Include all files at the pitch phase
 */
loader.pitch = function(request) {
    let { issuer } = this._module;
    // Track the files as deps
    deps = [];
    // Update the processed to false to enable rebuild
    processed = false;
    let name = issuer? issuer.rawRequest: "--ANONY--";
    let path = request;
    deps.push({name, path});
}

loader.getIncludePaths = getIncludePathsSync;

module.exports = loader;
module.exports.default = loader;
