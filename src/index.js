const badWordFilter = require('bad-words')
const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const { messagesObj } = require('./utils/msg-helpers')
const {
    addUser,
    removeUser,
    getUser,
    getAllUsersInChatroom
} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, "../public")

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log("New connection established")

    socket.on("joinChatroom", (({ username, chatroom }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            chatroom
        })

        if (error) {
            return callback(error)
        }

        socket.join(chatroom)
        socket.emit("updateChatWindow", messagesObj('System msg:', `You are connected to chatroom '${chatroom}'`))
        // socket.broadcast.to(chatroom).emit send msg to everyone in specific group and except this user
        // io.to(chatroom).emit send msg to everyone in specific group and except this user
        socket.broadcast.to(chatroom).emit('updateChatWindow', messagesObj('System msg:', `${username} has joined!`))
        io.to(chatroom).emit('leftPanelUserData', {
            chatroom,
            users: getAllUsersInChatroom(chatroom)
        })
    }))

    socket.on('userLocation', (location, callback) => {
        const user = getUser(socket.id)

        if (!location.latitude || !location.longitude) {
            return callback(messagesObj("Latitude / Longitude Not received"))
        }
        socket.broadcast.to(user.chatroom).emit("updateChatWindowWithLink", `https://google.com/maps?q=${location.latitude},${location.longitude}`)
        callback(messagesObj("Location Received!!"))
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.chatroom).emit("updateChatWindow", messagesObj('System msg:', `${user.username} left the room`))
            io.to(user.chatroom).emit('leftPanelUserData', {
                chatroom: user.chatroom,
                users: getAllUsersInChatroom(user.chatroom)
            })
        }
    })
    //this will listen for emit from client side
    socket.on('messageSubmitted', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new badWordFilter()
        if (filter.isProfane(message)) {
            return callback(messagesObj("Msg not sent! No bad words allowed!"))
        }
        io.to(user.chatroom).emit("updateChatWindow", messagesObj(user.username, message))
        callback()
    })

})

server.listen(port, () => {
    console.log("Server connected on port: ", port)
})

