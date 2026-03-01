import React from 'react';
import { HairType, Gender } from '../types';

interface AvatarProps {
    hairType: string;
    hairColor: string;
    hairColorSecondary?: string;
    hasSecondaryColor?: boolean;
    skinColor?: string;
    eyeColor?: string;
    bangsType?: string;
    gender: Gender;
    clothes: string;
    accessories?: string[];
    size?: number;
}

const Avatar: React.FC<AvatarProps> = ({
    hairType,
    hairColor,
    hairColorSecondary,
    hasSecondaryColor = false,
    skinColor,
    eyeColor,
    bangsType, // Removed default from here
    gender,
    clothes,
    accessories = [],
    size = 150
}) => {
    // Robust fallbacks for null/undefined values from DB (null || default)
    const finalSkinColor = skinColor || '#ffdbac';
    const finalEyeColor = eyeColor || '#1a1a1a';
    const finalHairColorSecondary = hairColorSecondary || '#4a5568';
    const finalHairColor = hairColor || '#000000'; // Added new fallback
    const finalBangsType = bangsType || 'none'; // Added new fallback for bangsType

    // Pro Sprite Style (Inspired by Scott Pilgrim & River City Girls)
    const gridSize = 24;
    const p = 100 / gridSize;

    // Palette with Shaded Colors
    const black = "#1a1a1a";
    const white = "#ffffff";

    // Calculate skin shadow (darker version of final skin color)
    const getShadowColor = (color: string) => {
        // Simple hex darkened for shadow
        return color === '#ffdbac' ? '#e5c197' : color + 'cc';
    };
    const skinShadow = getShadowColor(finalSkinColor);

    const Pix = ({ x, y, w = 1, h = 1, f, o = 1 }: { x: number, y: number, w?: number, h?: number, f: string, o?: number }) => (
        <rect x={x * p} y={y * p} width={w * p} height={h * p} fill={f} fillOpacity={o} />
    );

    const shirtColor =
        clothes === 'band_tee' ? '#312e81' :
            clothes === 'parka' ? '#1e3a8a' :
                clothes === 'hoodie' ? '#991b1b' :
                    '#475569';

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 -10 100 110"
            style={{ imageRendering: 'pixelated' }}
            className="drop-shadow-xl"
        >
            {/* Ground Shadow */}
            <ellipse cx="50" cy="92" rx="35" ry="6" fill="black" opacity="0.2" />

            {/* Body - Chunky RPG Sprite */}
            <g id="body">
                {/* Outline */}
                <Pix x={5} y={16} w={14} h={7} f={black} />
                {/* Shirt Base */}
                <Pix x={6} y={17} w={12} h={5} f={shirtColor} />
                {/* Shading/Highlights */}
                <Pix x={6} y={17} w={12} h={1} f={white} o={0.1} />
                <Pix x={6} y={21} w={12} h={1} f={black} o={0.2} />

                {/* Graphic Upgrade */}
                {clothes === 'band_tee' && (
                    <g>
                        <Pix x={10} y={18} w={4} h={3} f="#fbbf24" o={0.5} />
                        <Pix x={11} y={19} w={2} h={1} f={white} o={0.8} />
                    </g>
                )}
            </g>

            {/* Arms - Pixel Perfect joints */}
            <g id="arms">
                <Pix x={4} y={17} w={2} h={4} f={black} />
                <Pix x={5} y={18} w={1} h={3} f={finalSkinColor} />
                <Pix x={18} y={17} w={2} h={4} f={black} />
                <Pix x={18} y={18} w={1} h={3} f={finalSkinColor} />
                {/* Hands */}
                <Pix x={3} y={20} w={2} h={2} f={finalSkinColor} />
                <Pix x={19} y={20} w={2} h={2} f={finalSkinColor} />
            </g>

            {/* Head - Expressive Face & Shaded Hair */}
            <g id="head">
                {/* Face Structure */}
                <Pix x={6} y={4} w={12} h={13} f={black} />
                <Pix x={7} y={5} w={10} h={11} f={finalSkinColor} />
                {/* Jaw shadow removed as per user request */}

                {/* Expressive Eyes - LARGE whites, distinct pupils */}
                <g id="eyes">
                    <Pix x={7} y={8} w={3} h={4} f={white} />
                    <Pix x={8} y={9} w={1} h={2} f={finalEyeColor} />
                    <Pix x={8} y={8} w={1} h={1} f={white} o={0.7} /> {/* Reflection */}

                    <Pix x={14} y={8} w={3} h={4} f={white} />
                    <Pix x={15} y={9} w={1} h={2} f={finalEyeColor} />
                    <Pix x={15} y={8} w={1} h={1} f={white} o={0.7} />
                </g>

                {/* Mouth - Persona style smirk */}
                <Pix x={11} y={14} w={3} h={1} f={black} />
                <Pix x={14} y={13} w={1} h={1} f={black} />
            </g>

            {/* Hair - PRO Organic Sprite Style */}
            <g id="hair">
                <g>
                    {hairType === 'messy' && (
                        <>
                            <Pix x={6} y={3} w={12} h={5} f={finalHairColor} />
                            <Pix x={7} y={2} w={10} h={1} f={finalHairColor} />
                            <Pix x={9} y={1} w={6} h={1} f={finalHairColor} />

                            <Pix x={5} y={4} w={2} h={7} f={finalHairColor} />
                            <Pix x={4} y={5} w={1} h={5} f={finalHairColor} />
                            <Pix x={17} y={4} w={2} h={7} f={finalHairColor} />
                            <Pix x={19} y={5} w={1} h={5} f={finalHairColor} />

                            {/* Two-tone Tips */}
                            {hasSecondaryColor && (
                                <>
                                    <Pix x={4} y={10} f={finalHairColorSecondary} />
                                    <Pix x={19} y={10} f={finalHairColorSecondary} />
                                    <Pix x={5} y={10} f={finalHairColorSecondary} />
                                    <Pix x={18} y={10} f={finalHairColorSecondary} />
                                </>
                            )}
                            {!hasSecondaryColor && (
                                <>
                                    <Pix x={4} y={10} f={finalHairColor} />
                                    <Pix x={19} y={10} f={finalHairColor} />
                                </>
                            )}

                            <Pix x={7} y={1} f={finalHairColor} />
                            <Pix x={16} y={1} f={finalHairColor} />

                            <Pix x={6} y={5} w={3} h={2} f={finalHairColor} />
                            <Pix x={15} y={5} w={3} h={2} f={finalHairColor} />
                            <Pix x={10} y={4} w={4} h={1} f={finalHairColor} />
                        </>
                    )}
                    {hairType === 'ramona_bob' && (
                        <>
                            <Pix x={5} y={3} w={14} h={6} f={finalHairColor} />
                            <Pix x={7} y={2} w={10} h={2} f={finalHairColor} />
                            <Pix x={4} y={6} w={2} h={10} f={finalHairColor} />
                            <Pix x={18} y={6} w={2} h={10} f={finalHairColor} />

                            {hasSecondaryColor && (
                                <>
                                    <Pix x={4} y={16} w={2} h={2} f={finalHairColorSecondary} />
                                    <Pix x={18} y={16} w={2} h={2} f={finalHairColorSecondary} />
                                </>
                            )}
                            {!hasSecondaryColor && (
                                <>
                                    <Pix x={4} y={16} w={2} h={1} f={finalHairColor} />
                                    <Pix x={18} y={16} w={2} h={1} f={finalHairColor} />
                                </>
                            )}

                            <Pix x={3} y={9} w={1} h={6} f={finalHairColor} />
                            <Pix x={20} y={9} w={1} h={6} f={finalHairColor} />
                            <Pix x={8} y={6} w={3} h={3} f={finalHairColor} />
                            <Pix x={13} y={6} w={3} h={3} f={finalHairColor} />
                        </>
                    )}
                    {hairType === 'kim_pine' && (
                        <>
                            <Pix x={6} y={2} w={12} h={6} f={finalHairColor} />
                            <Pix x={5} y={4} w={2} h={14} f={finalHairColor} />
                            <Pix x={17} y={4} w={2} h={14} f={finalHairColor} />

                            {hasSecondaryColor && (
                                <>
                                    <Pix x={5} y={18} w={2} h={2} f={finalHairColorSecondary} />
                                    <Pix x={17} y={18} w={2} h={2} f={finalHairColorSecondary} />
                                </>
                            )}
                            {!hasSecondaryColor && (
                                <>
                                    <Pix x={6} y={18} w={2} h={1} f={finalHairColor} />
                                    <Pix x={16} y={18} w={2} h={1} f={finalHairColor} />
                                </>
                            )}

                            <Pix x={4} y={8} w={1} h={10} f={finalHairColor} />
                            <Pix x={19} y={8} w={1} h={10} f={finalHairColor} />
                        </>
                    )}

                    {/* New Hair Types */}
                    {hairType === 'mohawk' && (
                        <>
                            <Pix x={10} y={0} w={4} h={6} f={finalHairColor} />
                            <Pix x={11} y={-1} w={2} h={1} f={finalHairColor} />
                            <Pix x={9} y={2} w={6} h={3} f={finalHairColor} />
                            {hasSecondaryColor && <Pix x={10} y={0} w={4} h={2} f={finalHairColorSecondary} />}
                        </>
                    )}

                    {hairType === 'braids' && (
                        <>
                            <Pix x={6} y={2} w={12} h={6} f={finalHairColor} />
                            <Pix x={4} y={6} w={3} h={12} f={finalHairColor} />
                            <Pix x={17} y={6} w={3} h={12} f={finalHairColor} />
                            {hasSecondaryColor && (
                                <>
                                    <Pix x={4} y={16} w={3} h={3} f={finalHairColorSecondary} />
                                    <Pix x={17} y={16} w={3} h={3} f={finalHairColorSecondary} />
                                </>
                            )}
                        </>
                    )}

                    {/* Bangs / Flecos */}
                    {finalBangsType === 'bangs_straight' && (
                        <Pix x={7} y={5} w={10} h={3} f={finalHairColor} />
                    )}
                    {finalBangsType === 'bangs_side' && (
                        <Pix x={7} y={5} w={7} h={3} f={finalHairColor} />
                    )}

                    {!['messy', 'ramona_bob', 'kim_pine', 'mohawk', 'braids'].includes(hairType) && (
                        <Pix x={6} y={2} w={12} h={6} f={finalHairColor} />
                    )}
                </g>
                <Pix x={9} y={3} w={4} h={1} f={white} o={0.2} />
                <Pix x={8} y={4} w={2} h={1} f={white} o={0.1} />
                <Pix x={14} y={4} w={2} h={1} f={white} o={0.1} />
            </g>
        </svg>
    );
};

export default Avatar;
