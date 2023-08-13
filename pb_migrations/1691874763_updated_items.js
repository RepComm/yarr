/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v310p909h6q9sa5")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "bu8r7o59",
    "name": "description",
    "type": "text",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": 64,
      "pattern": ""
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("v310p909h6q9sa5")

  // remove
  collection.schema.removeField("bu8r7o59")

  return dao.saveCollection(collection)
})
