import React, { createContext, useState, useContext } from 'react';

const MascotContext = createContext();

export const MascotProvider = ({ children }) => {
    const [mascotMessage, setMascotMessage] = useState('');
    const [mascotEmotion, setMascotEmotionState] = useState('idle');

    // Helper to set message and emotion together
    const setMascotHelp = (message, emotion = 'happy') => {
        setMascotMessage(message);
        if (message) setMascotEmotionState(emotion);
        else setMascotEmotionState('idle');
    };

    return (
        <MascotContext.Provider value={{ mascotMessage, setMascotMessage: setMascotHelp, mascotEmotion, setMascotEmotion: setMascotEmotionState }}>
            {children}
        </MascotContext.Provider>
    );
};

export const useMascot = () => useContext(MascotContext);
