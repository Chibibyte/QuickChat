# QuickChat
## Simple Chatroom WebApp

QuickChat is a simple chat application. The user requests a chatroom with custom name and password. The server creates the room and sends the randomly generated link back. Now everyone with the link and password can enter the room. After a timeout, which is always visible in chat, the room will close automatically.

### Settings

Change the server settings in the *config.js* file
```javascript
/**
 * Max number of possible rooms on this server
 * After that the server will block any request for a new room until an old one closes
 */
process.conf.MAX_ROOMS = 20;

/**
 * Max number of possible user in a room
 * After that the server will block any login request
 */
process.conf.MAX_USERS_PER_ROOM = 10;

/**
 * Timout for the room until it closes
 */
process.conf.MAX_ROOMTIME = 1000 * 60 * 5; // 5 minutes in ms

/**
 * Sets the chatbot. Used for testing chat responses.
 */
process.conf.FAKE_USER = true;
```

### Build
Simply run...
```
npm run freshSetup
```
...in the console and ...
```
npm start
```
...to start the server or...
```
npm run dev
```
...for nodemon.

### License
QuickChat is licenced under the [MIT license](https://choosealicense.com/licenses/mit/).

### Sources
The Art is either selfmade or from [pixabay](https://pixabay.com).