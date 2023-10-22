/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  collection.createRule = "@request.auth.id != \"\" && @request.auth.id = owner.id"
  collection.updateRule = "@request.auth.id != \"\" && @request.auth.id = owner.id"
  collection.deleteRule = "@request.auth.id != \"\" && @request.auth.id = owner.id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  collection.createRule = null
  collection.updateRule = null
  collection.deleteRule = null

  return dao.saveCollection(collection)
})
