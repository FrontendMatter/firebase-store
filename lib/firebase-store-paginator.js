'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _firebaseStore = require('./firebase-store');

var _firebaseStore2 = _interopRequireDefault(_firebaseStore);

var _firebasePaginator = require('./firebase-paginator');

var _firebasePaginator2 = _interopRequireDefault(_firebasePaginator);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

/**
 * Firebase Store with pagination.
 */

var StorePaginator = function (_Store) {
	_inherits(StorePaginator, _Store);

	/**
  * Constructor
  */

	function StorePaginator() {
		_classCallCheck(this, StorePaginator);

		/**
   * Holds paginator instances
   * @type {Object}
   */

		var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(StorePaginator).call(this));

		_this.paginator = {};
		return _this;
	}

	/*eslint spaced-comment:0*/
	////////////////
	// PAGINATION //
	////////////////

	/**
  * Create a paginator.
  */

	_createClass(StorePaginator, [{
		key: 'paginate',
		value: function paginate(id, ref) {
			var limit = arguments.length <= 2 || arguments[2] === undefined ? 6 : arguments[2];

			this.paginator[id] = new _firebasePaginator2.default(ref, limit);
		}

		/**
   * Get paginator results.
   * @param {String} id 		The paginator ID.
   * @param {String} type 	Page type ('prevPage' or 'nextPage')
   * @return {Array} 			The results.
   */

	}, {
		key: 'getPaginatorResults',
		value: function getPaginatorResults(id, type) {
			var _this2 = this;

			this.emit('serviceLoading');
			var page = undefined;
			try {
				page = this.paginator[id][type]();
			} catch (e) {
				this.emit('serviceError', e);
				return Promise.reject(e);
			}
			if (!page) {
				return Promise.resolve([]);
			}
			return this.get(page.ref).then(function (snapshot) {
				_this2.emit('serviceLoading');
				return page.cb(snapshot);
			});
		}

		/**
   * Get paginator results call function.
   * @param {String} id 	The paginator ID.
   * @return {Array} 		The results.
   */

	}, {
		key: 'getPaginatorResultsCall',
		value: function getPaginatorResultsCall(id) {
			var inst = this[camelCase('get-paginator-' + id)];
			if (typeof inst !== 'function') {
				return false;
			}
			return inst.bind(this);
		}

		/**
   * Get paginator results for the next page.
   * @param {String} id 	The paginator ID.
   * @return {Array} 		The results.
   */

	}, {
		key: 'nextPage',
		value: function nextPage(id) {
			var args = [].slice.call(arguments, 1);
			var inst = this.getPaginatorResultsCall(id);
			if (!inst) {
				return Promise.reject('invalid paginator results call ' + id);
			}
			return inst.apply(inst, ['nextPage'].concat(args));
		}

		/**
   * Get paginator results for the previous page.
   * @param {String} id 	The paginator ID.
   * @return {Array} 		The results.
   */

	}, {
		key: 'prevPage',
		value: function prevPage(id) {
			var inst = this.getPaginatorResultsCall(id);
			if (!inst) {
				return Promise.reject('invalid paginator results call ' + id);
			}
			return inst('prevPage');
		}
	}]);

	return StorePaginator;
}(_firebaseStore2.default);

exports.default = _firebaseStore2.default;

module.exports = exports.default;