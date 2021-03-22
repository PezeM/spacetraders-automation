import {Location} from "spacetraders-api-sdk";

export interface LocationWithDistance extends Location {
    distance: number;
}