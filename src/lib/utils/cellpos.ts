export const cellPos = {
    x(i: number): number {
        if (i < 0 || i > 62) throw new RangeError(`cannot calculate pos for cell ${i} (not in range 0...62)`);
        if (i === 0) return 30;
        if (i === 1) return 20;
        if (i < 7) return 80 + (i - 2) * 20;
        if (i < 13) return 70 + (i - 7) * 20;
        if (i < 20) return 60 + (i - 13) * 20;
        if (i < 28) return 50 + (i - 20) * 20;
        if (i < 37) return 40 + (i - 28) * 20;
        if (i < 45) return 50 + (i - 37) * 20;
        if (i < 52) return 60 + (i - 45) * 20;
        if (i < 58) return 70 + (i - 52) * 20;
        return 80 + (i - 58) * 20;
    },

    y(i: number): number {
        if (i < 0 || i > 62) throw new RangeError(`cannot calculate pos for cell ${i} (not in range 0...62)`);
        if (i === 0) return 20;
        if (i === 1) return 65;
        if (i < 7)  return 22;
        if (i < 13) return 39;
        if (i < 20) return 56;
        if (i < 28) return 73;
        if (i < 37) return 90;
        if (i < 45) return 107;
        if (i < 52) return 124;
        if (i < 58) return 141;
        return 158;
    },
};
