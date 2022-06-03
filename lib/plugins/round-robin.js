
/**
 * Deps.
 */

var slice = require('../utils').slice;

/**
 * Round-robin plugin.
 *
 * Provides a `send` method which will
 * write the `msg` to all connected peers.
 *
 * @param {Object} options
 * @api private
 */

module.exports = function(options){
  options = options || {};
  var fallback = options.fallback || function(){};

  return function(sock){

    /**
     * Bind callback to `sock`.
     */

    fallback = fallback.bind(sock);

    /**
     * Initialize counter.
     */

    var n = 0;

    /**
     * Sends `msg` to all connected peers round-robin.
     */

    sock.send = function() {
      var socks = this.socks;
      var len = socks.length;
      var sock = socks[n++ % len];

      var msg = slice(arguments);
      if (sock && sock.writable) {
        if(!sock.write(this.pack(msg))) {
          this.emit("busy");
        }
      } else {
        fallback(msg);
      }
    };

    /**
     * Sends `msg` to all connected peers round-robin.
     * @param {object} msg
     * @param {function(?Error):void} callback Called when message transmission is completed or interrupted.
     */

    sock.sendAndWait = function(msg, callback) {
      var socks = this.socks;
      var len = socks.length;
      var sock = socks[n++ % len];

      if (sock && sock.writable) {
        if(!sock.write(this.pack([msg]), callback)) {
          this.emit("busy");
        }
      } else {
        fallback(msg);
      }
    };

  };
};
