const { unstable_batchedUpdates } = require("react-dom")
const Yallist = require("yallist")

Yallist.prototype.replaceNode

class Cauldron {
  constructor(array = [], { idField = "id", indexes = [] } = {}) {
    this.idField = idField
    this.list = Yallist.create(array)
    this.byId = new Map()
    let node = this.list.head
    while (node) {
      this.byId.set(node.value.id, node)
      node = node.next
    }
    this.listeners = new Map()
    this.listenersById = new Map()
    this.transactionEvents = []
    this.inTransaction = false
    this.inRollback = false
  }

  transaction(mutator) {
    const isOuterTransaction = this.inTransaction
    this.inTransaction = true
    try {
      if (isOuterTransaction) {
        this.transactionEvents = []
      }
      mutator()
      if (isOuterTransaction) {
        this._notifyListeners()
      }
    } catch (error) {
      if (isOuterTransaction) {
        console.error("Error occurred during transaction. Transaction canceled with no changes.")
        this.inRollback = true
        this._revertTransaction()
      }
      throw error
    } finally {
      this.inRollback = false
      this.inTransaction = false
    }
  }

  _notifyListeners() {
    unstable_batchedUpdates(() => {})
  }

  _revertTransaction() {
    while (this.transactionEvents.length > 0) {
      const { type, node } = this.transactionEvents.pop()
      if (type === "add") {
        // remove added item
      } else {
      }
    }
  }

  _transactionLogAdd(node) {
    this.list.pushNode(node)
    this.byId.set(node.value.id, node)
    this.transactionEvents.push({ type: "add", node })
  }

  _transactionRollbackAdd(node) {}

  _transactionLogRemove(item) {
    if (!this.inRollback) {
      this.transactionEvents.push({ type: "remove", node })
    }
  }

  add(item) {
    const node = this.byId.get(item.id)
    if (node) {
      this._transactionLogRemove(node.value)
      node.value = item
    } else {
      this._transactionLogAdd(item)
      const node = new Yallist.Node(item)
      this.list.pushNode(node)
      this.byId.set(item.id, node)
    }
    return this.byId.size
  }

  remove(item) {
    const node = this.byId.get(item.id)
    if (node) {
      this._transactionLogRemove(node.value)
      this.list.removeNode(node)
      this.byId.delete(item.id)
      return node.value
    } else {
      // do nothing
    }
  }

  removeById(id) {
    return this.remove({ id })
  }

  get(id) {
    return this.byId.get(id)?.value
  }

  toArray() {
    return this.list.toArray()
  }

  forEach(callback, thisArg) {
    return this.list.forEach(callback, thisArg)
  }

  map(callback, thisArg) {
    return this.list.map(callback, thisArg)
  }

  *[Symbol.iterator]() {
    let node = this.list.head

    while (node) {
      yield node.value
      node = node.next
    }
  }
}
module.exports = Cauldron

// function sample() {
//   const cauldron = new Cauldron()

//   cauldron.transaction(() => {
//     for (const item of itemsToAdd) {
//       cauldron.add(item)
//     }
//     for (const item of itemsToRemove) {
//       cauldron.remove(item)
//     }
//   })
// }
