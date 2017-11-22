/**
 * The dependency tree algorithms for the scss processing.
 *
 * @author Jack <jack.fu@cxagroup.com>
 * @version 0.0.1
 * @date Wed Nov 22 10:43:27 2017
 */

class DependencyTreeNode {
	/**
	 * Construct the Dependency Tree Node, will store the absolute path of this node too.
	 * Only the root node don't have path, the path of ROOT node is ROOT.
	 */
	constructor(name, path = "ROOT", dependencies = [], parents = []) {
		this.name = name;
		this.path = path;
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

	/**
	 * The level of this node, will calculate from its parent node
	 */
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

	/**
	 * The children of this node
	 */
	getChildren() {
		return this._children;
	}

	/**
	 * Check if this node is exists in the children, since the name can be a little different
	 * in scss require(because scss require supports relative import, though midori import don't),
	 * so will use the path to check instead of the name
	 *
	 * @param path
	 * 		The absolute path of the scss file, must be the absolute file path, if not, will treat it as different node
	 */
	exists(path) {
		// Test if it is in the child fisrt
		let cc = this.childExists(path);
		if(cc) {
			return cc;
		}

		for(let c of this.getChildren()) {
			cc = c.exists(path);
			if(cc) {
				// It is exists in the child
				return cc;
			}
		}
		return false;
	}

	/**
	 * Test if any child have this path
	 */
	childExists(path) {
		if(path) {
			for(let c of this.getChildren()) {
				if(c.path == path) {
					return c;
				}
			}
		}
		return false;
	}

	/**
	 * Add child into the children
	 */
	addChild(child) {
		if(child) {
			if(!this.childExists(child)) {
				this.getChildren().push(child);
				return true;
			}
		}
		return false;
	}

	/**
	 * Output the node
	 */
    show(output) {
        let o = "";

        for(let i = 0; i <= this.level(); i++) {
            o += " ";
        }
        output(`${o} ${this.name} ${this.path} ${this.level()}`);

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
            if(e == this.path) {
                exists = true;
                break;
            }
        }

        if(!exists) {
            // Add this to current layer
            map[level].push(this.path);
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

	/**
	 * Resolve the scss node using the absolute path of the scss
	 */
	resolve(path) {
		return this.root.exists(path);
	}

	/**
	 * Add the scss node into this tree
	 */
	addNode(name, path, dependencies) {
		// Let's find if this node is already added
		let node = this.resolve(path);
		if(node) {
			// We already have it, skip it
			return false;
		}

		let parents = [];
		if(dependencies) {
            dependencies.map(f => {
                let n = this.resolve(f.path);
                if(n) {
                    parents.push(n);
                }
            });

		}
        if(!parents.length) {
            // If no parent is here, let's add it into the root
            parents = [this.root];
        }

		new DependencyTreeNode(name, path, dependencies, parents);
	}

    layers() {
        return this.root.layers({});
    }

    show(output) {
        this.root.show(output);
    }
}

module.exports = { DependencyTreeNode, DependencyTree };
