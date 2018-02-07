//Queue for adding newly submitted items to Backazon inventory

var Queue = function() {
  this.storage = {}
  this.count = 0
  this.lowestCount = 0
}

Queue.prototype.enqueue = function(item) {
  if (item) {
    this.storage[this.count] = item
    this.count++
  }
}

Queue.prototype.dequeue = function() {
  if (this.count - this.lowestCount === 0) {
    return undefined
  }

  var result = this.storage[this.lowestCount]
  delete this.storage[this.lowestCount]
  this.lowestCount++
  return result
}

Queue.prototype.size = function() {
  return this.count - this.lowestCount
}

module.exports = new Queue()
