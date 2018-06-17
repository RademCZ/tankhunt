/// <reference path="../refs.ts" />

class DefaultTank extends Tank {

	constructor() {
		super(Data.DefaultTank.asset);

		this.anchor.setTo(Data.DefaultTank.anchorX, Data.DefaultTank.anchorY);
		this.width = Data.DefaultTank.sizeX * TH.sizeCoeff;
		this.height = Data.DefaultTank.sizeY * TH.sizeCoeff;

		this.framesInRow = 1;

		this.turret = new Sprite(TH.game, this.x, this.y, "defaultTurret");
		this.turret.anchor.setTo(0.5, 0.8453);
		this.turret.width = 0.625 * TH.sizeCoeff;
		this.turret.height = 0.625 * 3.23 * TH.sizeCoeff;
	}
}