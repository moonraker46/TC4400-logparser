module.exports = Buffer.from || function() {
    if (arguments.length === 1) {
        return new Buffer(arguments[0]);
    }
    if (arguments.length === 2) {
        return new Buffer(arguments[0], arguments[1]);
    }
    if (arguments.length === 3) {
        return new Buffer(arguments[0], arguments[1], arguments[2]);
    }
};
