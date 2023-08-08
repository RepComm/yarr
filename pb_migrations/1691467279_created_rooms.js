/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const collection = new Collection({
    "id": "qlwdj6hjgkqkzyj",
    "created": "2023-08-08 04:01:19.709Z",
    "updated": "2023-08-08 04:01:19.709Z",
    "name": "rooms",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "xvaw0iyl",
        "name": "instanced_models",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "44uodfl84s01cyw",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": null,
          "displayFields": []
        }
      },
      {
        "system": false,
        "id": "melakvdk",
        "name": "occupants",
        "type": "relation",
        "required": false,
        "unique": false,
        "options": {
          "collectionId": "g32k3w7qy4wbben",
          "cascadeDelete": false,
          "minSelect": null,
          "maxSelect": 64,
          "displayFields": [
            "name"
          ]
        }
      },
      {
        "system": false,
        "id": "bhuto7xh",
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
        "id": "bzvkvbjt",
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
  const collection = dao.findCollectionByNameOrId("qlwdj6hjgkqkzyj");

  return dao.deleteCollection(collection);
})
