/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gzdlkolj",
    "name": "equipped",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "v310p909h6q9sa5",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 64,
      "displayFields": [
        "description"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "gzdlkolj",
    "name": "equipped",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "v310p909h6q9sa5",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": 64,
      "displayFields": [
        "definition"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
