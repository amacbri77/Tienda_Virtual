# API Server

## Environment variables

- `PORT` (optional): server port. Defaults to `4000`.
- `AIRTABLE_API_KEY` (required): Airtable token.
- `AIRTABLE_BASE_ID` (required): Airtable base id.
- `AIRTABLE_TABLE_NAME` (optional): table name. Defaults to `products`.

## Endpoints

### `GET /health`
Simple health check.

### `GET /api/products`
Returns all products from Airtable.

Response:
```json
{
  "products": [
    {
      "id": "rec1",
      "name": "Anillo de oro",
      "category": "anillos",
      "price": 120
    }
  ]
}
```

### `GET /api/products/recommendations`
Returns curated recommendations with resilient bounds:
- up to 5 products
- at least 3 products when inventory has 3+
- fewer only when total inventory is fewer than 3.

Response:
```json
{
  "recommendations": [],
  "count": 0,
  "constraints": "3-5 when inventory allows"
}
```
