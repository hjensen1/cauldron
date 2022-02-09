const t = require("tap")
const Cauldron = require("./cauldron.js")

const list = [{ id: 1 }, { id: 2 }, { id: "3" }]

t.doesNotThrow(() => new Cauldron(), "Init new cauldron")
t.same(new Cauldron(list).toArray(), list)

let cauldron = new Cauldron()
cauldron.add(list[0])
cauldron.add(list[1])
cauldron.remove(list[0])
t.same(cauldron.toArray(), [list[1]])
