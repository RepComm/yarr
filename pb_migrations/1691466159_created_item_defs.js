/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "r4lvx43tqtvaz9t",
    "created": "2023-08-08 03:42:39.537Z",
    "updated": "2023-08-08 03:42:39.537Z",
    "name": "item_defs",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "sqfk2svm",
        "name": "wearable_bone_name",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": 32,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "2g7a0wvb",
        "name": "asset",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "hfe2jdhanb7par4",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "hlxolbjv",
        "name": "wearable",
        "type": "bool",
        "required": false,
        "unique": false,
        "options": {}
      },
      {
        "system": false,
        "id": "yq9bquwy",
        "name": "label",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "0diqolao",
        "name": "description",
        "type": "text",
        "required": false,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "indexes": [],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("r4lvx43tqtvaz9t");

  return dao.deleteCollection(collection);
})
