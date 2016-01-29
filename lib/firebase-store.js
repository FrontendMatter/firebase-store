'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _firebase = require('firebase');

var _firebase2 = _interopRequireDefault(_firebase);

var _events = require('events');

var _trim = require('mout/string/trim');

var _trim2 = _interopRequireDefault(_trim);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Store Firebase Service.
 * @extends {EventEmitter}
 */

var Store = function (_EventEmitter) {
	_inherits(Store, _EventEmitter);

	/**
  * Constructor
  */

	function Store(ref) {
		_classCallCheck(this, Store);

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Store).call(this));

		if (ref) {
			_this.setRef(ref);
		}
		return _this;
	}

	/**
  * Set a Firebase reference
  * @param {string} ref The Firebase URL.
  */

	_createClass(Store, [{
		key: 'setRef',
		value: function setRef(ref) {
			this.ref_base = ref;
			this.ref = new _firebase2.default(ref);
		}

		/**
   * Get a Firebase reference for a path
   * @param  {string} path 	The path.
   * @return {Firebase}		A Firebase reference.
   */

	}, {
		key: 'getRef',
		value: function getRef(path) {
			return this.ref.child(path);
		}

		/**
   * Get the path from a Firebase Reference
   * @param  {Firebase} ref 	The Firebase reference
   * @return {string}     	A Firebase path.
   */

	}, {
		key: 'getPathFromRef',
		value: function getPathFromRef(ref) {
			return (0, _trim2.default)(ref.toString().replace(this.ref_base, ''), '/');
		}

		/**
   * Get a Firebase reference from a path.
   * @param  {string|Firebase} path 	A path or Firebase reference.
   * @return {Firebase}      			A Firebase reference.
   */

	}, {
		key: 'pathToRef',
		value: function pathToRef(path) {
			var ref = path;
			if (typeof ref === 'string') {
				ref = this.getRef(path);
			}
			return ref;
		}

		/**
   * Sets data to a Firebase path.
   * @param {string} path 	The path to set.
   * @param {?} data 			The value to set.
   * @return {Promise} 		A Promise.
   */

	}, {
		key: 'set',
		value: function set(path, data) {
			var _this2 = this;

			this.emit('serviceLoading');
			return new Promise(function (resolve, reject) {
				var ref = _this2.pathToRef(path);
				ref.set(data, function (e) {
					if (e) {
						reject(e);
						_this2.emit('serviceError', e);
						return;
					}
					resolve(ref.key());
					_this2.emit('serviceComplete');
				});
			});
		}

		/**
   * Removes a path from Firebase.
   * @param  {string} path The path to remove.
   * @return {Promise}      A Promise.
   */

	}, {
		key: 'remove',
		value: function remove(path) {
			return this.set(path, null);
		}

		/**
   * Retrieve snapshot value once from a Firebase path.
   * @param {string} path 	The path to retrieve.
   * @return {Promise} 		A Promise.
   */

	}, {
		key: 'get',
		value: function get(path) {
			var _this3 = this;

			this.emit('serviceLoading');
			return new Promise(function (resolve, reject) {
				_this3.pathToRef(path).once('value', function (snapshot) {
					resolve(snapshot);
					_this3.emit('serviceComplete');
				}, function (e) {
					reject(e);
					_this3.emit('serviceError', e);
				});
			});
		}

		/**
   * Retrieve snapshot on event from a Firebase path.
   * @param  {string}   path      The path to retrieve.
   * @param  {string}   eventName A valid Firebase event name.
   * @param  {Function} cb        Success callback.
   * @param  {[type]}   error     Error callback.
   */

	}, {
		key: 'getOn',
		value: function getOn(path, eventName, cb, error) {
			var _this4 = this;

			this.pathToRef(path).on(eventName, function (snapshot) {
				cb(snapshot);
				_this4.emit('serviceComplete');
			}, function (e) {
				if (error) {
					error(e);
				}
				_this4.emit('serviceError', e);
			});
		}
	}]);

	return Store;
}(_events.EventEmitter);

exports.default = Store;

module.exports = exports.default;