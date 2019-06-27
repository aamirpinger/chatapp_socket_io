const users = []

const addUser = ({ id, username, chatroom }) => {

    username = username.trim().toLowerCase()
    chatroom = chatroom.trim().toLowerCase()

    if (!username || !chatroom) {
        return {
            error: 'Username and Chatroom name are required fields'
        }
    }

    const isUsernameExist = users.find((user) => user.username === username)

    if (isUsernameExist) {
        return {
            error: 'Username already taken'
        }
    }

    const user = {
        id,
        username,
        chatroom
    }

    users.push(user)

    return user
}


const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0] // [0] is bcaz we want to return obj not array
    }
}

const getUser = (id) => {
    const user = users.find((user) => user.id === id)

    if (!user) {
        return {
            error: "error not found"
        }
    }

    return user
}

const getAllUsersInChatroom = (chatroom) => {
    chatroom = chatroom.trim().toLowerCase()
    return users.filter((user) => user.chatroom === chatroom)
}


module.exports = {
    addUser,
    removeUser,
    getUser,
    getAllUsersInChatroom
}