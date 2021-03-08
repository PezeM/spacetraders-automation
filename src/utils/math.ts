import {IVector2} from "../types/math.interface";

export const distance = (a: IVector2, b: IVector2) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));