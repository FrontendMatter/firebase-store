import Firebase from 'firebase'
import { EventEmitter } from 'events'
import trim from 'mout/string/trim'

/**
 * Store Firebase Service.
 * @extends {EventEmitter}
 */
class Store extends EventEmitter {

	/**
	 * Constructor
	 */
	constructor (ref) {
		super()

		if (ref) {
			this.setRef(ref)
		}
	}

	/**
	 * Set a Firebase reference
	 * @param {string} ref The Firebase URL.
	 */
	setRef (ref) {
		this.ref_base = ref
		this.ref = new Firebase(ref)
	}

	/**
	 * Get a Firebase reference for a path
	 * @param  {string} path 	The path.
	 * @return {Firebase}		A Firebase reference.
	 */
	getRef (path) {
		return this.ref.child(path)
	}

	/**
	 * Get the path from a Firebase Reference
	 * @param  {Firebase} ref 	The Firebase reference
	 * @return {string}     	A Firebase path.
	 */
	getPathFromRef (ref) {
		return trim(ref.toString().replace(this.ref_base, ''), '/')
	}

	/**
	 * Get a Firebase reference from a path.
	 * @param  {string|Firebase} path 	A path or Firebase reference.
	 * @return {Firebase}      			A Firebase reference.
	 */
	pathToRef (path) {
		let ref = path
		if (typeof ref === 'string') {
			ref = this.getRef(path)
		}
		return ref
	}

	/**
	 * Sets data to a Firebase path.
	 * @param {string} path 		The path to set.
	 * @param {?} data 				The value to set.
	 * @param {string} objectId 	Set an explicit objectId
	 * @return {Promise} 			A Promise.
	 */
	set (path, data, objectId) {
		this.emit('serviceLoading')
		return new Promise((resolve, reject) => {
			const ref = this.pathToRef(path)
			if (!objectId) {
				objectId = ref.key()
			}
			if (data && typeof data === 'object') {
				// using Object.assign to also clean up 
				// any non-own properties like observers
				data = Object.assign({}, { objectId }, data)
			}
			try {
				ref.set(data, (e) => {
					if (e) {
						this.emit('serviceError', e)
						return reject(e)
					}
					resolve(objectId)
					this.emit('serviceComplete')
				})
			}
			catch (e) {
				this.emit('serviceError', e)
				return reject(e)
			}
		})
	}

	/**
	 * Removes a path from Firebase.
	 * @param  {string} path The path to remove.
	 * @return {Promise}      A Promise.
	 */
	remove (path) {
		return this.set(path, null)
	}

	/**
	 * Retrieve snapshot value once from a Firebase path.
	 * @param {string} path 	The path to retrieve.
	 * @return {Promise} 		A Promise.
	 */
	get (path) {
		this.emit('serviceLoading')
		return new Promise((resolve, reject) => {
			this.pathToRef(path).once('value', (snapshot) => {
				resolve(snapshot)
				this.emit('serviceComplete')
			}, (e) => {
				reject(e)
				this.emit('serviceError', e)
			})
		})
	}

	/**
	 * Convert a Firebase snapshot object to array
	 * @param  {Object} snapshot 	A Firebase snapshot.
	 * @return {Array}
	 */
	snapshotArray (snapshot) {
		const results = snapshot.val()
		const array = []
		for (let objectId in results) {
			array.push(results[objectId])
		}
		return array
	}

	/**
	 * Retrieve snapshot on event from a Firebase path.
	 * @param  {string}   path      The path to retrieve.
	 * @param  {string}   eventName A valid Firebase event name.
	 * @param  {Function} cb        Success callback.
	 * @param  {[type]}   error     Error callback.
	 */
	getOn (path, eventName, cb, error) {
		this.pathToRef(path).on(eventName, (snapshot) => {
			cb(snapshot)
			this.emit('serviceComplete')
		}, (e) => {
			if (error) {
				error(e)
			}
			this.emit('serviceError', e)
		})
	}
}

export default Store
module.exports = exports.default