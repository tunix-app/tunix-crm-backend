# API Reference for Tunix UI

## Calendar

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

---
## Clients

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
        "status": "Inactive",
        "last_session": "2025-10-06T00:00:00.000Z",
        "next_session": "2025-10-06T00:00:00.000Z",
        "current_program": "Core Restoration"
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

---
### Get Client Notes
`GET .notes/client/{clientId}`

Response:
```json
[
    {
        "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
        "client_id": "019a944b-87a1-4bd7-8b60-a9c5906251cd",
        "date": "2025-10-06T00:00:00.000Z",
        "content": "Emma showed great progress in her squat form today. We focused on bracing and depth. Her mobility has improved significantly since we started working on hip flexor stretches.",
        "tags": ["strength", "form", "mobility"]
    },
    {
        "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
        "client_id": "019a944b-87a1-4bd7-8b60-a9c5906251cd",
        "date": "2025-10-06T00:00:00.000Z",
        "content": "Emma showed great progress in her squat form today. We focused on bracing and depth. Her mobility has improved significantly since we started working on hip flexor stretches.",
        "tags": ["strength", "form", "mobility"]
    },
    {
        "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
        "client_id": "019a944b-87a1-4bd7-8b60-a9c5906251cd",
        "date": "2025-10-06T00:00:00.000Z",
        "content": "Emma showed great progress in her squat form today. We focused on bracing and depth. Her mobility has improved significantly since we started working on hip flexor stretches.",
        "tags": ["strength", "form", "mobility"]
    }
]
```

### New Client Note
`POST ./note`

Request Body:
```json
{
    "date": "2025-10-06T00:00:00.000Z",
    "content": "Emma showed great progress in her squat form today. We focused on bracing and depth. Her mobility has improved significantly since we started working on hip flexor stretches.",
    "tags": ["strength", "form", "mobility"]
}
```

Response:
```json
[
    {
        "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
        "client_id": "019a944b-87a1-4bd7-8b60-a9c5906251cd",
        "date": "2025-10-06T00:00:00.000Z",
        "content": "Emma showed great progress in her squat form today. We focused on bracing and depth. Her mobility has improved significantly since we started working on hip flexor stretches.",
        "tags": ["strength", "form", "mobility"]
    },
    {
        "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
        "client_id": "019a944b-87a1-4bd7-8b60-a9c5906251cd",
        "date": "2025-10-06T00:00:00.000Z",
        "content": "Emma showed great progress in her squat form today. We focused on bracing and depth. Her mobility has improved significantly since we started working on hip flexor stretches.",
        "tags": ["shoulder", "caution", "injury"]
    },
    {
        "id": "deb24993-ae89-4de7-be87-1f5af6e2a959",
        "client_id": "019a944b-87a1-4bd7-8b60-a9c5906251cd",
        "date": "2025-10-06T00:00:00.000Z",
        "content": "Emma showed great progress in her squat form today. We focused on bracing and depth. Her mobility has improved significantly since we started working on hip flexor stretches.",
        "tags": ["strength", "form", "mobility"]
    }
]
```

### Delete Client Note
`DELETE ./note/{noteId}`


### Decommission Client
`DELETE ./client/{clientId}`




