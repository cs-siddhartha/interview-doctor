from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ApiMeta(BaseModel):
    timestamp: datetime
    version: str = "1.0"


class ApiResponse[DataT](BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    data: DataT
    meta: ApiMeta
