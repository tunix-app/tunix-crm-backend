### Retrieve all Sessions within a given calendar range
`POST ./sessions/trainer/{trainer_id}`

Request Body: 
```json
{
	"start_range": "2025-10-06T00:00:00.000Z",
	"end_range": "2025-10-12T11:59:59.000Z"
}
```

Response:
```json
[
    {
        "id": "19eaf905-56cf-4f68-94d2-d397311cdd2c",
        "client_id": "7ed42ee7-aa61-4623-9898-5781762dde30",
        "client_name": "Emma Wilson",
        "session_type": "Personal Training",
        "start_date": "2025-10-06T16:30:00.000Z",
        "end_date": "2025-10-06T17:30:00.000Z",
        "description": ""
    },
    {
        "id": "7c35ad0a-f458-4960-ae65-af415a5ab64a",
        "client_id": "a4e83e7b-d882-41ce-b660-a17d54019e9f",
        "client_name": "Mike Johnson",
        "session_type": "Mobility Work",
        "start_date": "2025-10-06T16:30:00.000Z",
        "end_date": "2025-10-06T17:30:00.000Z",
        "description": ""
    },
    {
        "id": "f07998c0-e5e5-414b-b7d6-741bb32134c1",
        "client_id": "fe7b5608-fff4-41c7-b2b4-54c1472d285c",
        "client_name": "Sara Lee",
        "session_type": "Rehab Session",
        "start_date": "2025-10-06T16:30:00.000Z",
        "end_date": "2025-10-06T17:30:00.000Z",
        "description": ""
    }
]
```

### Create new Session:
`POST ./session`

Request Body: 
```json
{
    "client_id": "7ed42ee7-aa61-4623-9898-5781762dde30",
    "client_name": "Emma Wilson",
    "client_email": "emma.wilson@gmail.com",
    "session_type": "Rehab",
	"start_time": "2025-10-06T00:00:00.000Z",
	"end_time": "2025-10-12T11:59:59.000Z",
    "description": ""
}
```

Response: 
```json
{
    "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
    "client_id": "7ed42ee7-aa61-4623-9898-5781762dde30",
    "client_name": "Emma Wilson",
    "client_email": "emma.wilson@gmail.com",
    "session_type": "Rehab",
	"start_time": "2025-10-06T00:00:00.000Z",
	"end_time": "2025-10-12T11:59:59.000Z",
    "description": ""
}
```

### Update Existing Session:
`PATCH ./session/{session_id}`

Request Body: 
```json
{
    "session_type": "Rehab",
	"start_time": "2025-10-06T00:00:00.000Z",
	"end_time": "2025-10-12T11:59:59.000Z",
    "description": ""
}
```

Response: 
```json
{
    "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
    "client_id": "7ed42ee7-aa61-4623-9898-5781762dde30",
    "client_name": "Emma Wilson",
    "client_email": "emma.wilson@gmail.com",
    "session_type": "Rehab",
	"start_time": "2025-10-06T00:00:00.000Z",
	"end_time": "2025-10-12T11:59:59.000Z",
    "description": ""
}
```

### Delete Existing Session:
`DELETE ./session/{sessionId}`

Response:
```json
{
    "message": "session has been cancelled"
}
```