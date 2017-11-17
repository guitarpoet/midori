class DependencyTreeNode {
	constructor(name, dependencies = [], parents = []) {
		this.name = name;
		this.dependencies = dependencies;
		this._children = [];
		if(parents) {
			// Add this node to all of its parents
			this.parents = parents;
			for(let p of parents) {
				p.addChild(this);
			}
		}
	}

    level() {
        let level = 0;
        if(this.parents && this.parents.length) {
            for(let p of this.parents) {
                let l = p.level() + 1;
                if(l > level) {
                    level = l;
                }
            }
        }
        return level;
    }

	getChildren() {
		return this._children;
	}

	exists(name) {
		// Test if it is in the child fisrt
		let cc = this.childExists(name);
		if(cc) {
			return cc;
		}

		for(let c of this.getChildren()) {
			cc = c.exists(name);
			if(cc) {
				// It is exists in the child
				return cc;
			}
		}
		return false;
	}

	childExists(name) {
		if(name) {
			for(let c of this.getChildren()) {
				if(c.name == name) {
					return c;
				}
			}
		}
		return false;
	}

	addChild(child) {
		if(child) {
			if(!this.childExists(child)) {
				this.getChildren().push(child);
				return true;
			}
		}
		return false;
	}

    show(output) {
        let o = "";

        for(let i = 0; i <= this.level(); i++) {
            o += " ";
        }
        output(`${o} ${this.name} ${this.level()}`);

        for(let c of this.getChildren()) {
            c.show(output);
        }
    }

    layers(map) {
        let level = this.level();
        if(!map[level]) {
            map[level] = [];
        }
        let exists = false;

        for(let e of map[level]) {
            if(e == this.name) {
                exists = true;
                break;
            }
        }

        if(!exists) {
            // Add this to current layer
            map[level].push(this.name);
        }

        for(let c of this.getChildren()) {
            // Add child to the layers
            c.layers(map);
        }
        return map;
    }
}

class DependencyTree {
	constructor() {
		this.root = new DependencyTreeNode("ROOT");
	}

	resolve(name) {
		return this.root.exists(name);
	}

	addNode(name, dependencies) {
		// Let's find if this node is already added
		let node = this.resolve(name);
		if(node) {
			// We already have it, skip it
			return false;
		}

		let parents = [];
		if(dependencies) {
            dependencies.map(f => {
                let n = this.resolve(f.name);
                if(n) {
                    parents.push(n);
                }
            });

		}
        if(!parents.length) {
            // If no parent is here, let's add it into the root
            parents = [this.root];
        }

		new DependencyTreeNode(name, dependencies, parents);
	}

    layers() {
        return this.root.layers({});
    }

    show(output) {
        this.root.show(output);
    }
}

module.exports = { DependencyTreeNode, DependencyTree };
