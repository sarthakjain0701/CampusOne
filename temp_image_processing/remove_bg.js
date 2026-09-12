const { Jimp } = require('jimp');

async function removeBackground() {
  const imageUrl = "https://images.shiksha.com/mediadata/images/1684410058phpjSEJOU.jpeg";
  console.log("Downloading image...");
  
  try {
    const image = await Jimp.read(imageUrl);
    console.log("Image loaded: " + image.bitmap.width + "x" + image.bitmap.height);
    
    // Jimp stores bitmap data as RGBA natively in image.bitmap.data
    
    const width = image.bitmap.width;
    const height = image.bitmap.height;
    
    const visited = new Uint8Array(width * height);
    const queue = [[0, 0]]; // Start top-left
    
    // Add other corners just in case the top-left isn't connected to the rest of the background
    queue.push([width - 1, 0]);
    queue.push([0, height - 1]);
    queue.push([width - 1, height - 1]);

    // Add some middle edge points
    queue.push([Math.floor(width/2), 0]);
    queue.push([Math.floor(width/2), height - 1]);
    queue.push([0, Math.floor(height/2)]);
    queue.push([width - 1, Math.floor(height/2)]);

    let removedCount = 0;
    
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      
      const idx = y * width + x;
      if (visited[idx]) continue;
      visited[idx] = 1;
      
      const r = image.bitmap.data[(y * width + x) * 4];
      const g = image.bitmap.data[(y * width + x) * 4 + 1];
      const b = image.bitmap.data[(y * width + x) * 4 + 2];
      
      // Tolerance for white background (JPEG artifacts might make it not pure 255)
      // Usually white backgrounds with JPEG artifacts are > 230
      if (r > 230 && g > 230 && b > 230) {
        // Make transparent
        image.bitmap.data[(y * width + x) * 4 + 3] = 0;
        removedCount++;
        
        // Add neighbors
        if (x > 0) queue.push([x - 1, y]);
        if (x < width - 1) queue.push([x + 1, y]);
        if (y > 0) queue.push([x, y - 1]);
        if (y < height - 1) queue.push([x, y + 1]);
      }
    }
    
    console.log(`Removed ${removedCount} background pixels.`);
    
    // Also perform a global pass just for anti-aliasing edges if needed?
    // Actually, simple flood fill is best.
    
    const outputPath = "../assets/logo/poornima_logo_transparent.png";
    await image.write(outputPath);
    console.log("Saved transparent logo to " + outputPath);
    
  } catch (err) {
    console.error("Error processing image:", err);
  }
}

removeBackground();
