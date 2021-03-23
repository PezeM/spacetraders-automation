import {API} from "../API";
import logger from "../logger";
import {UserState} from "../state/userState";

export class UserService {
    async syncUser(userState: UserState) {
        try {
            const response = await API.user.getUser();

            if (response) {
                userState.updateData(response.user);
            }

            return userState.data;
        } catch (e) {
            logger.error(`Couldn't synchronize user state with server`, e);
        }
    }
}