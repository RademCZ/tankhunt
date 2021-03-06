
class Sprite extends Phaser.Sprite {

    protected interpolationConst: number = 0.2;

    protected remX: number = 0;
	protected remY: number = 0;
    protected remAngle: number = 0; 

    public frameStart: number = 1;
    public framesInRow: number = 1;
    

    public defaultColorIndex: number = 1;

    private intMoving: boolean = false;

    public onIntMoveStop: Phaser.Signal = new Phaser.Signal();
    public onIntMoveStart: Phaser.Signal = new Phaser.Signal();
    public onIntMove: Phaser.Signal = new Phaser.Signal();
    public onColorChange: Phaser.Signal = new Phaser.Signal();
    
    constructor(game: Phaser.Game, x: number, y: number, asset: string) {
        super(game, x, y, asset);

    }

    set colorIndex(val: number) { 
		this.frameStart = val * (this.framesInRow || 1);
        this.frame = this.frameStart;
        this.onColorChange.dispatch(val);
	}

    interpolate() {
        let diffX = this.remX - this.x;
        let diffY = this.remY - this.y;

        let dist = Math.sqrt(diffX * diffX + diffY * diffY);

        if (dist < 2 || dist > TH.sizeCoeff * 2) { // Jump directly to the remote position
            this.x = this.remX;
            this.y = this.remY;
            if (this.intMoving) {
                this.onIntMoveStop.dispatch();
                this.intMoving = false;
            }
            return;
        } else {
            if (!this.intMoving) {
                this.onIntMoveStart.dispatch();
                this.intMoving = true;
                
            }
        }

        this.x += diffX * this.interpolationConst;
        this.y += diffY * this.interpolationConst;

    }

    interpolateAngle() {
        let diff = this.remAngle - this.rotation;

        if (Math.abs(diff) < Math.PI / 90 || Math.abs(diff) > Math.PI / 3) {
            this.rotation = this.remAngle;
            return;
        }

        this.rotation += diff * this.interpolationConst;
    }

    positionServerUpdate(x: number, y: number) {
		this.remX = x * TH.sizeCoeff;
		this.remY = y * TH.sizeCoeff;
    }
    
    rotationServerUpdate(rot: number) {
		this.remAngle = rot;
    }

	isMoving() {
		return !(Math.round(this.previousPosition.x) === Math.round(this.position.x) &&
			Math.round(this.previousPosition.y) === Math.round(this.position.y)); //  !this.previousPosition.fuzzyEquals(this.position, 0.05);
	}

	isRotating() {
		return parseFloat(this.rotation.toPrecision(5)) !== parseFloat(this.previousRotation.toPrecision(5));
	}

    
    jumpToRemote() {
		this.x = this.remX;
		this.y = this.remY;
		this.rotation = this.remAngle;
    }

    isGoingBack() {
      //  let pPoint
    }
}