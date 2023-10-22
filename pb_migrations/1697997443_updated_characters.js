/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // remove
  collection.schema.removeField("wphrmrak")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "nkmkgbt1",
    "name": "roles",
    "type": "relation",
    "required": false,
    "unique": false,
    "options": {
      "collectionId": "cxxenim5mest0e2",
      "cascadeDelete": false,
      "minSelect": null,
      "maxSelect": null,
      "displayFields": [
        "name"
      ]
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
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

  // remove
  collection.schema.removeField("nkmkgbt1")

  return dao.saveCollection(collection)
})
