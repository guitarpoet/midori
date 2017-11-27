require("./css/_simple.scss");
require("./webpack-include");

const a = 1;

class Hello {
	constructor(name) {
		this.name = name;
	}

	world() {
		console.info("Hello " + this.name);
	}
}

const greetings = new Hello("Jack");

greetings.world();
