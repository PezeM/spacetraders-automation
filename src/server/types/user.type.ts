import {LoanResponse, OrderResponse, User} from "spacetraders-api-sdk";

export type ExtendedUserData = User & OrderResponse & LoanResponse;