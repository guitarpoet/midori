/**
 * The midori scss loader, will use the dependency management support of midori
 *
 * @author Jack <jack.fu@cxagroup.com>
 * @version 0.0.1
 * @date Tue Nov 21 16:19:43 2017
 */

let { getIncludePaths, getIncludePathsSync, calculateTree } = require("./functions");

let deps = [];
let processed = false;
// Using node sass
const sass = require("node-sass");

const stripCssExt = (name) => {
    let index = name.lastIndexOf(".scss");

    if(index == -1) {
        // This is not the scss file let's check if it is a css file
        index = name.lastIndexOf(".css");
    }

    if(index != -1) {
        name = name.substring(0, index);
    }
    return name;
}

/**
 * The sass loader which will support source map
 */
const loader = function(content, map) {
    let callback = this.async();
    if(!processed) {
        getIncludePaths().then((includes) => {
            let tree = calculateTree(".", "-STD-", deps, includes);

            let data = [];
            let layers = tree.layers();
            for(let p in layers) {
                if(p !== "0") {
                    for(let n of layers[p]) {
                        if(n != "-STD-") {
                            n = stripCssExt(n);
                            data.push(`@import "${n}";`);
                        }
                    }
                }
            }
            return getIncludePaths().then((includePaths) => {
                data = data.join("\n");
                let sourceMapContents = true;
                let sourceMap = "./sass.map";

                let omitSourceMapUrl = true;
                sass.render({
                    data,
                    sourceMap,
                    includePaths,
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
    // Track the files as deps
    if(this._module.issuer) {
        let name = this._module.issuer.rawRequest;
        let path = request;
        deps.push({name, path});
    }
}

loader.getIncludePaths = getIncludePathsSync;

module.exports = loader;
module.exports.default = loader;
