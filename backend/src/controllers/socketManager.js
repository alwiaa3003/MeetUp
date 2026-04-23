import {Server} from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io=new Server (server, {
        cors: {
            origin:"*",
            methods: ["GET","POST"],
            allowedHeaders:["*"],
            credentials: true
        }
    });

    io.on("connect",(socket) => {
        socket.on("join-call",(path) => {
            if(connections[path]==undefined){
                connections[path]=[]
            }
            connections[path].push(socket.id)
            timeOnline[socket.id]=new Date();

            for (let a=0;a<connections[path].length;++a){
                io.to(connections[path][a]).emit("user-joined",socket.id,connections[path])
            }
        })
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
    const [matchingRoom, found] = Object.entries(connections).reduce(([room, isFound], [roomKey, roomValue]) => {  // Fixed: missing ) before =>
        if (!isFound && roomValue.includes(socket.id)) {
            return [roomKey, true];
        }
        return [room, isFound];
    }, ['', false]);

    if (found == true) {
        if (messages[matchingRoom] == undefined) {
            messages[matchingRoom] = [];
        }
        messages[matchingRoom].push({ "sender": sender, "data": data, "socket-id-sender": socket.id });
        console.log("message", matchingRoom, ":", sender, data);  // Fixed: 'key' → 'matchingRoom'

        connections[matchingRoom].forEach(elem => {  // Fixed: moved ) after elem, before =>
            io.to(elem).emit("chat-message", data, sender, socket.id);
        });  // Fixed: changed }) to }); to properly close forEach
    }
});

        socket.on("disconnect", () => {

            var diffTime = Math.abs(timeOnline[socket.id] - new Date())
            var key
            for (const [k, v] of Object.entries(connections)) {
            for (let a = 0; a < v.length; ++a) {
                io.to(v[a]).emit('user-left', socket.id);
            }

            const index = v.indexOf(socket.id);
            if (index !== -1) {
                v.splice(index, 1);
            }

            if (v.length === 0) {
                delete connections[k];
            }
            }
            
        })
    })

    return io;
}