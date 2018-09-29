interface PacketGameObject {
    /**
     * Text id that gameobject acquired from the server
     */
    id: string,
    /**
     * X coordinate of the gameobject's position
     */
    x: number,
    /**
     * Y coordinate of the gameobject's position
     */
    y: number,
    /**
     * Rotation in RADIANS
     */
    rot: number
}

interface PacketTank extends PacketGameObject {
    /**
     * Turret rotation in RADIANS
     */
    turrRot: number,
    /**
     * String ID of the player that owns this tank, this id is generated
     * by socket.io
     */
    plID: string
}

interface PacketTankTiny {
    x: number,
    y: number,
    /**
     * Tanks's rotation
     */
    r: number,
    /**
     * Turret rotation
     */
    t: number,
}

interface PacketPlayerInfo {
    /**
     * Short id generated by gameobject global id passer
     */
    id: string,
    /**
     * Id of the player generated by socket.io
     */
    socketID: string,
    /**
     * Name of the player
     */
    name: string,
    /**
     * Object that contains information about current player's statistics
     */
    stats?: PlayerStats,
    /**
     * Determine if player is currently alive on the server
     */
    alive: boolean
    /**
     * Information about player's tank
     */
    tank?: PacketTank,
       
    team?: number,

    health: number,
    maxHealth: number
}

interface PacketShotStart extends PacketGameObject {
    /**
     * Type of the shot
     */
    type: string,
    /**
     * X coordinate of the start position
     */
    startX: number,
    /**
     * Y coordinate of the start position
     */
    startY: number,
    /**
     * The time indicating when the shot was created on the server
     */
    startTime: number,
    /**
     * socket.io ID of the player that shoot this shot
     */
    ownerID: string
    /**
     * X coordinate of the shot's endpoint
     */
    endX?: number,
    /**
     * Y coordinate of the shot's endpoint
     */
    endY?: number,
    /**
     * Speed of the shot
     */
    speed?: number,
    /**
     * Bounce points of the shot
     */
    pts?: {x:number, y: number, ang: number}[]
    /**
     * This property is filled on the client when passing packet to new shot
     */
    ownerObj?: Player_CL 
}

interface PacketHeal {
    plID?: string, 

    healthBef?: number,
    healthAft?: number,

    maxHealthBef?: number,
    maxHealthAft?: number,

    /**
     * Is this global team heal?
     */
    tm?: number,
    /**
     * Health increase
     */
    amount?: number
}

interface WayPoint {
	x: number,
	y: number,
	ang: number
}

interface PacketGameFinish {
    subgame?: boolean,
    winnerID?: string,
    winnerTeam?: number,

    nextLevel?: PacketLevel,
    nextDelay?: number,
    /**
     * Can specify the health for next round
     */
    nextHealth?: number
}

interface PacketEliminatorStart extends PacketBouncerShotStart {
    spl: { ang: number, speed: number }[];
    splTime: number;
}

interface PacketBouncerShotStart extends PacketShotStart {
    pts: WayPoint[]
}

interface PacketRespawn extends PacketTank {
    /**
     * Time when the respawn countdown starts
     */
    serverTime: number,
    /**
     * Time to the actual respawn
     */
    respawnDelay: number,
    /**
     * How long immunity is after tank is actually respawned
     */
    immunityTime: number,
    /**
     * Health of player's tank
     */
    health: number
   
}

interface PacketItem extends PacketGameObject {
    /**
     * Type of the shot, proper object is generated according to this index
     */
    typeIndex: number
}

interface PacketGameInfo {
    players: PacketPlayerInfo[],
    items: PacketItem[]
}
interface PacketItemCollect {
    /**
     * Id of collected item
     */
    id: string;
    /**
     * Id of player that collected this item
     */
    playerID: string;
}

interface PacketGameStart extends PacketGameInfo {
    serverTime: number,
    gameType: string,
    level: PacketLevel,
    countDown?: number,
    winCount?: number
}

interface PacketTeamGameStart extends PacketGameStart {
    caps: PacketCapture[],
    capTime: number
}

/**
 * Levels can be passed by json (randomly generated), or by a name (pregenerated and shared)
 */
interface PacketLevel {
    json?: string,
    name?: string
} 

interface PacketGameRequest {
    gameType: string,
    playerName: string
}

interface PacketMovable {
    p: { [key: string]: PacketTankTiny }
}

interface PacketKill {
    /**
     * Id of a player that was killing (not id of his tank!)
     */
    killerID: string,
    /**
     * Id of a player that was killed (not id of his tank!)
     */
    killedID: string,
    /**
     * Id of a shot that was killing
     */
    shotID: string
}

interface PacketShotHit {
    /**
     * ID of a player that was hit
     */
    plID: string,
    /**
     * ID of a player who owns the shot
     */
    plAttID: string,
    /**
     * ID of a shot that hits
     */
    shotID: string,
    /**
     * Player health before the hit
     */
    healthBef?: number,
    /**
     * Player health after the hit
     */
    healthAft?: number,
    /**
     * If blast is set to true, blast method on shot should be called
     */
    blast?: boolean,
    /**
     * Should the shot be removed after this hit?
     */
    rm?: boolean,
    /**
     * X coordinate of the hit position
     */
    x?: number,
    /**
     * Y coordinate of the hit position
     */
    y?: number
    /**
     * X coordinate of tank's position at hit moment
     */
    xTank?: number,
    /**
     * Y coordinate of tank's position at hit moment
     */
    yTank?: number,
    /**
     * Respawn time
     */
    resTime?: number
}

interface PacketAppear {
    /**
     * ID of player that appears
     */
    plID: string,
    /**
     * X coordinate of appear position
     */
    atX: number,
    /**
     * Y coordinate of appear position
     */
    atY: number
}

interface PacketDisappear {
    plID: string
}

interface PlayerStats {
    kills: number,
    deaths: number,
    wins: number,
    suic: number,
    teamK: number,
    blockC: number,

    inRow: number,
    maxRow: number,

    dmgR: number,
    dmgD: number
    [key: string]: any
}


interface PacketMenuInfo {
    arenaG: number,

    duelG: number,

    menuP: number,
    totalP: number,
    teamG: number,
    teamQ: number,
}

interface PacketChatMessage {
    mess: string;
    name?: string;
    id?: string;
    alliesOnly?: boolean
}

interface PacketCapture {
    /**
     * Id of this this packet, starts with char "a" and contains square position
     * Coordinates are separated by "|"
     */
    id: string,
    /**
     * Team that owns this cap
     */
    tm: number,
    /**
     * Sets this packet to mean "start capturing"
     */
    st?: boolean,
    /**
     * Sets this packet to mean "cancel capturing"
     */
    cn?: boolean,
    /**
     * Sets this packet to mean "finish capturing"
     */
    fin?: boolean,
    /**
     * ID of the capturer
     */
    plID?: string,
    /**
     * Sets this packet to mean "reset capturing"
     */
    rs?: boolean
}