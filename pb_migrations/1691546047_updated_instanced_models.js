/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44uodfl84s01cyw")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "khh38hgr",
    "name": "asset",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "hfe2jdhanb7par4",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": [
        "file"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("44uodfl84s01cyw")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "khh38hgr",
    "name": "asset",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "hfe2jdhanb7par4",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 1,
      "displayFields": [
        "label"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
