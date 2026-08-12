import json
import sys
from pathlib import Path

from PIL import Image, ImageOps


MAX_SIZE = (1600, 1600)


def main():
    if len(sys.argv) != 3:
        raise SystemExit("usage: normalize-thumbnail.py INPUT OUTPUT")

    source = Path(sys.argv[1])
    target = Path(sys.argv[2])

    with Image.open(source) as original:
        original.seek(0)
        image = ImageOps.exif_transpose(original)
        image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)

        has_alpha = image.mode in {"RGBA", "LA"} or (
            image.mode == "P" and "transparency" in image.info
        )
        image = image.convert("RGBA" if has_alpha else "RGB")
        image.save(target, "WEBP", quality=86, method=6)

        print(
            json.dumps(
                {
                    "width": image.width,
                    "height": image.height,
                    "bytes": target.stat().st_size,
                }
            )
        )


if __name__ == "__main__":
    main()
