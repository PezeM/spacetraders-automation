export const getColorOfItem = (item: string, modulo = 5): string => {
    const colors = [
        '#ffa38a',
        '#a9a7e0',
        '#D686D4',
        '#96CE56',
        '#4A90E2',
        '#62b3d0',
        '#ef7676',
    ];

    const firstChar = item.charCodeAt(0);
    const secondChar = item.charCodeAt(1);
    const thirdChar = item.charCodeAt(2);

    return colors[(firstChar + secondChar + thirdChar) % modulo];
}