import { Socket } from "phoenix";
import { v4 as uuidv4 } from "uuid";

let socket = new Socket("/socket", { params: { token: window.userToken } });
socket.connect();

let clientLetters = generateRandomLetter() + generateRandomLetter(); // Users are represented by two random letters in the UI.
let clientId = uuidv4(); // Users are identified by UUID.
let channel = socket.channel("chatroom:lobby", {});
let chatInput = document.querySelector("#chat-input");
let messagesContainer = document.querySelector("#messages");
let sendButton = document.querySelector("#send");

chatInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    sendMessage();
  }
});

sendButton.addEventListener("click", () => {
  sendMessage();
});

function sendMessage() {
  channel.push("new_msg", {
    id: clientId,
    body: chatInput.value,
    letter: clientLetters,
  });
  chatInput.value = "";
}

function generateRandomLetter() {
  const alphabet = "abcdefghijklmnopqrstuvwxyz".toUpperCase();

  return alphabet[Math.floor(Math.random() * alphabet.length)];
}

/*
 * Creates a nested div structure that represents this client's messages.
 */
function createSelfMessage(payload) {
  let wrapper = document.createElement("div");
  wrapper.classList = "col-start-1 col-end-8 p-3 rounded-lg";

  let center = document.createElement("div");
  center.classList = "flex flex-row items-center";

  let nameBubble = document.createElement("div");
  nameBubble.classList =
    "flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0";
  nameBubble.innerHTML = payload.letter;

  let messageWrapper = document.createElement("div");
  messageWrapper.classList =
    "relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl";

  let message = document.createElement("div");
  message.innerHTML = payload.body;

  wrapper.appendChild(center);
  center.appendChild(nameBubble);
  center.appendChild(messageWrapper);
  messageWrapper.appendChild(message);

  return wrapper;
}

/*
 * Creates a nested div structure that represents a message from another user.
 */
function createOtherMessage(payload) {
  let wrapper = document.createElement("div");
  wrapper.classList = "col-start-6 col-end-13 p-3 rounded-lg";

  let center = document.createElement("div");
  center.classList = "flex items-center justify-start flex-row-reverse";

  let nameBubble = document.createElement("div");
  nameBubble.classList =
    "flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0";
  nameBubble.innerHTML = payload.letter;

  let messageWrapper = document.createElement("div");
  messageWrapper.classList =
    "relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl";

  let message = document.createElement("div");
  message.innerHTML = payload.body;

  wrapper.appendChild(center);
  center.appendChild(nameBubble);
  center.appendChild(messageWrapper);
  messageWrapper.appendChild(message);

  return wrapper;
}

// When we recieve a message from our websocket, handle the payload to generate messages.
channel.on("new_msg", (payload) => {
  if (payload.id === clientId) {
    // Our message
    let selfMessage = createSelfMessage(payload);

    messagesContainer.appendChild(selfMessage);
  } else {
    // Otherwise, this is an incoming message.
    let otherMessage = createOtherMessage(payload);

    messagesContainer.appendChild(otherMessage);
  }
});

channel
  .join()
  .receive("ok", (resp) => {
    console.log("Joined successfully", resp);
  })
  .receive("error", (resp) => {
    console.log("Unable to join", resp);
  });

export default socket;
