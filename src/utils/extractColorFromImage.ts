export async function extractColorFromImage(imageUrl: string): Promise<string | null> {
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            if (!ctx) return resolve(null);

            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0, img.width, img.height);

            try {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                const length = data.length;
                let r = 0, g = 0, b = 0, count = 0;

                for (let i = 0; i < length; i += 40) {
                    if (data[i + 3] < 200) continue;

                    r += data[i];
                    g += data[i + 1];
                    b += data[i + 2];
                    count++;
                }

                if (count === 0) return resolve(null);

                r = Math.floor(r / count);
                g = Math.floor(g / count);
                b = Math.floor(b / count);

                const hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
                resolve(hex);
            } catch (e) {
                console.error("Error extracting color", e);
                resolve(null);
            }
        };

        img.onerror = () => {
            console.error("Failed to load image for color extraction");
            resolve(null);
        };
    });
}
