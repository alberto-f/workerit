const workerit = new window.Workerit()

workerit.addEventListener('message', function (evt) {
  console.log('Message = ' + evt.data)
})

workerit.addEventListener('messageerror', function (error) {
  console.log('MessageError = ' + error)
})

workerit.addEventListener('error', function () {
  console.log('Error')
})

workerit.install(function (scope, event) {
  /*
   * We can import scripts but requires full path
   * importScripts('http://localhost:3030/embeed.js')
   */
  let res = 0
  for (let i = 0; i <= event.data; i++) {
    for (let j = 0; j <= event.data; j++) { res += i }
  }

  scope.postMessage(res)
})

workerit.postMessage(5000)
