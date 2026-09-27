from pathlib import Path
from PIL import Image, ImageOps

root = Path(__file__).resolve().parents[1]
generated = Path.home() / ".codex" / "generated_images" / "01a0de84-5d87-7023-9f4a-f9cc2fc0987e"
icon_src = generated / "exec-93e4380b-20a7-41e9-856d-00af48746e87.png"
logo_src = generated / "exec-7697e0bc-9008-433d-98b6-cb44aa1da143.png"
brand = root / "assets" / "brand"
brand.mkdir(parents=True, exist_ok=True)

icon = Image.open(icon_src).convert("RGBA")
logo = Image.open(logo_src).convert("RGBA")
print(f"source icon: {icon.size} alpha={icon.getchannel('A').getextrema()}")
print(f"source logo: {logo.size} alpha={logo.getchannel('A').getextrema()}")
icon.save(brand / "ravapos-icon.png", optimize=True)
logo.save(brand / "ravapos-logo.png", optimize=True)

# Include an adaptive icon foreground with Android's safe-area inset so the
# launcher can apply the device's mask without clipping the receipt mark.
adaptive = Image.new("RGBA", (432, 432), (0, 0, 0, 0))
mark = ImageOps.fit(icon, (320, 320), method=Image.Resampling.LANCZOS)
adaptive.alpha_composite(mark, (56, 56))
res = root / "android" / "app" / "src" / "main" / "res"
for folder, size in {"mipmap-mdpi":48,"mipmap-hdpi":72,"mipmap-xhdpi":96,"mipmap-xxhdpi":144,"mipmap-xxxhdpi":192}.items():
    target = res / folder
    target.mkdir(parents=True, exist_ok=True)
    icon.resize((size,size), Image.Resampling.LANCZOS).save(target / "ic_launcher.png", optimize=True)
    icon.resize((size,size), Image.Resampling.LANCZOS).save(target / "ic_launcher_round.png", optimize=True)
anydpi = res / "mipmap-anydpi-v26"
anydpi.mkdir(parents=True, exist_ok=True)
(anydpi / "ic_launcher.xml").write_text('''<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/rava_icon_background"/><foreground android:drawable="@mipmap/ravapos_icon_foreground"/></adaptive-icon>''', encoding="utf-8")
(anydpi / "ic_launcher_round.xml").write_text('''<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/rava_icon_background"/><foreground android:drawable="@mipmap/ravapos_icon_foreground"/></adaptive-icon>''', encoding="utf-8")
foreground = res / "mipmap-xxxhdpi" / "ravapos_icon_foreground.png"
adaptive.save(foreground, optimize=True)
for folder, size in {"mipmap-mdpi":108,"mipmap-hdpi":162,"mipmap-xhdpi":216,"mipmap-xxhdpi":324}.items():
    out = res / folder
    out.mkdir(parents=True, exist_ok=True)
    adaptive.resize((size,size), Image.Resampling.LANCZOS).save(out / "ravapos_icon_foreground.png", optimize=True)
(res / "values" / "colors.xml").write_text('''<resources><color name="rava_icon_background">#176044</color></resources>''', encoding="utf-8")
print("Installed generated brand mark, wordmark, and Android launcher icon sizes.")
