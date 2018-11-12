const workerit = new window.Workerit()

// workerit.addEventListener('message', function (evt) {
//   console.log('Message')
// })

workerit.addEventListener('message:progress', function (evt) {
  console.log('Message:progress')
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
  for (let i = 0; i <= event.data.times; i++) {
    for (let j = 0; j <= event.data.times; j++) { res += i }
    scope.notify('progress', i / event.data.times)
  }

  scope.postMessage(res)
})

const arrBuf = new ArrayBuffer(8)
workerit.postMessage({ times: 5000 })
