/**
 * Variables
 */

let chatName = ''
let chatSocket = null
let chatWindowUrl = window.location.href
let chatRoomUuid = Math.random().toString(36).slice(2, 12)


/**
 * Elements
 */

const chatElement = document.querySelector('#chat')
const chatOpenElement = document.querySelector('#chat_open')
const chatJoinElement = document.querySelector('#chat_join')
const chatIconElement = document.querySelector('#chat_icon')
const chatWelcomeElement = document.querySelector('#chat_welcome')
const chatRoomElement = document.querySelector('#chat_room')
const chatNameElement = document.querySelector('#chat_name')
const chatMessageInputElement = document.querySelector('#chat_message_input')
const chatMessageSubmitElement = document.querySelector('#chat_message_submit')

/**
 * Functions
 */

const getCookie = (name) => {
    let cookieVal = null
    if ( document.cookie && document.cookie != '' ) {
        let cookies = document.cookie.split(';')
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim()
            if (cookie.substring(0,name.length + 1) === (name + '=')) {
            {
                cookieVal = decodeURIComponent(cookie.substring(name.length+1))
                break
            }
        }
    }
}
    return cookieVal
}

const JoinChatRoom = () =>{
    const data = new FormData();
    data.append('name', chatNameElement.value)
    data.append('url', chatWindowUrl)
    console.log(data);
    console.log(chatNameElement.value);
    console.log(chatWindowUrl);

    fetch(`/api/create-room/${chatRoomUuid}/`, {
        method: 'POST',
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: data
    }).then((res)=>{
        return res.json()
    }).then((data)=>{
        console.log(data)
    })
}

/**
 * Event listeners
 */


chatOpenElement.onclick = function(e) {
    e.preventDefault()

    chatIconElement.classList.add('hidden')
    chatWelcomeElement.classList.remove('hidden')
    return false
}

chatJoinElement.onclick = function(e) {
    e.preventDefault()

    chatWelcomeElement.classList.add('hidden')
    chatRoomElement.classList.remove('hidden')

    JoinChatRoom()
    return false
}
