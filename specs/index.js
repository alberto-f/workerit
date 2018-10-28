/* globals describe, it */
const expect = require('chai').expect
const Workerit = require('../dist/workerit.js')

describe('Workerit - Public functions', function () {
  describe('#Workerit', function () {
    it('constructor', function () {
      expect(Workerit).to.be.a('function')
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
    })
  })

  describe('#install', function () {
    it('should', function () {
      expect(Workerit.prototype.install).to.be.a('function')
    })
  })

  describe('#postMessage', function () {
    it('should', function () {
      expect(Workerit.prototype.postMessage).to.be.a('function')
    })
  })
})
