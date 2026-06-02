import os
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    os.system("pip3 install Pillow")
    from PIL import Image, ImageDraw, ImageFont

output_dir = 'public/360-frames'
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for i in range(1, 9):
    # Create a simple image with a changing rotation indicator
    img = Image.new('RGB', (400, 400), color=(245, 247, 250))
    d = ImageDraw.Draw(img)
    
    # Draw a circle
    d.ellipse([(100, 100), (300, 300)], fill=(200, 215, 240), outline=(100, 130, 190), width=5)
    
    # Draw an indicator line to show rotation
    angle = (i - 1) * 45
    import math
    cx, cy = 200, 200
    r = 100
    end_x = cx + r * math.cos(math.radians(angle - 90))
    end_y = cy + r * math.sin(math.radians(angle - 90))
    
    d.line([(cx, cy), (end_x, end_y)], fill=(50, 80, 150), width=10)
    
    # Text
    d.text((175, 195), f"{angle} deg", fill=(0, 0, 0))
    
    img.save(f"{output_dir}/row1_frame{i}.png")

print("Placeholder 360 images created successfully.")
