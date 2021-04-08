import {GoodType} from "spacetraders-api-sdk";

export const getColorOfGood = (good: GoodType): string => {
    const colors = [
        '#ffa38a',
        '#a9a7e0',
        '#D686D4',
        '#96CE56',
        '#4A90E2',
        '#62b3d0',
        '#ef7676',
    ];

    const firstChar = good.charCodeAt(0);
    const secondChar = good.charCodeAt(1);
    const thirdChar = good.charCodeAt(2);

    return colors[(firstChar + secondChar + thirdChar) % 5];
}