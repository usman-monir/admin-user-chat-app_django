/**
 * Variables
 */

let chatSocket = null;

/**
 * Elements
 */

const chatLogElement = document.querySelector('#chat_log')
const chatMessageInputElement = document.querySelector('#chat_message_input')
const chatMessageSubmitElement = document.querySelector('#chat_message_submit')
const client = document.querySelector('#client').value
const uuid = document.querySelector('#uuid').value
const agent = document.querySelector('#agent').value

/**
 * Functions
 */

const scrollToBotttom = () =>{
    chatLogElement.scrollTop = chatLogElement.scrollHeight
}

const sendMessage =() =>{
    chatSocket.send(JSON.stringify({
        'type': 'message',
        'message': chatMessageInputElement.value || '𝘦𝘮𝘱𝘵𝘺 𝘮𝘦𝘴𝘴𝘢𝘨𝘦!',
        'agent': agent,
        'name': client,

    }))
    chatMessageInputElement.value = ''
}


const insertMessageToChatLog = (data) =>{
    if (data.type == 'chat_message') {
        if (!data.agent) {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>

                    <div>
                        <div class="bg-gray-300 p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>

                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>
                </div>
            `
        } else {
            chatLogElement.innerHTML += `
                <div class="flex w-full mt-2 space-x-3 max-w-md ml-auto justify-end">
                    <div>
                        <div class="bg-blue-300 text-white p-3 rounded-l-lg rounded-br-lg">
                            <p class="text-sm">${data.message}</p>
                        </div>

                        <span class="text-xs text-gray-500 leading-none">${data.created_at} ago</span>
                    </div>

                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-300 text-center pt-2">${data.initials}</div>
                </div>
            `
        }
    }
    scrollToBotttom()
}

chatSocket = new WebSocket(`ws://${window.location.host}/ws/chat/${uuid}/`)
chatSocket.onopen = (e) => console.log(e, '\tonopen');
chatSocket.onclose = (e) => console.log(e, '\tonclose');
chatSocket.onmessage = (e) => {
    insertMessageToChatLog(JSON.parse(e.data))
}

/**
 * Event listeners
 */

chatMessageSubmitElement.onclick = (e) => {
    e.preventDefault()

    sendMessage()

    return false
}

chatMessageInputElement.onkeyup = (e) => {
    if (e.keyCode == 13) {
        sendMessage()
    }
}
