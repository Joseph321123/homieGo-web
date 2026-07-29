from PIL import Image
from pathlib import Path

brand = Path(r'c:\Users\aguil\Desktop\homieGo\homieGo-web\public\brand')


def remove_black_bg(src: Path, dst: Path, threshold=38, soft=18):
    img = Image.open(src).convert('RGBA')
    pixels = img.load()
    w, h = img.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if r <= threshold and g <= threshold and b <= threshold:
                darkness = max(r, g, b)
                if darkness <= threshold - soft:
                    pixels[x, y] = (r, g, b, 0)
                else:
                    alpha = int(255 * (darkness - (threshold - soft)) / max(soft, 1))
                    pixels[x, y] = (r, g, b, max(0, min(255, alpha)))
    bbox = img.getbbox()
    if bbox:
        left, top, right, bottom = bbox
        pad = 8
        left = max(0, left - pad)
        top = max(0, top - pad)
        right = min(w, right + pad)
        bottom = min(h, bottom + pad)
        img = img.crop((left, top, right, bottom))
    img.save(dst, 'PNG')
    print(f'OK {dst.name} size={img.size}')


# Keep originals if present in assets; overwrite brand copies
remove_black_bg(brand / 'homiego-icon.png', brand / 'homiego-icon.png')
remove_black_bg(brand / 'homiego-logo.png', brand / 'homiego-logo.png')
print('done')
