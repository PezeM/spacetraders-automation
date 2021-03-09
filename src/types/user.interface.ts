import {User} from "spacetraders-api-sdk";
import {Ship} from "../models/ship";

export interface GameUser extends User {
    ships: Ship[];
}