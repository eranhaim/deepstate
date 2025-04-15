import { useState, useCallback, useRef, useEffect } from "react";
import "./App.css";

function App() {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);

    const renderImageWithBanner = (canvas, imageSource) => {
        const ctx = canvas.getContext("2d");
        const img = new Image();

        return new Promise((resolve) => {
            img.onload = () => {
                // Set canvas size to match the image
                canvas.width = img.width;
                canvas.height = img.height;

                // Draw the image
                ctx.drawImage(img, 0, 0);

                // Calculate banner height based on image dimensions
                const bannerHeight = Math.max(60, img.height * 0.15);

                // Draw the black banner
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(
                    0,
                    img.height - bannerHeight,
                    img.width,
                    bannerHeight
                );

                // Add text to the banner
                const text = "רונן בר וגלי מיארה שלטון צללים";
                const fontSize = bannerHeight * 0.4;

                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.direction = "rtl";
                ctx.font = `bold ${fontSize}px Arial`;

                // Test if text fits and adjust if necessary
                let currentFontSize = fontSize;
                let textWidth = ctx.measureText(text).width;

                while (textWidth > img.width * 0.9 && currentFontSize > 12) {
                    currentFontSize--;
                    ctx.font = `bold ${currentFontSize}px Arial`;
                    textWidth = ctx.measureText(text).width;
                }

                // Position text in the center of the banner
                ctx.fillText(
                    text,
                    img.width / 2,
                    img.height - bannerHeight / 2
                );
                resolve();
            };
            img.src = imageSource;
        });
    };

    const updatePreview = useCallback(async (imageSource) => {
        if (!previewCanvasRef.current) return;
        await renderImageWithBanner(previewCanvasRef.current, imageSource);
        const previewDataUrl = previewCanvasRef.current.toDataURL("image/png");
        setPreviewUrl(previewDataUrl);
    }, []);

    useEffect(() => {
        if (image) {
            updatePreview(image);
        }
    }, [image, updatePreview]);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    const handleDownload = async () => {
        if (!canvasRef.current || !image) return;
        await renderImageWithBanner(canvasRef.current, image);

        canvasRef.current.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "profile-with-banner.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, "image/png");
    };

    return (
        <div className="App">
            <div
                style={{
                    position: "fixed",
                    bottom: 5,
                    left: 5,
                    fontSize: 12,
                }}
            >
                <p>נוצר על ידי ערן חיים לכאורה</p>
            </div>
            <div
                className="dropzone"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
            >
                {image ? (
                    <div className="image-container">
                        <img
                            src={previewUrl}
                            alt="Profile with Banner"
                            className="profile-image"
                        />
                        <button
                            className="download-button"
                            onClick={handleDownload}
                        >
                            Download
                        </button>
                    </div>
                ) : (
                    <p>Drag and drop your profile photo here</p>
                )}
            </div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <canvas ref={previewCanvasRef} style={{ display: "none" }} />
        </div>
    );
}

export default App;
