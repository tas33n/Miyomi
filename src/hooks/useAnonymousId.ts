import { useState, useEffect } from 'react';

export function useAnonymousId() {
    const [userId, setUserId] = useState<string>('');

    useEffect(() => {
        // Check for existing ID
        let storedId = localStorage.getItem('miyomi_anon_id');

        if (!storedId) {
            // Generate a robust random ID
            const array = new Uint32Array(4);
            window.crypto.getRandomValues(array);
            storedId = 'user_' + Array.from(array, dec => dec.toString(16).padStart(8, '0')).join('');

            localStorage.setItem('miyomi_anon_id', storedId);
        }

        setUserId(storedId);
    }, []);

    return userId;
}