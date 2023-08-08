/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "v310p909h6q9sa5",
    "created": "2023-08-08 03:45:41.234Z",
    "updated": "2023-08-08 03:45:41.234Z",
    "name": "items",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "opyz6nva",
        "name": "definition",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "r4lvx43tqtvaz9t",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "gqcumycg",
        "name": "owner",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "g32k3w7qy4wbben",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 1,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "mqpx8b9h",
        "name": "count",
        "type": "number",
        "required": false,
        "unique": false,
        "options": {
          "min": 1,
          "max": 64
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
  const collection = dao.findCollectionByNameOrId("v310p909h6q9sa5");

  return dao.deleteCollection(collection);
})
