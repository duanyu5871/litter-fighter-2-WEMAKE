import { WebSocketServer } from 'ws';

var ErrCode;
(function (ErrCode) {
    ErrCode[ErrCode["NotRegister"] = 1000] = "NotRegister";
    ErrCode[ErrCode["AlreadyInRoom"] = 1001] = "AlreadyInRoom";
    ErrCode[ErrCode["NotInRoom"] = 1002] = "NotInRoom";
    ErrCode[ErrCode["NotRoomMaster"] = 1003] = "NotRoomMaster";
    ErrCode[ErrCode["PlayersTooFew"] = 1004] = "PlayersTooFew";
    ErrCode[ErrCode["PlayersNotReady"] = 1005] = "PlayersNotReady";
    ErrCode[ErrCode["InvalidRoomId"] = 1006] = "InvalidRoomId";
    ErrCode[ErrCode["RoomNotFound"] = 1007] = "RoomNotFound";
    ErrCode[ErrCode["InvalidRoomParameters"] = 1008] = "InvalidRoomParameters";
})(ErrCode || (ErrCode = {}));

var MsgEnum;
(function (MsgEnum) {
    MsgEnum["Register"] = "Register";
    MsgEnum["CreateRoom"] = "CreateRoom";
    MsgEnum["JoinRoom"] = "JoinRoom";
    MsgEnum["PlayerReady"] = "PlayerReady";
    MsgEnum["PlayerNotReady"] = "PlayerNotReady";
    MsgEnum["RoomStart"] = "RoomStart";
    MsgEnum["ExitRoom"] = "ExitRoom";
    MsgEnum["OtherExitRoom"] = "OtherExitRoom";
    MsgEnum["OtherJoinRoom"] = "OtherJoinRoom";
    MsgEnum["CloseRoom"] = "CloseRoom";
    MsgEnum["ListRooms"] = "ListRooms";
})(MsgEnum || (MsgEnum = {}));

class Room {
    get users() { return this._users; }
    get title() { return this._title; }
    get max_users() { return this._max_users; }
    constructor(mgr, id) {
        this._users = [];
        this.mgr = mgr;
        this.id = id;
    }
    set_title(title) {
        this._title = title;
        return this;
    }
    set_max_users(max_users) {
        this._max_users = max_users;
        return this;
    }
    info() {
        return {
            title: this._title,
            max_users: this._max_users,
            id: this.id,
            master: this.master?.info(),
            users: this._users.map(v => v.info())
        };
    }
    add_user(user) {
        console.log(`[Room::add_user]`);
        const idx = this._users.findIndex(v => user === v);
        if (idx >= 0)
            return;
        this.broadcast({ type: MsgEnum.OtherJoinRoom, player: user.info() });
        this._users.push(user);
    }
    del_user(user) {
        console.log(`[Room::del_user]`);
        const idx = this._users.findIndex(v => user === v);
        if (this.master === user)
            this.master = void 0;
        this._users.splice(idx, 1);
        this.broadcast({ type: MsgEnum.OtherExitRoom, player: user.info() });
        if (this.users.length <= 0)
            this.mgr.del_room(this.id);
    }
    broadcast(msg) {
        for (const user of this._users) {
            user.send({ type: msg.type, pid: 'room_' + ++room_pid });
        }
    }
    close() {
        console.log(`[Room::close]`);
        this.broadcast({ type: MsgEnum.CloseRoom });
        for (const user of this._users) {
            user.room = void 0;
            user.ready = false;
        }
        this.master = void 0;
        this._users.length = 0;
    }
}
let room_pid = 1;

class RoomManager {
    constructor() {
        this._room_id = 0;
        this._id_room_map = new Map();
        this._rooms = [];
    }
    get id_room_map() { return this._id_room_map; }
    get rooms() { return this._rooms; }
    find_room(room_id) {
        return this._id_room_map.get(room_id);
    }
    create_room() {
        const room = new Room(this, `room_${++this._room_id}`);
        console.log(`[RoomManager::create_room] ${JSON.stringify(room.info())}`);
        this._id_room_map.set(room.id, room);
        this._rooms.push(room);
        return room;
    }
    del_room(room_id) {
        console.log(`[RoomManager::del_room]`);
        const room = this._id_room_map.get(room_id);
        if (!room) {
            console.warn(`[RoomManager::del_room] room not found: ${room_id}`);
            return;
        }
        room.close();
        this._id_room_map.delete(room_id);
        const idx = this._rooms.findIndex(v => v.id === room_id);
        if (idx >= 0)
            this._rooms.splice(idx, 1);
    }
}
const room_mgr = new RoomManager();

function check_no_in_room(msg, user) {
    let room = user.room;
    if (!room)
        return void 0;
    user.error(msg, ErrCode.AlreadyInRoom, `already in room: ${room.id}`);
    return room;
}
function check_in_room(msg, user) {
    if (user.room)
        return true;
    user.error(msg, ErrCode.NotInRoom, `not in room`);
    return false;
}
function check_is_room_master(msg, user) {
    if (user.room?.master?.id !== user.id) {
        return true;
    }
    user.error(msg, ErrCode.NotRoomMaster, `you are not room master`);
    return false;
}

class User {
    get room() { return this._room; }
    set room(v) {
        if (this._room === v)
            return;
        this._room = v;
        this.ready = false;
    }
    get ready() { return this._ready; }
    set ready(v) { this._ready = v && !!this._room; }
    constructor(mgr, ws, id, name) {
        this._ready = false;
        this.name = '';
        this.mgr = mgr;
        this.ws = ws;
        this.id = id;
        this.name = name;
    }
    send(msg) {
        this.ws.send(JSON.stringify(msg));
    }
    resp(req, resp) {
        const _resp = {
            pid: req.pid,
            type: req.type,
            ...resp,
        };
        this.ws.send(JSON.stringify(_resp));
    }
    error(req, code, error, resp) {
        const _resp = {
            pid: req.pid,
            type: req.type,
            code,
            error,
            ...resp,
        };
        this.ws.send(JSON.stringify(_resp));
    }
    info() {
        return {
            id: this.id,
            name: this.name
        };
    }
}

class UserManager {
    constructor() {
        this._user_id = 1;
        this._ws_user_map = new Map();
    }
    register(ws, name) {
        let user = this._ws_user_map.get(ws);
        if (!user) {
            const id = ++this._user_id;
            user = new User(this, ws, id, name || 'player_' + id);
            this._ws_user_map.set(ws, user);
        }
        return user;
    }
    find_user(ws) {
        return this._ws_user_map.get(ws);
    }
    del_user(ws) {
        const user = this._ws_user_map.get(ws);
        if (!user)
            return void 0;
        this._ws_user_map.delete(ws);
        user.room?.del_user(user);
        return user;
    }
}
const user_mgr = new UserManager();

function check_user(msg, ws) {
    const user = user_mgr.find_user(ws);
    if (user)
        return user;
    const resp = {
        type: msg.type,
        pid: msg.pid,
        code: ErrCode.NotRegister,
        error: 'not register yet'
    };
    ws.send(JSON.stringify(resp));
    return user;
}

function handle_req_create_room(ws, msg) {
    const user = check_user(msg, ws);
    if (!user)
        return;
    if (check_no_in_room(msg, user))
        return;
    if (('max_users' in msg) && (typeof msg.max_users !== 'number' ||
        !Number.isSafeInteger(msg.max_users) ||
        msg.max_users < 2))
        return user.error(msg, ErrCode.InvalidRoomParameters, 'max_users wrong!');
    const room = user.room = room_mgr.create_room();
    room.set_title(msg.title);
    room.set_max_users(msg.max_users);
    room.add_user(room.master = user);
    user.resp(msg, { room: room.info() });
}

function handle_req_exit_room(ws, msg) {
    const user = check_user(msg, ws);
    if (!user)
        return;
    if (!check_in_room(msg, user))
        return;
    const { room } = user;
    if (room)
        room.del_user(user);
    user.resp(msg, {});
}

function handle_req_join_room(ws, msg) {
    const user = check_user(msg, ws);
    if (!user)
        return;
    if (check_no_in_room(msg, user))
        return;
    const { roomid } = msg;
    if (!roomid) {
        user.error(msg, ErrCode.InvalidRoomId, `roomid can not be ${msg.roomid}`);
        return;
    }
    const room = room_mgr.find_room(roomid);
    if (!room) {
        user.error(msg, ErrCode.RoomNotFound, `room not found, roomid: ${msg.roomid}`);
        return;
    }
    user.room = room;
    room.add_user(user);
    room.master = room.master || user;
    user.resp(msg, { room: room.info() });
}

function handle_req_player_not_ready(ws, msg) {
    const user = check_user(msg, ws);
    if (!user)
        return;
    if (!check_in_room(msg, user))
        return;
    user.ready = false;
    user.resp(msg);
}
function handle_req_list_rooms(ws, msg) {
    const user = check_user(msg, ws);
    if (!user)
        return;
    const { offset = 0, limit = 50 } = msg;
    const rooms = room_mgr.rooms.slice(offset, offset + limit).map(v => v.info());
    user.resp(msg, {
        offset, limit, rooms, total: room_mgr.rooms.length
    });
}

function handle_req_player_ready(ws, msg) {
    const user = check_user(msg, ws);
    if (!user)
        return;
    if (!check_in_room(msg, user))
        return;
    user.ready = true;
}

function handle_req_register(client, msg) {
    const user = user_mgr.register(client, msg.name);
    user.resp(msg, { user: user.info() });
}

function handle_req_room_start(ws, msg) {
    const user = check_user(msg, ws);
    if (!user)
        return;
    if (!check_in_room(msg, user))
        return;
    if (!check_is_room_master(msg, user))
        return;
    const others = user.room.users;
    if (others.length <= 1) {
        user.send({
            type: msg.type,
            pid: msg.pid,
            code: ErrCode.PlayersTooFew,
            error: `players are too few`,
        });
        return;
    }
    for (const other of others) {
        if (other === user)
            continue;
        if (!other.ready) {
            user.send({
                type: msg.type,
                pid: msg.pid,
                code: ErrCode.PlayersNotReady,
                error: `players are not ready`,
            });
            return;
        }
    }
    user.ready = true;
    user.room.broadcast({ type: msg.type });
}

// 创建WebSocket服务器，监听8080端口
const wss = new WebSocketServer({ port: 8080 });
// 监听客户端连接事件
wss.on('connection', (ws) => {
    console.log(`新客户端连接`);
    // 监听客户端发送的消息
    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        console.log('收到客户端消息:', msg);
        switch (msg.type) {
            case MsgEnum.Register:
                handle_req_register(ws, msg);
                break;
            case MsgEnum.CreateRoom:
                handle_req_create_room(ws, msg);
                break;
            case MsgEnum.JoinRoom:
                handle_req_join_room(ws, msg);
                break;
            case MsgEnum.ExitRoom:
                handle_req_exit_room(ws, msg);
                break;
            case MsgEnum.RoomStart:
                handle_req_room_start(ws, msg);
                break;
            case MsgEnum.PlayerReady:
                handle_req_player_ready(ws, msg);
                break;
            case MsgEnum.PlayerNotReady:
                handle_req_player_not_ready(ws, msg);
                break;
            case MsgEnum.ListRooms:
                handle_req_list_rooms(ws, msg);
                break;
            default: console.warn(`ignore msg type: ${msg.type}`);
        }
    });
    // 监听客户端断开连接
    ws.on('close', () => {
        console.log('客户端断开连接');
        user_mgr.del_user(ws);
    });
    // 监听错误
    ws.on('error', (err) => {
        console.error('WebSocket错误:', err);
        user_mgr.del_user(ws);
    });
});
console.log('WebSocket服务器启动，监听ws://localhost:8080');
//# sourceMappingURL=index.js.map
