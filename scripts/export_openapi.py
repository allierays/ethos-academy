"""Export the FastAPI OpenAPI schema to docs/openapi.json.

Usage:
    uv run python -m scripts.export_openapi
"""

import json
from pathlib import Path

from api.main import app


def main():
    schema = app.openapi()
    output = Path(__file__).resolve().parent.parent / "docs" / "openapi.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(schema, indent=2) + "\n")
    print(f"OpenAPI schema written to {output}")


if __name__ == "__main__":
    main()
