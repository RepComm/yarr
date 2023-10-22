/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "wphrmrak",
    "name": "roles",
    "type": "select",
    "required": false,
    "unique": false,
    "options": {
      "maxSelect": 7,
      "values": [
        "agent",
        "ninja",
        "blackbelt",
        "clerk",
        "guide",
        "news",
        "maint",
        "pizza",
        "coffee",
        "arcade",
        "dj"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // remove
  collection.schema.removeField("wphrmrak")

  return dao.saveCollection(collection)
})
