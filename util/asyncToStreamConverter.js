"use strict";

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const _require = require("readable-stream"),
      Readable = _require.Readable;

const getSymbol = typeof Symbol === "function" ? name => {
  const symbol = Symbol[name];
  return symbol !== undefined ? symbol : `@@${name}`;
} : name => `@@${name}`;
const $$asyncIterator = asyncIteratorToStream.$$asyncIterator = getSymbol("asyncIterator");
const $$iterator = asyncIteratorToStream.$$iterator = getSymbol("iterator");

const resolveToIterator = value => {
  let tmp;

  if (typeof (tmp = value[$$asyncIterator]) === "function") {
    return tmp.call(value);
  }

  if (typeof (tmp = value[$$iterator]) === "function") {
    return tmp.call(value);
  }

  return value;
};

function asyncIteratorToStream(iterable, options) {
  if (typeof iterable === "function") {
    return function () {
      return asyncIteratorToStream(iterable.apply(this, arguments), options);
    };
  }

  const then = iterable.then;

  if (typeof then === "function") {
    return then.call(iterable, iterable => asyncIteratorToStream(iterable, options));
  }

  const iterator = resolveToIterator(iterable);
  const isGenerator = ("return" in iterator);
  const readable = options instanceof Readable ? options : new Readable(options);

  if (isGenerator) {
    readable._destroy = function () {
      var _ref = _asyncToGenerator(function* (error, cb) {
        try {
          yield error != null ? iterator.throw(error) : iterator.return();
        } catch (error) {
          return cb(error);
        }

        cb(error);
      });

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }();
  }

  let running = false;

  readable._read = function () {
    var _ref2 = _asyncToGenerator(function* (size) {
      if (running) {
        return;
      }

      running = true;

      try {
        let value;

        do {
          let cursor = iterator.next(size);

          if (typeof cursor.then === "function") {
            cursor = yield cursor;
          } else {
            while (!cursor.done && (value = cursor.value) != null && typeof value.then === "function") {
              try {
                value = yield value;
              } catch (error) {
                cursor = iterator.throw(error);
                continue;
              }

              cursor = iterator.next(value);
            }
          }

          if (cursor.done) {
            return readable.push(null);
          }

          value = cursor.value;
        } while (value === undefined || readable.push(JSON.stringify(value)));
      } catch (error) {
        process.nextTick(readable.emit.bind(readable, "error", error));
      } finally {
        running = false;
      }
    });

    return function (_x3) {
      return _ref2.apply(this, arguments);
    };
  }();

  return readable;
}

module.exports = asyncIteratorToStream;

asyncIteratorToStream.obj = (iterable, options) => asyncIteratorToStream(iterable, _extends({
  objectMode: true
}, options));
//# sourceMappingURL=index.js.map