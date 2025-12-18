import React from 'react';
import useAppStore from '../store/useAppStore';
import MainCard from './MainCard';

export default function CardList() {
    const cards = useAppStore(state => state.cards);
    return (
        <div className="space-y-4 pb-24">
            {cards.map((card, index) => (
                <MainCard
                    key={card.id}
                    card={card}
                />
            ))}
        </div>
    )
}
