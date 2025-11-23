import { Hexagon } from 'lucide-react'

export default function Logo({ className = "", showText = true }: { className?: string, showText?: boolean }) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className="relative flex items-center justify-center">
                <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="text-primary-600"
                >
                    <path
                        d="M16 2L28.1244 9V23L16 30L3.87564 23V9L16 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="opacity-20"
                    />
                    <path
                        d="M16 6L24.6603 11V21L16 26L7.33975 21V11L16 6Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M16 10L21.1962 13V19L16 22L10.8038 19V13L16 10Z"
                        fill="currentColor"
                        className="opacity-80"
                    />
                </svg>
            </div>
            {showText && (
                <span className="text-2xl font-bold text-primary-600 tracking-tight">
                    USA Graphene
                </span>
            )}
        </div>
    )
}
