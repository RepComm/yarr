/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cxxenim5mest0e2")

  collection.viewRule = "@collection.characters.owner.id = @request.auth.id && @collection.characters.roles.id ?= id"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("cxxenim5mest0e2")

  collection.viewRule = null

  return dao.saveCollection(collection)
})
