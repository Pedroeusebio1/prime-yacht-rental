from pathlib import Path
from collections import deque
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CATALOG_DIR = ROOT / "assets" / "catalog"
TARGET_SIZE = (900, 650)


def find_photo_box(image):
    small = image.convert("RGB").resize((320, 180))
    hsv = small.convert("HSV")
    width, height = small.size
    pixels = hsv.load()
    visited = [[False] * width for _ in range(height)]
    boxes = []

    def is_photo_pixel(x, y):
        h, s, v = pixels[x, y]
        if y < 18:
          return False
        return s > 28 and 35 < v < 248

    for y in range(height):
        for x in range(width):
            if visited[y][x] or not is_photo_pixel(x, y):
                continue

            queue = deque([(x, y)])
            visited[y][x] = True
            min_x = max_x = x
            min_y = max_y = y
            count = 0

            while queue:
                cx, cy = queue.popleft()
                count += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < width and 0 <= ny < height and not visited[ny][nx] and is_photo_pixel(nx, ny):
                        visited[ny][nx] = True
                        queue.append((nx, ny))

            box_w = max_x - min_x + 1
            box_h = max_y - min_y + 1
            area = box_w * box_h
            if count > 350 and box_w > 35 and box_h > 25 and area > 1400:
                boxes.append((min_x, min_y, max_x, max_y, count, area))

    if not boxes:
        return None

    # Prefer a large visible image, but avoid huge page backgrounds and controls.
    def score(box):
        min_x, min_y, max_x, max_y, count, area = box
        box_w = max_x - min_x + 1
        box_h = max_y - min_y + 1
        aspect = box_w / max(box_h, 1)
        aspect_penalty = 0 if 0.55 <= aspect <= 2.4 else 5000
        top_bias = min_y * 10
        return count * 8 + area - top_bias - aspect_penalty

    best = max(boxes, key=score)
    scale_x = image.width / width
    scale_y = image.height / height
    min_x, min_y, max_x, max_y, *_ = best
    pad_x = 6
    pad_y = 6

    left = max(0, int((min_x - pad_x) * scale_x))
    top = max(0, int((min_y - pad_y) * scale_y))
    right = min(image.width, int((max_x + pad_x) * scale_x))
    bottom = min(image.height, int((max_y + pad_y) * scale_y))
    return left, top, right, bottom


def fit_to_target(crop):
    crop = crop.convert("RGB")
    target_w, target_h = TARGET_SIZE
    src_w, src_h = crop.size
    src_ratio = src_w / src_h
    target_ratio = target_w / target_h

    if src_ratio > target_ratio:
        new_w = int(src_h * target_ratio)
        left = (src_w - new_w) // 2
        crop = crop.crop((left, 0, left + new_w, src_h))
    else:
        new_h = int(src_w / target_ratio)
        top = (src_h - new_h) // 2
        crop = crop.crop((0, top, src_w, top + new_h))

    return crop.resize(TARGET_SIZE, Image.Resampling.LANCZOS)


def main():
    processed = 0
    fallback = 0

    for path in sorted(CATALOG_DIR.glob("*.png")):
        image = Image.open(path)
        box = find_photo_box(image)
        if box is None:
            # Conservative center crop if detection fails.
            fallback += 1
            w, h = image.size
            side_w = int(w * 0.64)
            side_h = int(h * 0.58)
            left = (w - side_w) // 2
            top = int(h * 0.22)
            box = (left, top, left + side_w, min(h, top + side_h))

        cropped = fit_to_target(image.crop(box))
        cropped.save(path, "PNG", optimize=True)
        processed += 1

    print(f"processed={processed} fallback={fallback}")


if __name__ == "__main__":
    main()
