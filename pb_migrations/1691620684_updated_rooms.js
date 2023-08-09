/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qlwdj6hjgkqkzyj")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xvaw0iyl",
    "name": "instanced_models",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "44uodfl84s01cyw",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": []
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qlwdj6hjgkqkzyj")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "xvaw0iyl",
    "name": "instanced_models",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "44uodfl84s01cyw",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": [
        "asset"
      ]
    }
  }))

  return dao.saveCollection(collection)
})
