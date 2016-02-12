import Store from './firebase-store'
import Paginator from './firebase-paginator'

/**
 * Firebase Store with pagination.
 */
class StorePaginator extends Store {

	/**
	 * Constructor
	 */
	constructor () {
		super()

		/**
		 * Holds paginator instances
		 * @type {Object}
		 */
		this.paginator = {}
	}

	/*eslint spaced-comment:0*/
	////////////////
	// PAGINATION //
	////////////////

	/**
	 * Create a paginator.
	 */
	paginate (id, ref, limit = 6) {
		this.paginator[id] = new Paginator(ref, limit)
	}

	/**
	 * Get paginator results.
	 * @param {String} id 		The paginator ID.
	 * @param {String} type 	Page type ('prevPage' or 'nextPage')
	 * @return {Array} 			The results.
	 */
	getPaginatorResults (id, type) {
		this.emit('serviceLoading')
		let page
		try {
			page = this.paginator[id][type]()
		}
		catch (e) {
			this.emit('serviceError', e)
			return Promise.reject(e)
		}
		if (!page) {
			return Promise.resolve([])
		}
		return this.get(page.ref).then((snapshot) => {
			this.emit('serviceLoading')
			return page.cb(snapshot)
		})
	}

	/**
	 * Get paginator results call function.
	 * @param {String} id 	The paginator ID.
	 * @return {Array} 		The results.
	 */
	getPaginatorResultsCall (id) {
		let inst = this[camelCase(`get-paginator-${ id }`)]
		if (typeof inst !== 'function') {
			return false
		}
		return inst.bind(this)
	}

	/**
	 * Get paginator results for the next page.
	 * @param {String} id 	The paginator ID.
	 * @return {Array} 		The results.
	 */
	nextPage (id) {
		const args = [].slice.call(arguments, 1)
		const inst = this.getPaginatorResultsCall(id)
		if (!inst) {
			return Promise.reject(`invalid paginator results call ${ id }`)
		}
		return inst.apply(inst, ['nextPage'].concat(args))
	}

	/**
	 * Get paginator results for the previous page.
	 * @param {String} id 	The paginator ID.
	 * @return {Array} 		The results.
	 */
	prevPage (id) {
		const inst = this.getPaginatorResultsCall(id)
		if (!inst) {
			return Promise.reject(`invalid paginator results call ${ id }`)
		}
		return inst('prevPage')
	}
}

export default Store
module.exports = exports.default