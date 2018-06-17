/// <reference path="../refs.ts" />

class Player {

	public id: string;
	
	public name: string = "unnamed";
	public tank: Tank | null = null;

	public stats?: any;

	constructor(id: string, tank?: Tank, name?: string) {
		this.id = id;
		this.name = name || "unnamed";

		if (tank) { this.attachTank(tank); };
	}

	/**
	 * Binds player and tank together
	 */
	attachTank(tank: Tank) {
		this.tank = tank;
		tank.player = this;
	};

	removeTank() {
		if (!this.tank) return;
		this.tank.destroy();
		this.tank = null;
	};

	/**
	 * Sets properties of this player and his tank according to the player info packet received from the server
	 * @param {*} packet Player packet from the server
	 */
	applyPacket(packet) {

	}
}

