import {LoanResponse, OrderResponse, ShipBuyResponse, User} from "spacetraders-api-sdk";

export type ExtendedUserData = User & OrderResponse & LoanResponse & ShipBuyResponse;