# BloggerAPI

This is an api for a blog api built for exam project

---

## Requirements

1. Users should have a first_name, last_name, email, password
2. A user should be able to sign up and sign in into the blog app
3. Use JWT as authentication strategy and expire the token after 1 hour
4. A blog can be in two states; draft and published
5. Logged in and not logged in users should be able to get a list of published blogs created
6. Logged in and not logged in users should be able to to get a published blog
7. Logged in users should be able to create a blog.
8. When a blog is created, it is in draft state.
9. The owner of the blog should be able to update the state of the blog to published
10. The owner of a blog should be able to edit the blog in draft or published state.
11. The owner of the blog should be able to delete the blog in draft or published state.
12. The owner of the blog should be able to get a list of their blogs.
13. The endpoint should be paginated.
14. It should be filterable by state.
15. Blogs created should have title, description, tags, author, timestamp, state, read_count, reading_time and body.
16. The list of blogs endpoint that can be accessed by both logged in and not logged in users should be paginated:
17. default it to 20 blogs per page.
18. It should also be searchable by author, title and tags.
19. It should also be orderable by read_count, reading_time and timestamp.
20. When a single blog is requested, the api should return the user information (the author) with the blog. The read_count of the blog too should be updated by 1.
21. Come up with any algorithm for calculating the reading_time of the blog.
22. Write tests for all endpoints.

---

## Setup

- Install NodeJS, mongodb
- clone this repo
- update env with example.env
- run `npm run start:dev`

---

## Base URL

- somehostsite.com

## Models

---

### userModel

| field     | data_type     | constraints      |
| --------- | ------------- | ---------------- |
| username  | string        | required, unique |
| firstname | string        | required         |
| lastname  | string        | required         |
| email     | string        | required         |
| password  | string        | required, unique |
| articles  | ref - Article |                  |

### blogModel

| field        | data_type  | constraints                                              |
| ------------ | ---------- | -------------------------------------------------------- |
| title        | string     | required, unique                                         |
| description  | string     | optional                                                 |
| author       | ref - User |                                                          |
| owner        | string     |                                                          |
| state        | string     | required, default: 'draft', enum: ['draft', 'published'] |
| read_count   | Number     | default: 0                                               |
| reading_time | Number     |                                                          |
| tags         | array      | optional                                                 |
| body         | string     | required                                                 |

## APIs

---

### Signup User

- Route: /api/signup
- Method: POST
- Body:

```
{
  "firstName": "Peter",
  "lastName": "Drew",
  "username": "mightypeter",
  "email": "peter@mail.com",
  "password": "Prettier0!"
}
```

- Responses

{
"status": "success",
"data": {
"firstName": "Peter",
"lastName": "Drew",
"username": "mightypeter",
"email": "peter@mail.com",
"articles": [],
"\_id": "6367c296ba7522yiyfyf45"
}
}

```
---
### Login User

- Route: /api/login
- Method: POST
- Body:
```

{
"username": 'mightypeter",
"password": "Prettier0!"
}

```

- Responses

{
    "token": "<token>",
    "username": "mightypeter",
    "name": "Peter"
}
```

## #Lessons Learned

While building this project, I learnt about:

Test Driven Development
Testing the backend
Database Modelling
Database Management
Debugging
User Authentication
User Authorization
Documentation

...

## Contributor

- Olawale Mustapha
