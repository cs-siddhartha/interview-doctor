from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

DataT = TypeVar("DataT")


class ApiMeta(BaseModel):
    timestamp: datetime
    version: str = "1.0"


class ApiResponse(BaseModel, Generic[DataT]):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    data: DataT
    meta: ApiMeta
