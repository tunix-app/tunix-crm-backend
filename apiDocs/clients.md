### Retrieve all Clients for Trainer
`GET ./client/trainer/{trainerId}`

Response:
```json
[
    {
        "id": "19eaf905-56cf-4f68-94d2-d397311cdd2c",
        "client_id": "7ed42ee7-aa61-4623-9898-5781762dde30",
        "client_name": "Emma Wilson",
        "client_email": "emma.wilson@gmail.com",
        "isActive": true,
        "last_session": "2025-10-06T00:00:00.000Z",
        "next_session": "2025-10-06T00:00:00.000Z",
        "current_program": "Mobility Restoration"
    },
    {
        "id": "019a944b-87a1-4bd7-8b60-a9c5906251cd",
        "client_id": "29134f06-ec72-4330-9b3f-82b16f84dcb8",
        "client_name": "Mike Johnson",
        "client_email": "mike.johnson@gmail.com",
        "isActive": true,
        "last_session": "2025-10-06T00:00:00.000Z",
        "next_session": "2025-10-06T00:00:00.000Z",
        "current_program": null
    },
    {
        "id": "ce57b615-7529-42f3-9a6f-661a0918613a",
        "client_id": "3a50516e-4bf5-42fa-bf75-f26ffcf48251",
        "client_name": "Tom Garcia",
        "client_email": "tom.garcia@gmail.com",
        "isActive": true,
        "last_session": "2025-10-06T00:00:00.000Z",
        "next_session": "2025-10-06T00:00:00.000Z",
        "current_program": "Beginner Strength"
    }
]
```

Notes: the `current_program` column is not yet implemented yet so it is still null currently

### Search Clients
`POST ./client/search-clients`

Request Body:
```json
{
    "query": "Em"
}
```

Response:
```json
[
    {
        "id": "19eaf905-56cf-4f68-94d2-d397311cdd2c",
        "client_id": "3a50516e-4bf5-42fa-bf75-f26ffcf48251",
        "client_name": "Emma Wilson",
        "client_email": "emma.wilson@gmail.com",
        "isActive": true,
        "last_session": "2025-10-06T00:00:00.000Z",
        "next_session": "2025-10-06T00:00:00.000Z",
        "current_program": "Mobility Restoration"
    },
    {
        "id": "019a944b-87a1-4bd7-8b60-a9c5906251cd",
        "client_id": "db52e4c9-c2f5-469f-b4dd-50d1215dbd88",
        "client_name": "Grace Embers",
        "client_email": "grace.embers@gmail.com",
        "status": "Inactive",
        "last_session": "2025-10-06T00:00:00.000Z",
        "next_session": "2025-10-06T00:00:00.000Z",
        "current_program": "Core Restoration"
    },
    {
        "id": "ce57b615-7529-42f3-9a6f-661a0918613a",
        "client_id": "1e6f15bd-27f3-47c7-9a89-a38dc189a031",
        "client_name": "Jordan Haslem",
        "client_email": "jordan.haslem@gmail.com",
        "isActive": true,
        "last_session": "2025-10-06T00:00:00.000Z",
        "next_session": "2025-10-06T00:00:00.000Z",
        "current_program": "Beginner Strength"
    }
]
```

### Get Client Details
`GET ./client/{clientId}`

Response:
```json
{
    "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
    "client_id": "1e6f15bd-27f3-47c7-9a89-a38dc189a031",
    "client_name": "Emma Wilson",
    "client_email": "emma.wilson@gmail.com",
    "last_session": "2025-10-06T00:00:00.000Z",
    "next_session": "2025-10-06T00:00:00.000Z",
    "isActive": true,
    "current_program": "Beginner Strength",
    "goals": ["Strength Improvement", "Weight Loss", "Better Mobility"]
}
```

### Register New Client
`POST ./client`

Request Body:
```json
{
    "client_name": "John Doe",
    "client_email": "john.doe@email.com",
    "client_phone": "1234567890",
    "goals": []

}
```

Response:
```json
{
    "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
    "client_id": "1e6f15bd-27f3-47c7-9a89-a38dc189a031",
    "client_name": "John Doe",
    "client_email": "john.doe@email.com",
    "last_session": "",
    "next_session": "",
    "isActive": true,
    "current_program": "",
    "goals": []
}
```

### Update Client Information
`PATCH ./client/{clientId}`

Request Body:
```json
{
    "client_email": "john.doe@email.com",
    "current_program": "",
    "goals": []
}
```

Response:
```json
{
    "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
    "client_id": "1e6f15bd-27f3-47c7-9a89-a38dc189a031",
    "client_name": "John Doe",
    "client_email": "john.doe@email.com",
    "last_session": "",
    "next_session": "",
    "isActive": true,
    "current_program": "",
    "goals": []
}
```

### Decommission Client
`DELETE ./client/{clientId}`