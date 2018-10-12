
class WorkerFn {
  constructor(fn){

    const script = this._wrapFn(fn)
    const scriptBlob = new Blob([script], {type: 'application/javascript'})
    const scriptUrl = URL.createObjectURL(scriptBlob)

    this._worker = new Worker(scriptUrl)
  }

  _wrapFn(fn){
    const script = 'var f = ' + fn.toString() + ';' +
      'self.onmessage = function(e){f(self, e)} '
    return script
  }

  async exec(data) {
    return await new Promise((resolve, reject) => {
      // Activation message
      this._worker.postMessage(data)

      // On worker message, terminate worker
      this._worker.onmessage = (e) => {
        resolve(e)
        this._worker.terminate()
      }

      // On worker error, terminate worker
      this._worker.onerror = (e) => {
        reject(e)
        this._worker.terminate()
      }
    })
  }
}

const script = (scope, event) => {
  
  const script = (function () {
    importScripts('file:///Users/albertof/Github/workerfn/embeed.js')

    hello // contains "hello world"
    self.hello // undefined
    this.hello // undefined
  })()


  let res = 0
  for(let i = 0; i <= event.data; i++)
    for(let j = 0; j <= event.data; j++)
      res += i

  scope.postMessage(res)
}

const wf = new WorkerFn(script)
wf.exec(100000).then( response => console.log('VAL = ' + response.data) )



