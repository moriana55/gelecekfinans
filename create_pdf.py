import os
from reportlab.lib.colors import CMYKColor
from reportlab.pdfgen import canvas
from reportlab.platypus import Frame, Paragraph
from reportlab.lib.styles import ParagraphStyle

# Define folder paths
brain_folder = "/Users/yigiterturk/.gemini/antigravity/brain/674c5701-7ef9-4968-9b99-0a12180e48b3"
output_folder = "/Users/yigiterturk/.gemini/antigravity/scratch"
os.makedirs(output_folder, exist_ok=True)

pdf_path = os.path.join(output_folder, "Aysira_Samsun_Brosur.pdf")
storefront_path = os.path.join(brain_folder, "media__1781765298367.jpg")
interior_path = os.path.join(brain_folder, "media__1781765295572.jpg")
qr_path = os.path.join(brain_folder, "media__1781765688768.png")

# Page Dimensions (A5: 148 mm x 210 mm in points)
A5_WIDTH = 419.527
A5_HEIGHT = 595.275

# Print-ready CMYK Color Palette (between 0.0 and 1.0)
bg_color = CMYKColor(0, 0.02, 0.05, 0.02)       # Luxury Warm Ivory / Off-White
charcoal = CMYKColor(0.60, 0.50, 0.40, 0.85)       # Premium Editorial Deep Charcoal (near-black)
gold = CMYKColor(0.15, 0.28, 0.65, 0.15)           # Matte Gold / Champagne Accent
muted_grey = CMYKColor(0.30, 0.25, 0.25, 0.50)     # Warm Muted Grey for subtext
white = CMYKColor(0, 0, 0, 0)

# Helper function to draw spaced, centered text using textObject
def draw_centred_spaced_string(canvas_obj, x_center, y, text, font_name, font_size, color, char_space):
    t = canvas_obj.beginText()
    t.setFont(font_name, font_size)
    t.setFillColor(color)
    t.setCharSpace(char_space)
    w = canvas_obj.stringWidth(text, font_name, font_size)
    if len(text) > 1:
        w += (len(text) - 1) * char_space
    t.setTextOrigin(x_center - w / 2.0, y)
    t.textOut(text)
    canvas_obj.drawText(t)

# Helper function to draw spaced, left-aligned text
def draw_left_spaced_string(canvas_obj, x, y, text, font_name, font_size, color, char_space):
    t = canvas_obj.beginText()
    t.setFont(font_name, font_size)
    t.setFillColor(color)
    t.setCharSpace(char_space)
    t.setTextOrigin(x, y)
    t.textOut(text)
    canvas_obj.drawText(t)

# Initialize canvas
c = canvas.Canvas(pdf_path, pagesize=(A5_WIDTH, A5_HEIGHT))

# =========================================================================
# PAGE 1: FRONT COVER
# =========================================================================

# Draw background
c.setFillColor(bg_color)
c.rect(0, 0, A5_WIDTH, A5_HEIGHT, fill=1, stroke=0)

# Draw inner gold border (12mm / 34pt margin)
margin = 34.0
c.setStrokeColor(gold)
c.setLineWidth(1.0)
c.rect(margin, margin, A5_WIDTH - 2 * margin, A5_HEIGHT - 2 * margin, fill=0, stroke=1)

# --- HEADER SECTION ---
draw_centred_spaced_string(c, A5_WIDTH / 2.0, 522, "AYSIRA", "Times-Bold", 32, charcoal, 4.5)
draw_centred_spaced_string(c, A5_WIDTH / 2.0, 502, "SAMSUN", "Helvetica", 9, gold, 8.0)

# Thin gold separator line under header
c.setStrokeColor(gold)
c.setLineWidth(0.75)
c.line(A5_WIDTH / 2.0 - 50, 492, A5_WIDTH / 2.0 + 50, 492)

# Slogan
c.setFillColor(charcoal)
c.setFont("Times-Italic", 11)
c.drawCentredString(A5_WIDTH / 2.0, 474, "Zarafeti Keşfet, Kaliteyi Hisset")

# --- COVER IMAGE SECTION (Storefront) ---
img_w = 170.0
img_h = 302.2
img_x = (A5_WIDTH - img_w) / 2.0
img_y = 136.0

c.setStrokeColor(gold)
c.setLineWidth(0.75)
c.rect(img_x - 3.5, img_y - 3.5, img_w + 7.0, img_h + 7.0, fill=0, stroke=1)
c.drawImage(storefront_path, img_x, img_y, width=img_w, height=img_h)

# --- FOOTER SECTION ---
draw_centred_spaced_string(c, A5_WIDTH / 2.0, 102, "YENİ ADRES • YENİ KONSEPT", "Times-Bold", 12, charcoal, 1.0)
draw_centred_spaced_string(c, A5_WIDTH / 2.0, 86, "YAZICI AYSHION GELİNLİK", "Helvetica-Bold", 8.5, gold, 2.0)

c.setFillColor(muted_grey)
c.setFont("Helvetica-Bold", 7.5)
c.drawCentredString(A5_WIDTH / 2.0, 72, "ÖZEL DİKİM  •  İTHAL KUMAŞ  •  KUSURSUZ KALIP  •  LÜKS DENEYİM")

c.setFillColor(charcoal)
c.setFont("Helvetica", 7.5)
contact_text_1 = "T: 0547 100 55 55   |   Instagram: @aysira.samsun   |   Web: www.aysira.com"
c.drawCentredString(A5_WIDTH / 2.0, 56, contact_text_1)

c.setFont("Helvetica", 7.0)
address_text = "Sait Bey Mah. Bağdat Cad. No: 54/1 İlkadım / SAMSUN"
c.drawCentredString(A5_WIDTH / 2.0, 44, address_text)

# Save page 1
c.showPage()


# =========================================================================
# PAGE 2: BACK PAGE (DETAILS & QR CODE)
# =========================================================================

# Draw background
c.setFillColor(bg_color)
c.rect(0, 0, A5_WIDTH, A5_HEIGHT, fill=1, stroke=0)

# Draw inner gold border
c.setStrokeColor(gold)
c.setLineWidth(1.0)
c.rect(margin, margin, A5_WIDTH - 2 * margin, A5_HEIGHT - 2 * margin, fill=0, stroke=1)

# --- HEADER SECTION ---
draw_centred_spaced_string(c, A5_WIDTH / 2.0, 532, "25 YILLIK TECRÜBE, GÜVEN VE ZARAFET", "Times-Bold", 15, charcoal, 0.5)

c.setLineWidth(0.75)
c.line(A5_WIDTH / 2.0 - 80, 522, A5_WIDTH / 2.0 + 80, 522)

# --- BODY TEXT FRAME ---
intro_frame = Frame(margin + 16, 385, A5_WIDTH - 2 * margin - 32, 122, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
intro_style = ParagraphStyle(
    name="IntroStyle",
    fontName="Times-Roman",
    fontSize=9.5,
    leading=14.5,
    textColor=charcoal,
    alignment=1
)

intro_p1 = Paragraph(
    "Uzun yıllar Samsun Çiftlik Caddesi ve Hakkı Bey Caddesi'ndeki hizmetimizin ardından, "
    "şimdi yenilenen lüks konseptimiz ve yeni adresimizde sizleri ağırlamaktan mutluluk duyuyoruz.",
    intro_style
)

intro_p2 = Paragraph(
    "Alanında uzman terzi kadromuz, güler yüzlü satış danışmanlarımız ve seçkin dantel "
    "koleksiyonlarımız ile her gelinimizin hayalindeki gelinliği en ince ayrıntısına kadar "
    "büyük bir tutkuyla tasarlıyor ve hayata geçiriyoruz.",
    intro_style
)

story = [intro_p1, Paragraph("<br/>", intro_style), intro_p2]
intro_frame.addFromList(story, c)

# --- PILLARS GRID ---
p_y1 = 330.0
p_y2 = 278.0
col1_x = margin + 12.0
col2_x = A5_WIDTH / 2.0 + 8.0
col_w = A5_WIDTH / 2.0 - margin - 20.0

def draw_pillar(canvas_obj, x, y, w, title, desc):
    canvas_obj.setStrokeColor(gold)
    canvas_obj.setFillColor(white)
    canvas_obj.setLineWidth(1.0)
    canvas_obj.circle(x + 6, y + 18, 5, fill=1, stroke=1)
    
    canvas_obj.setFillColor(charcoal)
    canvas_obj.setFont("Helvetica-Bold", 8.5)
    canvas_obj.drawString(x + 18, y + 15, title)
    
    pillar_frame = Frame(x + 18, y - 6, w - 18, 20, leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0)
    desc_style = ParagraphStyle(
        name="DescStyle",
        fontName="Helvetica",
        fontSize=7.2,
        leading=9.5,
        textColor=muted_grey
    )
    p = Paragraph(desc, desc_style)
    pillar_frame.addFromList([p], canvas_obj)

draw_pillar(c, col1_x, p_y1, col_w, "KUSURSUZ KALIP & TASARIM", "Vücudunuza özel milimetrik kalıp çalışmaları ve özel tasarım gelinlik dikimleri.")
draw_pillar(c, col2_x, p_y1, col_w, "SEÇKİN DANTEL & KUMAŞ", "İthal ipek kumaşlar, el işlemesi danteller ve en kaliteli malzeme seçenekleri.")
draw_pillar(c, col1_x, p_y2, col_w, "DENEYİMLİ TERZİ KADROSU", "25 yıllık tecrübenin getirdiği titiz işçilik ve kusursuz dikim garantisi.")
draw_pillar(c, col2_x, p_y2, col_w, "LÜKS PROVE DENEYİMİ", "Yeni adresimizdeki konforlu prove odalarında size özel ve eşsiz bir hizmet.")

# --- CONCEPT IMAGE SECTION (Interior Render) ---
img_w_2 = 220.0
img_h_2 = 123.8
img_x_2 = (A5_WIDTH - img_w_2) / 2.0
img_y_2 = 114.0

c.setStrokeColor(gold)
c.setLineWidth(0.75)
c.rect(img_x_2 - 3.5, img_y_2 - 3.5, img_w_2 + 7.0, img_h_2 + 7.0, fill=0, stroke=1)
c.drawImage(interior_path, img_x_2, img_y_2, width=img_w_2, height=img_h_2)

# --- 2-COLUMN FOOTER WITH QR CODE ---
c.setStrokeColor(gold)
c.setLineWidth(0.5)
c.line(margin + 12, 102, A5_WIDTH - margin - 12, 102)

# Left Side: Contact Information
left_x = margin + 12.0
draw_left_spaced_string(c, left_x, 82, "YAZICI AYSHION GELİNLİK", "Helvetica-Bold", 8.5, gold, 1.5)

c.setFillColor(charcoal)
c.setFont("Helvetica-Bold", 8.0)
c.drawString(left_x, 70, "T: 0547 100 55 55")

c.setFillColor(muted_grey)
c.setFont("Helvetica", 7.5)
c.drawString(left_x, 58, "Instagram: @aysira.samsun   |   Web: www.aysira.com")
c.drawString(left_x, 46, "Adres: Sait Bey Mah. Bağdat Cad. No: 54/1 İlkadım / SAMSUN")

# Right Side: Framed QR Code
qr_w = 46.0
qr_x = A5_WIDTH - margin - qr_w - 12.0
qr_y = 44.0

# Thin gold border frame around QR
c.setStrokeColor(gold)
c.setLineWidth(0.5)
c.rect(qr_x - 2, qr_y - 2, qr_w + 4, qr_w + 4, fill=0, stroke=1)
c.drawImage(qr_path, qr_x, qr_y, width=qr_w, height=qr_w)

# Mini label above QR code
c.setFillColor(muted_grey)
c.setFont("Helvetica-Bold", 5.5)
c.drawCentredString(qr_x + qr_w / 2.0, qr_y + qr_w + 5, "KONUM VE İLETİŞİM")

# Save page 2 & output PDF
c.showPage()
c.save()

print("PDF successfully generated!")
