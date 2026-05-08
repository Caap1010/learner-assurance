interface ModalProps {
    open: boolean;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
    if (!open) {
        return null;
    }

    return (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
            <div className="modal-card">
                <header>
                    <h3>{title}</h3>
                    <button type="button" onClick={onClose} aria-label="Close dialog">
                        x
                    </button>
                </header>
                <div>{children}</div>
            </div>
        </div>
    );
}
