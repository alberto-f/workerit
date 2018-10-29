/* globals describe, it */
const expect = require('chai').expect
const Workerit = require('../dist/workerit.js')

describe('Workerit - Public functions', function () {
  describe('#Workerit', function () {
    it('constructor', function () {
      // Function
      expect(Workerit).to.be.a('function')
      
      // State
      const w = new Workerit()
      expect(w._getState()).to.equal(Workerit.STATES.INIT)

      const listeners = w._getListeners()
      expect(Object.keys(listeners).length).to.equal(3)

      w._getListenersAllowed().forEach( listenerName => 
        expect(
          Object.keys(
            w._getListeners(listenerName)
          ).length
        ).to.equal(0)
      )
    })
  })

  describe('#addEventListener', function () {
    it('should', function () {
      expect(Workerit.prototype.addEventListener).to.be.a('function')
    })
  })

  describe('#removeEventListener', function () {
    it('should', function () {
      expect(Workerit.prototype.removeEventListener).to.be.a('function')
    })
  })

  describe('#terminate', function () {
    it('should', function () {
      expect(Workerit.prototype.terminate).to.be.a('function')

      const w = new Workerit()
      expect(w.terminate.bind(w)).to.throw('Workerit is not running.')
    })
  })

  describe('#install', function () {
    xit('should', function () {
      expect(Workerit.prototype.install).to.be.a('function')

      const w = new Workerit()
      w.install(function(){
        console.log('hello world')
      })

      expect(w._worker instanceof Worker).to.be(true)
    })
  })

  describe('#postMessage', function () {
    it('should', function () {
      expect(Workerit.prototype.postMessage).to.be.a('function')
    })
  })
})
