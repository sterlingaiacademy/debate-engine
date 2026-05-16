from PIL import Image

def fix_icon():
    try:
        original_img = Image.open("assets/icon.png").convert("RGBA")
        canvas_size = 1024
        
        # Resize original image keeping aspect ratio
        original_img.thumbnail((canvas_size, canvas_size), Image.Resampling.LANCZOS)
        
        # Create a blank transparent canvas
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 0))
        
        # Paste the resized image into the center of the canvas
        offset_x = (canvas_size - original_img.width) // 2
        offset_y = (canvas_size - original_img.height) // 2
        canvas.paste(original_img, (offset_x, offset_y), original_img)
        
        # Save over the icon
        canvas.save("assets/icon.png", format="PNG")
        print("Successfully made icon.png a square 1024x1024!")
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    fix_icon()
