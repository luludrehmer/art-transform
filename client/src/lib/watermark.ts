export async function addWatermark(imageDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.drawImage(img, 0, 0);

      ctx.save();
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${Math.max(24, img.width / 20)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const watermarkText = "ART & SEE";
      const rotationAngle = -15 * (Math.PI / 180);

      const cols = 4;
      const rows = 5;
      const cellWidth = canvas.width / cols;
      const cellHeight = canvas.height / rows;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = cellWidth * col + cellWidth / 2;
          const y = cellHeight * row + cellHeight / 2;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(rotationAngle);

          ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
          ctx.lineWidth = 3;
          ctx.strokeText(watermarkText, 0, 0);

          ctx.fillText(watermarkText, 0, 0);
          ctx.restore();
        }
      }

      ctx.restore();

      const watermarkedDataUrl = canvas.toDataURL("image/png", 0.92);
      resolve(watermarkedDataUrl);
    };

    img.onerror = () => {
      reject(new Error("Failed to load image for watermarking"));
    };

    img.src = imageDataUrl;
  });
}
