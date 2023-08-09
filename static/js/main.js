/**
 * Variables
 */

let chatName = "";
let chatSocket = null;
let chatWindowUrl = window.location.href;
let chatRoomUuid = Math.random().toString(36).slice(2, 12);

/**
 * Elements
 */

const chatElement = document.querySelector("#chat");
const chatOpenElement = document.querySelector("#chat_open");
const chatJoinElement = document.querySelector("#chat_join");
const chatIconElement = document.querySelector("#chat_icon");
const chatWelcomeElement = document.querySelector("#chat_welcome");
const chatRoomElement = document.querySelector("#chat_room");
const chatNameElement = document.querySelector("#chat_name");
const chatLogElement = document.querySelector("#chat_log");
const chatMessageInputElement = document.querySelector("#chat_message_input");
const chatMessageSubmitElement = document.querySelector("#chat_message_submit");

/**
 * Functions
 */

const scrollToBotttom = () => {
  chatLogElement.scrollTop = chatLogElement.scrollHeight;
};

const remove_typing_element = () => {
  const agent_typing = document.querySelector("#agent-typing");
  if (agent_typing) {
    agent_typing.remove();
  }
};

const getCookie = (name) => {
  let cookieVal = null;
  if (document.cookie && document.cookie != "") {
    let cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        {
          cookieVal = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
  }
  return cookieVal;
};

const sendMessage = () => {
  console.log(chatMessageInputElement.value);
  chatSocket.send(
    JSON.stringify({
      type: "message",
      message: chatMessageInputElement.value || "𝘦𝘮𝘱𝘵𝘺 𝘮𝘦𝘴𝘴𝘢𝘨𝘦!",
      name: chatNameElement.value || ": (",
    })
  );
  chatMessageInputElement.value = "";
  console.log("sendMessage");
};

const insertMessageToChatLog = (data) => {
  if (data.type == "chat_message") {
    if (data.agent) {
      remove_typing_element();
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
            `;
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
            `;
    }
  } else if (data.type == "agent_joined") {
    console.log("agent joined - main.js");
    chatLogElement.innerHTML += ` <p class="p-3 text-center text-sm text-gray-500">Agent has Joined</p>`;
  } else if (data.type == "agent_typing") {
    console.log("agent typing - main.js");
    remove_typing_element();
    chatLogElement.innerHTML += ` <p id='agent-typing' class="p-3 text-center text-sm text-gray-500">Agent is Typing...</p>`;
  } else if (data.type == "agent_clear_typing") {
    console.log("agent clear typing - main.js");
    remove_typing_element();
  }
  scrollToBotttom();
  console.log("insertMessageToChatLog");
};

const JoinChatRoom = async () => {
  const data = new FormData();
  data.append("name", chatNameElement.value || ":(");
  data.append("url", chatWindowUrl);

  await fetch(`/api/create-room/${chatRoomUuid}/`, {
    method: "POST",
    headers: {
      "X-CSRFToken": getCookie("csrftoken"),
    },
    body: data,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    });

  chatSocket = new WebSocket(
    `ws://${window.location.host}/ws/chat/${chatRoomUuid}/`
  );
  chatSocket.onopen = (e) => console.log("onopen");
  chatSocket.onclose = (e) => console.log("onclose");
  chatSocket.onmessage = (e) => {
    console.log("onmessage", e);
    insertMessageToChatLog(JSON.parse(e.data));
  };
};

/**
 * Event listeners
 */

if (chatOpenElement) {
  chatOpenElement.onclick = (e) => {
    e.preventDefault();

    chatIconElement.classList.add("hidden");
    chatWelcomeElement.classList.remove("hidden");
    return false;
  };
}

chatJoinElement.onclick = (e) => {
  e.preventDefault();

  chatWelcomeElement.classList.add("hidden");
  chatRoomElement.classList.remove("hidden");

  JoinChatRoom();
  return false;
};
chatNameElement.onkeyup = (e) => {
  if (e.keyCode == 13) {
    e.preventDefault();

    chatWelcomeElement.classList.add("hidden");
    chatRoomElement.classList.remove("hidden");

    JoinChatRoom();
    return false;
  }
};

chatMessageSubmitElement.onclick = (e) => {
  e.preventDefault();

  sendMessage();

  return false;
};

chatMessageInputElement.onkeyup = (e) => {
  if (e.keyCode == 13) {
    sendMessage();
  }
};
chatMessageInputElement.onfocus = (e) => {
  e.preventDefault();
  chatSocket.send(
    JSON.stringify({
      type: "customer_typing",
    })
  );
};

chatMessageInputElement.onblur = (e) => {
  e.preventDefault();
  chatSocket.send(
    JSON.stringify({
      type: "customer_clear_typing",
    })
  );
};
