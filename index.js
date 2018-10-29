/* globals Worker, Blob */

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
}

Workerit.STATES = STATES

Workerit.prototype._isAllowedState = function _isAllowedState (state) {
  return this._statesAllowed.some(stateAllowed => stateAllowed === state)
}

/*
 * State accessors
 */
Workerit.prototype._getState = function _getState () {
  return this._state
}

Workerit.prototype._setState = function _setState (state) {
  if (!this._isAllowedState(state)) {
    throw new Error('State ' + state + ' not allowed.')
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
  if (this._isListenerAllowed(eventName)) {
    this._addListener(eventName, cb)
  }
}

Workerit.prototype.removeEventListener = function removeEventListener (eventName, cb) {

}

Workerit.prototype.postMessage = function postMessage (data) {
  // Update listeners
  this._registerListeners()

  // Set state to RUNNING
  this._setState(Workerit.STATES.RUNNING)

  // Start Worker
  this._worker.postMessage(data)
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

Workerit.prototype._isListenerAllowed = function _isListenerAllowed (type) {
  return this._getListenersAllowed().some(name => name === type)
}

Workerit.prototype._getListeners = function _getListeners (type) {
  if (type !== undefined && this._isListenerAllowed(type)) {
    return this._listeners[type]
  } else {
    return this._listeners
  }
}

Workerit.prototype._addListener = function _addListener (type, listener) {
  if (this._isListenerAllowed(type)) {
    this._listeners[eventName].push(listener)
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


/*
 * Worker script
 */
Workerit.prototype._createWorkerScript = function _createWorkerScript (fn) {
  return `const f = ${fn}; self.onmessage = (e) => f(self, e)`
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



export default Workerit
