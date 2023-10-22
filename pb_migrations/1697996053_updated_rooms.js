/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qlwdj6hjgkqkzyj")

  // add
  collection.schema.addField(new SchemaField({
    "system": false,
    "id": "zxahimrh",
    "name": "is_listable",
    "type": "bool",
    "required": false,
    "unique": false,
    "options": {}
  }))

  return dao.saveCollection(collection)
}, (db) => {
  const dao = new Dao(db)
  const collection = dao.findCollectionByNameOrId("qlwdj6hjgkqkzyj")

  // remove
  collection.schema.removeField("zxahimrh")

  return dao.saveCollection(collection)
})
