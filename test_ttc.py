from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ttc_files = {
    "Didot": "/System/Library/Fonts/Supplemental/Didot.ttc",
    "Baskerville": "/System/Library/Fonts/Supplemental/Baskerville.ttc",
    "Avenir": "/System/Library/Fonts/Avenir.ttc",
    "Avenir Next": "/System/Library/Fonts/Avenir Next.ttc",
    "HelveticaNeue": "/System/Library/Fonts/HelveticaNeue.ttc"
}

for name, path in ttc_files.items():
    print(f"\nInspecting {name} collection:")
    for i in range(12):  # Try the first 12 indexes
        try:
            # Attempt to register font to get its name
            font = TTFont(f"{name}_idx{i}", path, index=i)
            print(f"- Index {i}: FontName={font.fontName}")
        except Exception as e:
            # We reached the end of the collection
            break
