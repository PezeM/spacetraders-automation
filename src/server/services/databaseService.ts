import {UserState} from "../state/userState";
import {Point} from "@influxdata/influxdb-client";
import {getWriteApi} from "../influxDB";

export class DatabaseService {
    async saveUserMoney(userState: UserState) {
        const point = new Point("money")
            .tag("username", userState.data.username)
            .intField("value", userState.data.credits);
        const writeApi = await getWriteApi();
        writeApi.writePoint(point);
    }

    async saveShipsCount(userState: UserState) {
        const point = new Point("ships_count")
            .tag("username", userState.data.username)
            .intField("value", userState.data.ships.length);
        const writeApi = await getWriteApi();
        writeApi.writePoint(point);
    }
}