export function resizeBase64Image(base64Image, maxWidth = 640) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        img.onload = () => {
            const scaleSize = maxWidth / img.width;
            const canvas = document.createElement('canvas');
            canvas.width = maxWidth;
            canvas.height = img.height * scaleSize;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const resizedBase64 = canvas.toDataURL('image/png');
            const resizedBase64Data = resizedBase64.replace(/^data:image\/(png|jpeg);base64,/, '');
            resolve(resizedBase64Data);
        };

        img.onerror = (error) => {
            reject(error);
        };

        img.src = 'data:image/png;base64,' + base64Image;

        console.log(base64Image)
    });
} 