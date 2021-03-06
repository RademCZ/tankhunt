import { Player_SE } from "../Player_SE";
import { Item_SE } from "../Item_SE";
import { Shot_SE } from "../Shot_SE";
import { ItemManager_SE } from "../ItemManager_SE";
import { Level_SE } from "../Level_SE";
import { GameObject_SE } from "../utils/GameObject_SE";

abstract class THGame_SE {

    public players: Player_SE[] = [];
    protected shots: Shot_SE[] = [];
   
    protected itemManager: ItemManager_SE | null;

    public level: Level_SE | null = null;
    
    public running: boolean = false;
    public startTime: number = 0;

    protected updateCounter: number = 0;
    protected capacity: number = 10;

    protected gameType: string;

    private hViewWidth: number = 15;
    private hViewHeight: number = 9;
    private viewOffset: number = 4.28;

    protected now: number = Date.now();

    protected blockInput: boolean = false;

    remove: boolean = false;
    
    constructor() { 
        this.itemManager = new ItemManager_SE(this);
    }

    addPlayer (player: Player_SE) {
        if (this.running) return;
        this.players.push(player);
        player.game = this;
    }

    update(deltaSec: number) { }

    abstract playerDisconnected(player: Player_SE): void;

    shoot(shot: Shot_SE, emitShot: boolean = true) {
        
        if (shot.remove)
            return false
            
        this.shots.push(shot);
        
        if (emitShot)
            this.emitShot(shot.getStartPacket());
    }

    emitLevel() {
        this.emitData("level", this.level);
    }

    emitLevelPl(player: Player_SE) {
        this.emitDataPl("level", this.level, player);
    }

    emitShot(packet: PacketShotStart) {
        this.emitData("shot", packet);
    }

    emitKill(killedID: string, killerID: string, shotID: string) {
        this.emitData("kill", { killerID: killerID, killedID: killedID, shotID: shotID });
    }

    emitHit(data: PacketShotHit) {
        this.emitData("hit", data);
    }

    emitItemSpawn(item: Item_SE) {
        this.emitData("itemSpawn", {typeIndex: item.typeIndex, x: parseFloat(item.x.toFixed(4)), y: parseFloat(item.y.toFixed(4)), id: item.id});
    }

    emitItemCollect(item: Item_SE, collector: Player_SE) {
        this.emitData("itemCollect", { id: item.id, playerID: collector.id });
    }

    emitDisappear(player: Player_SE) {
        this.emitData("disappear", { plID: player.id });
    }

    emitAppear(player: Player_SE) {
        this.emitData("appear", { plID: player.id, atX: player.tank.x, atY: player.tank.y } );
    }

    emitData(emName: string, data: any) {

        for (const player of this.players) {
            if (!player.socket || player.socket.disconnected) continue;
            player.socket.emit(emName, data);
        }
    }

    emitHeal(data: PacketHeal) {
        this.emitData("heal", data);
    }

    emitRespawn(data: PacketRespawn) {
        this.emitData("respawn", data);
    }

    emitCapture(data: PacketCapture) {
        this.emitData("cap", data);
    }

    emitDataPl(emName: string, data: any, player: Player_SE) {
        if (!player.socket || player.socket.disconnected) return;
        player.socket.emit(emName, data);
    }

    emitDataPlVolatile(emName: string, data: any, player: Player_SE) {
        if (!player.socket || player.socket.disconnected) return;
        player.socket.volatile.emit(emName, data);
    }

    emitRemove(id: string) {
        this.emitData("removePlayer", id);
    }

    // Creates and sends packet that contains positions and rotations of the tanks
    emitMovable() {
    
        // Add players to the packet
        for (var pl = 0; pl < this.players.length; pl++) {
            var plr1 = this.players[pl];

            var packet: PacketMovable = {} as PacketMovable;
            packet.p = {}; 
            
            var counter = 0;
    
            for (let pl2 = 0; pl2 < this.players.length; pl2++) {
                
                let plr2: Player_SE = this.players[pl2];
                
                // All the following conditions have to be true in order to add this tank to the packet
                if (!this.isInView(plr2.tank, plr1.tank.x, plr1.tank.y) || !plr2.alive || !plr2.emitable || (plr2.invisible && plr2.isEnemyOf(plr1))) 
                    continue;

                packet.p[plr2.id] = plr2.tank.getTinyPacket();
                counter++;
            }
        
            if (counter > 0)
                this.emitDataPlVolatile("ms", packet, plr1);
        }

    }

    isInView(gameobj: GameObject_SE, fromX: number, fromY: number) {
        let rectX = fromX - this.hViewWidth;
        let rectY = fromY - this.hViewHeight;

        return gameobj.body.right > rectX && gameobj.body.left < rectX + this.hViewWidth * 2
            && gameobj.body.top < rectY + this.hViewHeight * 2 && gameobj.body.bottom > rectY;
    }

    isFull() {
        return this.players.length == this.capacity;
    }

    isEmpty() {
        return this.players.length == 0;
    }

    getPlayerCount() {
        return this.players.length;
    }

    kickPlayer(player: Player_SE) {
        this.playerDisconnected(player);
    }

    protected tidyPlayerShots(player: Player_SE) {
        let shotsToRemove = this.shots.filter((sh) => { return sh.owner === player });

        for (const shot of shotsToRemove) {
            shot.remove = true;
        }
    }

    /**
     * Nulls the references, sets the remove property to true
     */
    destroy() {

        this.remove = true;
        this.level = null;

        this.players.forEach((plr: Player_SE) => {
            plr.game = null;
            plr.lastInput = null;
        });
        
        this.players = null;
        this.itemManager.destroy();
        this.shots = null;
        this.running = false;
        this.blockInput = true;
    }

    processChatMessage(data: PacketChatMessage, senderPl: Player_SE) {
        let packet: PacketChatMessage = { id: senderPl.id, mess: data.mess };
        for (const plr of this.players) {
            if (data.alliesOnly && senderPl.isEnemyOf(plr)) continue;
            this.emitDataPl("gameChat", packet, plr);
        }
    }

    // Input handling ----------------------------------------------------------------------
    handleInput(inputType: string, player: Player_SE) {
        if (this.blockInput)
            return; 

        // Prevent hacking user from trying to run different method
        if (inputType.substr(0, 3) !== "inp") {
            return;
        }

        if ((this as any)[inputType]) {
            (this as any)[inputType](player);  
            player.lastInput = this.now;
        }
    }

    inpForwOn(player: Player_SE) {
        player.tank.fullForward();
    }

    inpForwOff(player: Player_SE) {
        if (player.tank.speed > 0) player.tank.stop();
    }

    inpBackwOn(player: Player_SE) {
        player.tank.fullBackward();
    }

    inpBackwOff(player: Player_SE) {
        if (player.tank.speed < 0) player.tank.stop();
    }

    inpLeftOn(player: Player_SE) {
        player.tank.fullLeftRotate();
    }

    inpLeftOff(player: Player_SE) {
        if (player.tank.angularVel < 0) player.tank.stopRotation();
    }

    inpRightOn(player: Player_SE) {
        player.tank.fullRightRotate();
    }

    inpRightOff(player: Player_SE) {
        if (player.tank.angularVel > 0) player.tank.stopRotation();
    }

    inpTurrLeftOn(player: Player_SE) {
        player.tank.turret.fullLeftRotate();
    }

    inpTurrLeftOff(player: Player_SE) {
        if (player.tank.turret.angularVel < 0) player.tank.turret.stopRotation();
    }

    inpTurrRightOn(player: Player_SE) {
        player.tank.turret.fullRightRotate();
    }

    inpTurrRightOff(player: Player_SE) {
        if (player.tank.turret.angularVel > 0) player.tank.turret.stopRotation();
    }

    inpShotOn(player: Player_SE) {
        if (player.tank.apcrGun)
            player.tank.apcrGun.onPress(this);
    }

    inpShotOff(player: Player_SE) {
        if (player.tank.apcrGun)
            player.tank.apcrGun.onRelease(this);
    }

    inpShotSpecialOn(player: Player_SE) {
        if (player.tank.specialGun) {
            player.tank.specialGun.onPress(this);
        }
    }

    inpShotSpecialOff(player: Player_SE) {
        if (player.tank.specialGun) {
            player.tank.specialGun.onRelease(this);
        }
    }

    inpShotBouncingOn(player: Player_SE) {
        if (player.tank.bouncerGun) {
            player.tank.bouncerGun.onPress(this);
        }
    }
}

export { THGame_SE };
