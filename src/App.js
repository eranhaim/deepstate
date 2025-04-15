import { useState, useCallback, useRef, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import "./App.css";

const PaymentForm = ({ amount }) => {
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);

    const createOrder = (data, actions) => {
        return actions.order.create({
            purchase_units: [
                {
                    amount: {
                        value: amount,
                        currency_code: "ILS",
                    },
                },
            ],
        });
    };

    const onApprove = async (data, actions) => {
        try {
            const order = await actions.order.capture();
            alert("התשלום בוצע בהצלחה!");
        } catch (err) {
            setError("אירעה שגיאה בעיבוד התשלום");
        }
    };

    const onError = (err) => {
        setError(err.message);
    };

    return (
        <div className="payment-form">
            <div className="form-group">
                <label>סכום התרומה</label>
                <div className="amount-input">
                    <span className="currency">₪</span>
                    <input
                        type="number"
                        value={amount}
                        disabled
                        className="amount-display"
                    />
                </div>
            </div>

            {error && <div className="error-message">{error}</div>}

            <PayPalButtons
                createOrder={createOrder}
                onApprove={onApprove}
                onError={onError}
                style={{
                    layout: "vertical",
                    color: "blue",
                    shape: "rect",
                    label: "pay",
                }}
            />
        </div>
    );
};

function App() {
    const [image, setImage] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [adjustment, setAdjustment] = useState("banner"); // 'banner', 'frame', or 'overlay'
    const canvasRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const [overlayImage, setOverlayImage] = useState(null);
    const [amount, setAmount] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Load the overlay image when component mounts
    useEffect(() => {
        const loadOverlayImage = async () => {
            const img = new Image();
            img.src = "/eye.jpg";
            await new Promise((resolve) => {
                img.onload = resolve;
            });
            setOverlayImage(img);
        };
        loadOverlayImage();
    }, []);

    const renderImageWithEffect = async (canvas, imageSource) => {
        const ctx = canvas.getContext("2d");
        const img = new Image();

        await new Promise((resolve) => {
            img.onload = resolve;
            img.src = imageSource;
        });

        // Set canvas size to match the image
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw the original image
        ctx.drawImage(img, 0, 0);

        switch (adjustment) {
            case "banner":
                // Add banner and text
                const bannerHeight = Math.max(60, img.height * 0.15);
                ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
                ctx.fillRect(
                    0,
                    img.height - bannerHeight,
                    img.width,
                    bannerHeight
                );

                const text = "רונן בר וגלי מיארה שלטון צללים";
                const fontSize = bannerHeight * 0.4;
                ctx.fillStyle = "white";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.direction = "rtl";
                ctx.font = `bold ${fontSize}px Arial`;

                // Adjust text size if needed
                let currentFontSize = fontSize;
                let textWidth = ctx.measureText(text).width;
                while (textWidth > img.width * 0.9 && currentFontSize > 12) {
                    currentFontSize--;
                    ctx.font = `bold ${currentFontSize}px Arial`;
                    textWidth = ctx.measureText(text).width;
                }

                ctx.fillText(
                    text,
                    img.width / 2,
                    img.height - bannerHeight / 2
                );
                break;

            case "frame":
                // Add black frame
                const frameWidth = img.width * 0.05; // 5% of image width
                ctx.fillStyle = "black";
                // Top
                ctx.fillRect(0, 0, img.width, frameWidth);
                // Bottom
                ctx.fillRect(0, img.height - frameWidth, img.width, frameWidth);
                // Left
                ctx.fillRect(0, 0, frameWidth, img.height);
                // Right
                ctx.fillRect(img.width - frameWidth, 0, frameWidth, img.height);
                break;

            case "overlay":
                // Add eye overlay with 30% opacity
                if (overlayImage) {
                    ctx.globalAlpha = 0.3; // Changed from 0.1 to 0.3 for 30% opacity
                    ctx.drawImage(overlayImage, 0, 0, img.width, img.height);
                    ctx.globalAlpha = 1.0; // Reset opacity
                }
                break;

            default:
                break;
        }
    };

    const updatePreview = useCallback(
        async (imageSource) => {
            if (!previewCanvasRef.current || !imageSource) return;
            await renderImageWithEffect(previewCanvasRef.current, imageSource);
            const previewDataUrl =
                previewCanvasRef.current.toDataURL("image/png");
            setPreviewUrl(previewDataUrl);
        },
        [adjustment, overlayImage]
    );

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
        await renderImageWithEffect(canvasRef.current, image);

        canvasRef.current.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "edited-image.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, "image/png");
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        // Payment processing logic will go here once you provide the details
        // For now, just a placeholder
        console.log("Processing payment:", amount);

        setIsProcessing(false);
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
            <div className="container">
                <div
                    className="dropzone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    {image ? (
                        <div className="image-container">
                            <img
                                src={previewUrl}
                                alt="תמונה עם אפקט"
                                className="profile-image"
                            />
                        </div>
                    ) : (
                        <p>גרור ושחרר את התמונה שלך כאן</p>
                    )}
                </div>

                {image && (
                    <div className="controls">
                        <div className="adjustment-options">
                            <label>
                                <input
                                    type="radio"
                                    value="banner"
                                    checked={adjustment === "banner"}
                                    onChange={(e) =>
                                        setAdjustment(e.target.value)
                                    }
                                />
                                כיתוב על באנר שחור
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="frame"
                                    checked={adjustment === "frame"}
                                    onChange={(e) =>
                                        setAdjustment(e.target.value)
                                    }
                                />
                                מסגרת שחורה
                            </label>
                            <label>
                                <input
                                    type="radio"
                                    value="overlay"
                                    checked={adjustment === "overlay"}
                                    onChange={(e) =>
                                        setAdjustment(e.target.value)
                                    }
                                />
                                שכבת עין
                            </label>
                        </div>
                        <button
                            className="download-button"
                            onClick={handleDownload}
                        >
                            הורד תמונה
                        </button>
                    </div>
                )}

                {image && (
                    <div className="payment-section">
                        <h3>תרמו למאבק בשלטון הצללים</h3>
                        <div className="amount-setter">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="הזן סכום"
                                className="amount-input"
                            />
                        </div>
                        {amount && (
                            <PayPalScriptProvider
                                options={{
                                    "client-id": "YOUR_PAYPAL_CLIENT_ID",
                                    currency: "ILS",
                                }}
                            >
                                <PaymentForm amount={amount} />
                            </PayPalScriptProvider>
                        )}
                    </div>
                )}
            </div>

            <canvas ref={canvasRef} style={{ display: "none" }} />
            <canvas ref={previewCanvasRef} style={{ display: "none" }} />
        </div>
    );
}

export default App;
