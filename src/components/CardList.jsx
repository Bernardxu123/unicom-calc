import React from 'react';
import useAppStore from '../store/useAppStore';
import MainCard from './MainCard';

export default function CardList() {
    const cards = useAppStore(state => state.cards);
    return (
        <div className="space-y-6 pb-20">
            {cards.map(card => <MainCard key={card.id} card={card} />)}
        </div>
    )
}
