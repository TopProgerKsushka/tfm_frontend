const DECL = {
    "s": ["секунду", "секунды", "секунд"],
    "m": ["минуту", "минуты", "минут"],
    "h": ["час", "часа", "часов"],
    "d": ["день", "дня", "дней"],
};

function timeDecl(word: keyof typeof DECL, count: number) {
    if (Math.floor(count % 100 / 10) === 1) return DECL[word][2];
    const lastDigit = count % 10;
    if (lastDigit === 1) return DECL[word][0];
    if (lastDigit >= 2 && lastDigit <= 4) return DECL[word][1];
    return DECL[word][2];
}

export function timeSince(time: Date) {
    const seconds = Math.floor((Date.now() - time.valueOf()) / 1000);
    
    if (seconds < 60)
        return `${seconds} ${timeDecl("s", seconds)}`;

    const minutes = Math.floor(seconds / 60);
    if (minutes < 60)
        return `${minutes} ${timeDecl("m", minutes)}`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return `${hours} ${timeDecl("h", hours)}`;
    
    const days = Math.floor(hours / 24);
    return `${days} ${timeDecl("d", days)}`;
}
