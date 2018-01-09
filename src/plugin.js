class MidoriPlugin {
    constructor(options = {}) {
        this.options = options;
    }

    findModule(name) {
        return global._midori_modules_data[name];
    }

    addModule(module) {
        let m = {
            name: module,
            dependencies: []
        };
        global._midori_modules_data[module] = m;
        return m;
    }

    addDependency(module, dependency = null) {
        if(!global._midori_modules_data) {
            // Lazy global moudles
            global._midori_modules_data = {};
        }

        let m = this.findModule(module);
        if(!m) {
            // We don't have the module in the modules, let's add it
            m = this.addModule(module);
        }

        // Only add the dependency if there is one
        if(dependency) {
            // Add the dependecy to the module's dependecy first
            m.dependencies.push(dependency);

            // Add the dependency to the module data if there isn't one
            if(this.findModule(dependency)) {
                this.addModule(dependency);
            }
        }
    }

    apply(compiler) {
        // Let's register the module and its depdencies
        global.modules = {};

        // We are at the compilation process
        compiler.plugin("compilation", (compilation) => {
            if(compilation.compiler.isChild()) return;
            compilation.plugin("midori-dep-hook", (module, dependencies) => {

                // Let's get the pure dependencies first
                let plainDependencies = dependencies.map(d => d.filter(i => i.request).map(i => i.request)).filter(i => i.length);

                plainDependencies.map(d => d.map(i => {
                    if(i.indexOf("!") == -1) {
                        // Only resolve the one that won't have loader things
                        compiler.resolvers.normal.resolve({}, module.context, i, (err, path) => {
                            if(!err) {
                                this.addDependency(module.resource, path);
                            }
                        });
                    }
                }));
            });
        });
    }
}

module.exports = MidoriPlugin;
