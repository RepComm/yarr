/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "rrgintp6",
    "name": "color",
    "type": "text",
    "required": true,
    "unique": false,
    "options": {
      "min": 7,
      "max": 7,
      "pattern": "^#[a-f0-9]{6}$"
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // remove
  collection.schema.removeField("rrgintp6")

  return dao.saveCollection(collection)
})
