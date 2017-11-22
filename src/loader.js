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

const loader = function(content) {
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
                            data.push(`@import "${n}";`);
                        }
                    }
                }
            }
            callback(null, data.join("\n"));
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
