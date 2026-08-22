from fastapi import HTTPException, status


class DrishtiError(Exception):
 def __init__(self, title: str, detail: str, status_code: int = 400, instance: str = ""):
 self.title = title
 self.detail = detail
 self.status_code = status_code
 self.instance = instance

 def to_dict(self):
 return {
 "error": {
 "type": self.__class__.__name__,
 "title": self.title,
 "status": self.status_code,
 "detail": self.detail,
 "instance": self.instance or "",
 }
 }


class NotFoundError(DrishtiError):
 def __init__(self, detail: str = "Resource not found"):
 super().__init__("Not Found", detail, status.HTTP_404_NOT_FOUND)


class ConflictError(DrishtiError):
 def __init__(self, detail: str = "Resource already exists"):
 super().__init__("Conflict", detail, status.HTTP_409_CONFLICT)


class ForbiddenError(DrishtiError):
 def __init__(self, detail: str = "Forbidden"):
 super().__init__("Forbidden", detail, status.HTTP_403_FORBIDDEN)


def register_error_handlers(app):
 from fastapi.exceptions import RequestValidationError
 from fastapi.responses import JSONResponse
 from starlette.exceptions import HTTPException as StarletteHTTPException

 @app.exception_handler(DrishtiError)
 async def drishti_error_handler(request, exc: DrishtiError):
 return JSONResponse(status_code=exc.status_code, content=exc.to_dict())

 @app.exception_handler(StarletteHTTPException)
 async def http_error_handler(request, exc):
 return JSONResponse(
 status_code=exc.status_code,
 content={
 "error": {
 "type": "HTTPError",
 "title": exc.detail or "Error",
 "status": exc.status_code,
 "detail": exc.detail or "",
 "instance": str(request.url.path),
 }
 },
 )

 @app.exception_handler(RequestValidationError)
 async def validation_error_handler(request, exc: RequestValidationError):
 return JSONResponse(
 status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
 content={
 "error": {
 "type": "ValidationError",
 "title": "Validation Error",
 "status": 422,
 "detail": str(exc.errors()),
 "instance": str(request.url.path),
 }
 },
 )
