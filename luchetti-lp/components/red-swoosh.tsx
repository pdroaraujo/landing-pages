/** Faixa vermelha da logo da Luchetti, usada como detalhe decorativo. */
export function RedSwoosh({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="1 57.5 245 18.5"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
        >
            <path
                fill="currentColor"
                d="M17.8 75.3c-.2-5.9-.3-5.2 9-5.7 14.4-.6 29.6-1 44-1.5 19.5-.7 39-1.4 58.5-2 19.4-.6 38.9-1.2 58.3-2l43.9-1.5c4.6-.2 10.1-.1 14.6-.5l-.2-1.8L1 58.6c.3.7 7.2 7.4 8.3 8.5l8.5 8.2z"
            />
        </svg>
    );
}
