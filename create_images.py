from PIL import Image, ImageDraw
import os

os.chdir('/Users/Nury/Desktop/Anniversary/assets/images')

# Create placeholder images for memory1-21 with consistent styling
colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B88B', '#82E0AA',
    '#F5B041', '#A9CCE3', '#F48FB1', '#ABEBC6', '#D7BDE2',
    '#F9E79F', '#AED6F1', '#F5B7B1', '#D5F4E6', '#FADBD8', '#FAD7A0'
]

for i in range(1, 22):
    filename = f'memory{i}.jpg'
    # Check if file already exists
    if os.path.exists(filename):
        print(f"✓ {filename} already exists")
        continue
    
    # Create image with memory number as content
    img = Image.new('RGB', (400, 300), colors[i-1])
    draw = ImageDraw.Draw(img)
    
    # Add text to show which memory this is
    text = f"Memory {i}"
    # Use a simpler approach for text placement
    bbox = draw.textbbox((0, 0), text)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (400 - text_width) // 2
    y = (300 - text_height) // 2
    draw.text((x, y), text, fill='white')
    
    img.save(filename, 'JPEG', quality=85)
    print(f"✓ Created {filename}")

print("\nAll memory images ready!")
