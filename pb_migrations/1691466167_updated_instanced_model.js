/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44uodfl84s01cyw")

  collection.name = "instanced_models"

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44uodfl84s01cyw")

  collection.name = "instanced_model"

  return dao.saveCollection(collection)
})
