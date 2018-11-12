/* globals Worker, Blob, ImageData, ArrayBuffer,
  Int8Array, Uint8Array, Uint8ClampedArray, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array
*/

/* Utils */
const typedArray = [
  Int8Array,
  Uint8Array,
  Uint8ClampedArray,
  Int16Array,
  Uint16Array,
  Int32Array,
  Uint32Array,
  Float32Array,
  Float64Array
]

const isTypedArray = (transferable) => {
  return typedArray.some(typed => transferable instanceof typed)
}

const isTransferableObject = (transferable) => {
  return (transferable instanceof ArrayBuffer ||
    transferable instanceof ImageData ||
    isTypedArray(transferable))
}

/*
 *
 * Workit Class
 *
 */
const STATES = {
  INIT: 'INIT',
  RUNNING: 'RUNNING',
  END: 'END'
}

function Workerit () {
  this._state = STATES.INIT

  this._statesAllowed = Object.keys(STATES)
  this._listenersAllowed = ['message', 'messageerror', 'error']
  

  this._listeners = {}
  this._listenersAllowed.forEach(name => {
    this._listeners[name] = []
  })

  this._customListeners = {}
}

/*
 * State accessors
 */
Workerit.STATES = STATES

Workerit.prototype._isAllowedState = function _isAllowedState (state) {
  return this._statesAllowed.some(stateAllowed => stateAllowed === state)
}

Workerit.prototype._getState = function _getState () {
  return this._state
}

Workerit.prototype._setState = function _setState (state) {
  if (!this._isAllowedState(state)) {
    throw new Error('State *' + state + '* not allowed.')
  }

  this._state = state
}

Workerit.prototype._isState = function _isState (state) {
  return this._state === state
}

/*
 * Wrapping Worker methods
 */
Workerit.prototype.addEventListener = function addEventListener (eventName, cb) {
  this._addListener(eventName, cb)
}

Workerit.prototype.removeEventListener = function removeEventListener (eventName, cb) {
  this._removeListener(eventName, cb)
}

Workerit.prototype.postMessage = function postMessage (data, transfer) {
  // Update listeners
  this._registerListeners()

  this._registerCustomListeners()

  // Set state to RUNNING
  this._setState(Workerit.STATES.RUNNING)

  // Create data structure that worker will receive.
  const d = this._createPostMessageData(data, transfer)

  // Start Worker
  if (isTransferableObject(transfer)) {
    this._worker.postMessage(d, [transfer])
  } else {
    this._worker.postMessage(d)
  }
}

Workerit.prototype._createPostMessageData = function _createPostMessageData (data, transfer) {
  return Object.assign({}, data, { transferredData: transfer })
}

Workerit.prototype.terminate = function terminate () {
  if (this._isState(Workerit.STATES.RUNNING)) {
    this._worker.terminate()
  } else {
    throw new Error('Workerit is not running.')
  }
}

/*
 * Listeners
 */
Workerit.prototype._getListenersAllowed = function _getListenersAllowed () {
  return this._listenersAllowed
}

Workerit.prototype._isListenerAllowed = function _isListenerAllowed (eventName) {
  return this._getListenersAllowed().some(name => name === eventName)
}

Workerit.prototype._getListeners = function _getListeners (eventName) {
  if (eventName == undefined) {
    return this._listeners
  } else if (this._isListenerAllowed(eventName)) {
    return this._listeners[eventName]
  } else {
    throw new Error('#_getListeners: Unknown listener *' + eventName + '*')
  }
}

/*
 * Custom Listeners
 */
Workerit.prototype._addCustomListener = function _addCustomListener (eventName, listenerFn) {
  this._customListeners[eventName]
  ? this._customListeners[eventName].push(listenerFn)
  : this._customListeners[eventName] = [listenerFn]
}

Workerit.prototype._getCustomListeners = function _getCustomListeners (channel) {
  return this._customListeners[channel] || []
}

Workerit.prototype._extractCustomListenerEventName = function _extractCustomListenerEventName (fullEventName) {
  const regex = /^(?:message):(.*)$/ig
  const response = regex.exec(fullEventName)
  if (response.length > 1) {
    return response[1]
  } else {
    throw new Error('#_extractCustomListenerEventName: Unknown listener *' + fullEventName + '*')
  }
}

Workerit.prototype._isCustomListener = function _isCustomListener (eventName) {
  return this._getCustomListeners().some(name => name === eventName) ||
          !!this._extractCustomListenerEventName(eventName)
}

Workerit.prototype._addListener = function _addListener (eventName, listenerFn) {
  if (this._isListenerAllowed(eventName)) {
    this._listeners[eventName].push(listenerFn)
  } else if (this._isCustomListener(eventName)) {
    const resolvedEventName = this._extractCustomListenerEventName(eventName)
    this._addCustomListener(resolvedEventName, listenerFn)
  } else {
    throw new Error('#_addListener: Unknown listener *' + eventName + '*')
  }
}

Workerit.prototype._removeListener = function _removeListener (eventName, listenerFn) {
  const _listeners = this._getListeners(eventName)
  const index = _listeners && _listeners.length
    ? _listeners.indexOf(listenerFn)
    : -1

  if (index > -1) {
    _listeners.splice(index, 1)
  }
}

Workerit.prototype._registerListeners = function _registerListeners () {
  this._getListenersAllowed().forEach(eventName => {
    this._listeners[eventName].forEach(listener => {
      // Remove prev listeners
      this._worker.removeEventListener(eventName, listener)

      // Register new listeners
      this._worker.addEventListener(eventName, listener)
    })

    // Any action that is triggered will move the worker state to END state
    this._worker.addEventListener(eventName, () => this._setState(Workerit.STATES.END))
  })
}

Workerit.prototype._registerCustomListeners = function _registerCustomListeners () {
  // Register new listeners
  this._worker.addEventListener('message', (evt) => {
    const { channel } = evt.data
    const listenersFn = this._getCustomListeners(channel)
    if (listenersFn) {
      listenersFn.forEach( listenerFn => listenerFn(evt) )
    }
  })
}

/*
 * Allow install a fn in a worker
 */
Workerit.prototype.install = function install (fn) {
  const script = this._createWorkerScript(fn)
  const scriptBlob = new Blob([script], { type: 'application/javascript' })
  const scriptUrl = URL.createObjectURL(scriptBlob)

  this._worker = new Worker(scriptUrl)
}

/*
 * Worker script
 */
Workerit.prototype._createWorkerScript = function _createWorkerScript (fn) {
  function notify (self) {
    return (channel, data) => self.postMessage({ channel, data })
  }

  if (typeof fn === 'function') {
    return `self.notify = ${notify}(self); const f = ${fn}; self.onmessage = (e) => f(self, e)`
  } else {
    throw Error('#_createWorkerScript: Expect a function but got *' + typeof fn + '*')
  }
}

export default Workerit
