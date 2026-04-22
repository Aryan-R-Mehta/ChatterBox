"use client";

export default function ModalShell({
    children,
    onClose,
    panelClassName = "",
    overlayClassName = "",
    closeOnOverlay = true,
}) {
    const handleOverlayClick = () => {
        if (closeOnOverlay) {
            onClose?.();
        }
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${overlayClassName}`}
            onClick={handleOverlayClick}
        >
            <div className={panelClassName} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}
