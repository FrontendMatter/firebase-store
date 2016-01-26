'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Simple Firebase Paginator
 */

var Paginator = function () {

	/**
  * Constructor
  * @param  {Firebase} ref   A Firebase reference.
  * @param  {Number} limit 	Maximum results on page.
  * @return {Paginator} Instance.
  */

	function Paginator(ref) {
		var limit = arguments.length <= 1 || arguments[1] === undefined ? 10 : arguments[1];

		_classCallCheck(this, Paginator);

		this.ref = ref;
		this.pageNumber = 0;
		this.limit = limit;
		this.lastPageNumber = null;
		this.data = {};
	}

	/**
  * Compute the Firebase reference for fetching the next page and the
  * callback which needs to be executed in order to update the Paginator
  * instance AFTER the computed reference is used.
  * @return {Object} An object containing the computed Firebase reference and a Paginator callback
  */

	_createClass(Paginator, [{
		key: 'nextPage',
		value: function nextPage() {
			if (this.isLastPage()) {
				return false;
			}
			var lastKey = this._lastKey();
			var pri = lastKey ? null : undefined;
			var ref = this.ref.startAt(pri, lastKey).limit(this.limit + (lastKey ? 1 : 0));
			var cb = this._process.bind(this, lastKey, 'next');
			return { ref: ref, cb: cb };
		}

		/**
   * Compute the Firebase reference for fetching the previous page and the
   * callback which needs to be executed in order to update the Paginator
   * instance AFTER the computed reference is used.
   * @return {Object} An object containing the computed Firebase reference and a Paginator callback
   */

	}, {
		key: 'prevPage',
		value: function prevPage() {
			if (this.isFirstPage()) {
				return false;
			}
			var firstKey = this._firstKey();
			var ref = this.ref.endAt(null, firstKey).limit(this.limit + 1);
			var cb = this._process.bind(this, firstKey, 'prev');
			return { ref: ref, cb: cb };
		}

		/**
   * Check if the current page is the first page.
   * @return {Boolean}
   */

	}, {
		key: 'isFirstPage',
		value: function isFirstPage() {
			return this.pageNumber === 1;
		}

		/**
   * Check if the current page is the last page.
   * @return {Boolean}
   */

	}, {
		key: 'isLastPage',
		value: function isLastPage() {
			return this.pageNumber === this.lastPageNumber;
		}

		/**
   * Check if there are any results.
   * @return {Boolean}
   */

	}, {
		key: 'hasResults',
		value: function hasResults() {
			return Object.keys(this.data).length > 0;
		}

		/**
   * Paginator callback which needs to be executed AFTER a Firebase query for
   * fetching pages.
   * @param  {String|undefined} dropKey   An optional key to remove from the result set.
   * @param  {String} direction 			'next' or 'prev'
   * @param  {Firebase} snapshot  		The Firebase snapshot result.
   * @return {object} 					The final result set.
   */

	}, {
		key: '_process',
		value: function _process(dropKey) {
			var direction = arguments.length <= 1 || arguments[1] === undefined ? 'next' : arguments[1];
			var snapshot = arguments[2];

			var data = snapshot.val();
			var len = snapshot.exists() ? Object.keys(data).length : 0;

			if (len < this.limit) {
				this.lastPageNumber = this.pageNumber + (len > 0 ? 1 : 0);
			}
			if (len > 0) {
				if (direction === 'next') {
					this.pageNumber++;
				} else {
					this.pageNumber--;
				}
				if (dropKey) {
					delete data[dropKey];
				}
				this.data = data;
			}
			return this.data;
		}

		/**
   * Get the first key from this.data
   * @return {String|undefined} The key.
   */

	}, {
		key: '_firstKey',
		value: function _firstKey() {
			var key = undefined;
			for (var k in this.data) {
				if (this.data.hasOwnProperty(k)) {
					key = k;
					break;
				}
			}
			return key;
		}

		/**
   * Get the last key from this.data
   * @return {String|undefined} The key.
   */

	}, {
		key: '_lastKey',
		value: function _lastKey() {
			var key = undefined;
			for (var k in this.data) {
				if (this.data.hasOwnProperty(k)) {
					key = k;
				}
			}
			return key;
		}
	}]);

	return Paginator;
}();

exports.default = Paginator;

module.exports = exports.default;