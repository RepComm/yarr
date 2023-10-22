/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "n55frbej",
    "name": "rx",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "7h8wezrc",
    "name": "ry",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "kggmwfj5",
    "name": "rz",
    "type": "number",
    "required": false,
    "unique": false,
    "options": {
      "min": null,
      "max": null
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("g32k3w7qy4wbben")

  // remove
  collection.schema.removeField("n55frbej")

  // remove
  collection.schema.removeField("7h8wezrc")

  // remove
  collection.schema.removeField("kggmwfj5")

  return dao.saveCollection(collection)
})
