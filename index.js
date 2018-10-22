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

function Workit () {
  this._state = STATES.INIT

  this._statesAllowed = Object.keys(STATES)
  this._listenersAllowed = ['message', 'messageerror', 'error']

  this._listeners = {}
  this._listenersAllowed.forEach(name => {
    this._listeners[name] = []
  })
}

Workit.prototype._isAllowedState = function _isAllowedState (state) {
  return this._statesAllowed.some(stateAllowed => stateAllowed === state)
}

Workit.prototype._setState = function _setState (state) {
  if (!this._isAllowedState(state)) {
    throw new Error('State ' + state + ' not allowed.')
  }

  this._state = state
}

Workit.prototype._isState = function _isState (state) {
  return this._state === state
}

Workit.prototype.addEventListener = function addEventListener (eventName, cb) {
  if (this._listenersAllowed.some(name => name === eventName)) {
    this._listeners[eventName].push(cb)
  }
}

Workit.prototype.removeEventListener = function removeEventListener (eventName, cb) {

}

Workit.prototype.terminate = function terminate () {
  if (this._isState(STATES.RUNNING)) {
    this._worker.terminate()
  } else {
    throw new Error('Workit is not running.')
  }
}

Workit.prototype.install = function install (fn) {
  const script = this._createWorkerScript(fn)
  const scriptBlob = new Blob([script], { type: 'application/javascript' })
  const scriptUrl = URL.createObjectURL(scriptBlob)

  this._worker = new Worker(scriptUrl)
}

Workit.prototype._registerListeners = function _updateListeners () {
  this._listenersAllowed.forEach(eventName => {
    this._listeners[eventName].forEach(listener => {
      // Remove prev listeners
      this._worker.removeEventListener(eventName, listener)

      // Register new listeners
      this._worker.addEventListener(eventName, listener)
    })

    // Any action that is triggered will move the worker state to END state
    this._worker.addEventListener(eventName, () => this._setState(STATES.END))
  })
}

Workit.prototype.postMessage = function postMessage (data) {
  // Update listeners
  this._registerListeners()

  // Set state to RUNNING
  this._setState(STATES.RUNNING)

  // Start Worker
  this._worker.postMessage(data)
}

Workit.prototype._createWorkerScript = function _createWorkerScript (fn) {
  return `const f = ${fn}; self.onmessage = (e) => f(self, e)`
}

export default Workit
