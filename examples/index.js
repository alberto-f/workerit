
/*
 *
 * Script to run in the worker
 *
 */
const workerRunner = (scope, event) => {
  /* 
   * We can import scripts but requires full path
   * importScripts('http://localhost:3030/embeed.js')
   */
  let res = 0
  for(let i = 0; i <= event.data; i++)
    for(let j = 0; j <= event.data; j++)
      res += i

  scope.postMessage(res)
}


const workit = new Workit(Worker)

workit.addEventListener('message', function(evt){
  console.log('Message = ' + evt.data)
})

workit.addEventListener('messageerror', function(error){
  console.log('MessageError')
})

workit.addEventListener('error', function(){
  console.log('Error')
})

workit.install(function(scope, event){
  /* 
   * We can import scripts but requires full path
   * importScripts('http://localhost:3030/embeed.js')
   */
  let res = 0
  for(let i = 0; i <= event.data; i++)
    for(let j = 0; j <= event.data; j++)
      res += i

  scope.postMessage(res)
})

workit.postMessage(5000)

