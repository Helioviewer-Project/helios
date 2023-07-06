# Database
This database module uses SQLAlchemy's ORM for mapping python classes to the database.
The use of SQLAlchemy is to take advantage of automatically mapping data classes to database rows and being able to easily change the database backend if needed.

## ORM
ORM stands for Object-Relational-Mapping.
It creates a mapping of Object instances to rows in the database.
This means developers can interact with data directly through data classes and let SQLAlchemy take care of doing the CRUD (Create-Read-Update-Delete) operations.

## REST
`rest.py` implements the REST-based API for interacting with the models over HTTP.