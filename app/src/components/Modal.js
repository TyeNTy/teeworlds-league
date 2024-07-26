import React from "react";

function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-gray-700 bg-opacity-50"
            onClick={onClose}
        >
            <div className="bg-white p-4 rounded-lg w-11/12 md:w-3/4 lg:w-1/2" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2>{title ?? ""}</h2>
                    <button className="text-lg font-bold" onClick={onClose}>
                        &times;
                    </button>
                </div>
                <div className="mt-4">{children}</div>
            </div>
        </div>
    );
}

export default Modal;