from PIL import Image

def create_adaptive_icon():
    try:
        # Load the original icon
        original_img = Image.open("assets/icon.png").convert("RGBA")
        
        # Adaptive icons are typically 108x108 dp, where the inner 72x72 is the safe zone.
        # We will create a 1024x1024 canvas. Safe zone is roughly 66% of the center.
        # So we resize the original logo to be around 680x680.
        
        canvas_size = 1024
        safe_zone_size = 600 # Even smaller to be perfectly safe from circle cropping
        
        # Resize original image keeping aspect ratio
        original_img.thumbnail((safe_zone_size, safe_zone_size), Image.Resampling.LANCZOS)
        
        # Create a blank transparent canvas
        canvas = Image.new("RGBA", (canvas_size, canvas_size), (255, 255, 255, 0))
        
        # Paste the resized image into the center of the canvas
        offset_x = (canvas_size - original_img.width) // 2
        offset_y = (canvas_size - original_img.height) // 2
        canvas.paste(original_img, (offset_x, offset_y), original_img)
        
        # Save as the new adaptive-icon
        canvas.save("assets/adaptive-icon.png", format="PNG")
        print("Successfully created padded adaptive-icon.png!")
        
    except Exception as e:
        print("Error:", str(e))

if __name__ == "__main__":
    create_adaptive_icon()
