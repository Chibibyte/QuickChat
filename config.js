process.conf = {};

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