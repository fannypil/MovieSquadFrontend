"use client"

export default function TypingIndicator({ user }) {
    return (
        <div className="d-flex mb-3 justify-content-start">
            <div className="me-3 align-self-end">
                <div 
                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                    style={{ 
                        width: '36px', 
                        height: '36px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                >
                    {(user?.username || 'U').charAt(0).toUpperCase()}
                </div>
            </div>
            <div 
                className="typing-indicator"
                style={{ 
                    background: 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
                    borderRadius: '20px 20px 20px 6px',
                    padding: '12px 16px',
                    color: '#ffffff',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    maxWidth: '75%'
                }}
            >
                <div className="d-flex align-items-center">
                    <div className="typing-dots">
                        {[0, 0.16, 0.32].map((delay, index) => (
                            <span 
                                key={index}
                                style={{ 
                                    display: 'inline-block',
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    backgroundColor: '#9ca3af',
                                    margin: '0 2px',
                                    animation: `typing-bounce 1.4s infinite ease-in-out ${delay}s`
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}