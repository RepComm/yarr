/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hfe2jdhanb7par4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jz59wyyu",
    "name": "file",
    "type": "file",
    "required": true,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "maxSize": 5242880,
      "mimeTypes": [],
      "thumbs": [],
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("hfe2jdhanb7par4")

  // update
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "jz59wyyu",
    "name": "file",
    "type": "file",
    "required": true,
    "unique": false,
    "options": {
      "maxSelect": 1,
      "maxSize": 5242880,
      "mimeTypes": [
        "image/png",
        "image/svg+xml",
        "model/gltf-binary",
        "application/ogg"
      ],
      "thumbs": [],
      "protected": false
    }
  }))

  return dao.saveCollection(collection)
})
