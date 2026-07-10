from pathlib import Path
from collections import deque
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
CATALOG_DIR = ROOT / "assets" / "catalog"
TARGET_SIZE = (900, 650)


def best_saturated_region(image):
    small = image.convert("RGB").resize((360, 260))
    hsv = small.convert("HSV")
    w, h = small.size
    px = hsv.load()
    visited = [[False] * w for _ in range(h)]
    regions = []

    def keep(x, y):
        _, s, v = px[x, y]
        return s > 42 and 42 < v < 246

    for y in range(h):
        for x in range(w):
            if visited[y][x] or not keep(x, y):
                continue

            q = deque([(x, y)])
            visited[y][x] = True
            min_x = max_x = x
            min_y = max_y = y
            count = 0

            while q:
                cx, cy = q.popleft()
                count += 1
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)

                for nx, ny in ((cx + 1, cy), (cx - 1, cy), (cx, cy + 1), (cx, cy - 1)):
                    if 0 <= nx < w and 0 <= ny < h and not visited[ny][nx] and keep(nx, ny):
                        visited[ny][nx] = True
                        q.append((nx, ny))

            bw = max_x - min_x + 1
            bh = max_y - min_y + 1
            if count > 800 and bw > 45 and bh > 35:
                regions.append((min_x, min_y, max_x, max_y, count, bw * bh))

    if not regions:
        return None

    def score(region):
        min_x, min_y, max_x, max_y, count, area = region
        bw = max_x - min_x + 1
        bh = max_y - min_y + 1
        aspect = bw / max(bh, 1)
        aspect_penalty = 0 if 0.55 <= aspect <= 2.8 else 4000
        return count * 10 + area - aspect_penalty

    region = max(regions, key=score)
    min_x, min_y, max_x, max_y, *_ = region
    sx = image.width / w
    sy = image.height / h
    pad_x = int((max_x - min_x + 1) * 0.16)
    pad_y = int((max_y - min_y + 1) * 0.2)
    return (
        max(0, int((min_x - pad_x) * sx)),
        max(0, int((min_y - pad_y) * sy)),
        min(image.width, int((max_x + pad_x) * sx)),
        min(image.height, int((max_y + pad_y) * sy)),
    )


def fit(crop):
    crop = crop.convert("RGB")
    tw, th = TARGET_SIZE
    sw, sh = crop.size
    sr = sw / sh
    tr = tw / th
    if sr > tr:
        nw = int(sh * tr)
        left = (sw - nw) // 2
        crop = crop.crop((left, 0, left + nw, sh))
    else:
        nh = int(sw / tr)
        top = max(0, (sh - nh) // 2)
        crop = crop.crop((0, top, sw, min(sh, top + nh)))
    return crop.resize(TARGET_SIZE, Image.Resampling.LANCZOS)


def main():
    changed = 0
    skipped = 0
    for path in sorted(CATALOG_DIR.glob("*.png")):
        image = Image.open(path)
        box = best_saturated_region(image)
        if not box:
            skipped += 1
            continue
        fit(image.crop(box)).save(path, "PNG", optimize=True)
        changed += 1
    print(f"changed={changed} skipped={skipped}")


if __name__ == "__main__":
    main()
