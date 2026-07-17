import json
import urllib.error
import urllib.parse
import urllib.request
from typing import Any


def post_json(
    url: str,
    payload: dict[str, Any],
    headers: dict[str, str],
    timeout: int = 30,
) -> dict[str, Any]:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )

    return read_json_response(request, timeout)


def post_json_for_bytes(
    url: str,
    payload: dict[str, Any],
    headers: dict[str, str],
    timeout: int = 30,
) -> bytes:
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json", **headers},
        method="POST",
    )

    return read_bytes_response(request, timeout)


def post_bytes_for_json(
    url: str,
    audio: bytes,
    headers: dict[str, str],
    params: dict[str, str] | None = None,
    timeout: int = 30,
) -> dict[str, Any]:
    request_url = append_query_params(url, params)
    request = urllib.request.Request(
        request_url,
        data=audio,
        headers={"Content-Type": "application/octet-stream", **headers},
        method="POST",
    )

    return read_json_response(request, timeout)


def post_multipart_for_json(
    url: str,
    fields: dict[str, str],
    file_field: str,
    filename: str,
    file_content: bytes,
    headers: dict[str, str],
    timeout: int = 30,
) -> dict[str, Any]:
    boundary = "----interview-doctor-boundary"
    body = build_multipart_body(boundary, fields, file_field, filename, file_content)
    request = urllib.request.Request(
        url,
        data=body,
        headers={
            "Content-Type": f"multipart/form-data; boundary={boundary}",
            **headers,
        },
        method="POST",
    )

    return read_json_response(request, timeout)


def append_query_params(url: str, params: dict[str, str] | None) -> str:
    if not params:
        return url

    separator = "&" if "?" in url else "?"

    return f"{url}{separator}{urllib.parse.urlencode(params)}"


def build_multipart_body(
    boundary: str,
    fields: dict[str, str],
    file_field: str,
    filename: str,
    file_content: bytes,
) -> bytes:
    chunks: list[bytes] = []

    for name, value in fields.items():
        chunks.extend(
            [
                f"--{boundary}\r\n".encode(),
                f'Content-Disposition: form-data; name="{name}"\r\n\r\n'.encode(),
                value.encode(),
                b"\r\n",
            ]
        )

    chunks.extend(
        [
            f"--{boundary}\r\n".encode(),
            (
                f'Content-Disposition: form-data; name="{file_field}"; '
                f'filename="{filename}"\r\n'
            ).encode(),
            b"Content-Type: audio/wav\r\n\r\n",
            file_content,
            b"\r\n",
            f"--{boundary}--\r\n".encode(),
        ]
    )

    return b"".join(chunks)


def read_json_response(
    request: urllib.request.Request,
    timeout: int,
) -> dict[str, Any]:
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8")
        raise RuntimeError(f"Provider request failed: {detail}") from error


def read_bytes_response(
    request: urllib.request.Request,
    timeout: int,
) -> bytes:
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            return response.read()
    except urllib.error.HTTPError as error:
        detail = error.read().decode("utf-8")
        raise RuntimeError(f"Provider request failed: {detail}") from error
