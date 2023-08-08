/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "44uodfl84s01cyw",
    "created": "2023-08-08 03:34:40.100Z",
    "updated": "2023-08-08 03:34:40.100Z",
    "name": "instanced_model",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "khh38hgr",
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
        "id": "rewxoyog",
        "name": "placements",
        "type": "json",
        "required": true,
        "unique": false,
        "options": {}
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
  const collection = dao.findCollectionByNameOrId("44uodfl84s01cyw");

  return dao.deleteCollection(collection);
})
