import React from 'react';
import { styles, theme } from '../theme';

const MetadataCard = ({ title, value, icon: Icon, color }) => {
    return (
        <div style={{
            ...styles.glassPanel,
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div style={{
                position: 'absolute',
                top: '-10px',
                right: '-10px',
                width: '60px',
                height: '60px',
                background: color,
                opacity: 0.1,
                borderRadius: '50%',
                filter: 'blur(20px)'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: theme.colors.textMuted, fontSize: '0.875rem' }}>
                {Icon && <Icon size={16} style={{ color: color }} />}
                <span>{title}</span>
            </div>

            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: theme.colors.textMain }}>
                {value}
            </div>
        </div>
    );
};

export default MetadataCard;
