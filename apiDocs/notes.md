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

Response:
```json
{
    "message": "note has been deleted"
}
```