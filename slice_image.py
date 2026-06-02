import os
try:
    from PIL import Image
except ImportError:
    os.system("pip3 install Pillow")
    from PIL import Image

def slice_360_grid(image_path, output_dir):
    if not os.path.exists(image_path):
        print(f"File {image_path} tidak ditemukan!")
        return
        
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    img = Image.open(image_path)
    img_width, img_height = img.size
    
    cols = 8
    rows = 4
    
    frame_width = img_width // cols
    frame_height = img_height // rows
    
    for row in range(rows):
        for col in range(cols):
            left = col * frame_width
            top = row * frame_height
            right = left + frame_width
            bottom = top + frame_height
            
            frame = img.crop((left, top, right, bottom))
            frame.save(f"{output_dir}/row{row+1}_frame{col+1}.png")
            
    print(f"Berhasil memecah gambar menjadi {cols*rows} frame di folder {output_dir}")

if __name__ == "__main__":
    slice_360_grid('public/grid.jpg', 'public/360-frames')
