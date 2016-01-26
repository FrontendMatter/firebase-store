/**
 * Simple Firebase Paginator
 */
class Paginator {

	/**
	 * Constructor
	 * @param  {Firebase} ref   A Firebase reference.
	 * @param  {Number} limit 	Maximum results on page.
	 * @return {Paginator} Instance.
	 */
	constructor (ref, limit = 10) {
		this.ref = ref
		this.pageNumber = 0
		this.limit = limit
		this.lastPageNumber = null
		this.data = {}
	}

	/**
	 * Compute the Firebase reference for fetching the next page and the
	 * callback which needs to be executed in order to update the Paginator
	 * instance AFTER the computed reference is used.
	 * @return {Object} An object containing the computed Firebase reference and a Paginator callback
	 */
	nextPage () {
		if (this.isLastPage()) {
			return false
		}
		const lastKey = this._lastKey()
		const pri = lastKey ? null : undefined
		const ref = this.ref
				.startAt(pri, lastKey)
				.limit(this.limit + (lastKey ? 1 : 0))
		const cb = this._process.bind(this, lastKey, 'next')
		return { ref, cb }
	}

	/**
	 * Compute the Firebase reference for fetching the previous page and the
	 * callback which needs to be executed in order to update the Paginator
	 * instance AFTER the computed reference is used.
	 * @return {Object} An object containing the computed Firebase reference and a Paginator callback
	 */
	prevPage () {
		if (this.isFirstPage()) {
			return false
		}
		const firstKey = this._firstKey()
		const ref = this.ref
				.endAt(null, firstKey)
				.limit(this.limit + 1)
		const cb = this._process.bind(this, firstKey, 'prev')
		return { ref, cb }
	}

	/**
	 * Check if the current page is the first page.
	 * @return {Boolean}
	 */
	isFirstPage () {
		return this.pageNumber === 1
	}

	/**
	 * Check if the current page is the last page.
	 * @return {Boolean}
	 */
	isLastPage () {
		return this.pageNumber === this.lastPageNumber
	}

	/**
	 * Check if there are any results.
	 * @return {Boolean}
	 */
	hasResults () {
		return Object.keys(this.data).length > 0
	}

	/**
	 * Paginator callback which needs to be executed AFTER a Firebase query for
	 * fetching pages.
	 * @param  {String|undefined} dropKey   An optional key to remove from the result set.
	 * @param  {String} direction 			'next' or 'prev'
	 * @param  {Firebase} snapshot  		The Firebase snapshot result.
	 * @return {object} 					The final result set.
	 */
	_process (dropKey, direction = 'next', snapshot) {
		let data = snapshot.val()
		const len = snapshot.exists() ? Object.keys(data).length : 0

		if (len < this.limit) {
			this.lastPageNumber = this.pageNumber + (len > 0 ? 1 : 0)
		}
		if (len > 0) {
			if (direction === 'next') {
				this.pageNumber++
			}
			else {
				this.pageNumber--
			}
			if (dropKey) {
				delete data[dropKey]
			}
			this.data = data
		}
		return this.data
	}

	/**
	 * Get the first key from this.data
	 * @return {String|undefined} The key.
	 */
	_firstKey () {
		let key
		for (let k in this.data) {
			if (this.data.hasOwnProperty(k)) {
				key = k
				break
			}
		}
		return key
	}

	/**
	 * Get the last key from this.data
	 * @return {String|undefined} The key.
	 */
	_lastKey () {
		let key
		for (let k in this.data) {
			if (this.data.hasOwnProperty(k)) {
				key = k
			}
		}
		return key
	}

}
export default Paginator
module.exports = exports.default