from pydantic import BaseModel, Field

class HeliosExceptionResponse(BaseModel):
    error: str = Field(description="Description of what went wrong.")

class HeliosException(Exception):
    pass
