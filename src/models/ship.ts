import {Cargo, GoodType, UserShip} from "spacetraders-api-sdk";
import {plainToClass, plainToClassFromExist} from "class-transformer";
import {isValidCargo} from "../utils/ship";

export class Ship implements UserShip {
    public cargo: Cargo[];
    public class: string;
    public id: string;
    public location: string;
    public manufacturer: string;
    public maxCargo: number;
    public plating: number;
    public spaceAvailable: number;
    public speed: number;
    public type: string;
    public weapons: number;
    public x: number;
    public y: number;
    public isScoutShip: boolean = false;
    public isTraveling: boolean = false;
    public isBusy: boolean = false;

    static createShip(data: UserShip | Ship): Ship {
        return plainToClass(Ship, data);
    }

    static createShipFromExist(ship: Ship, data: UserShip | Ship): Ship {
        return plainToClassFromExist(ship, data);
    }

    updateData(data: Partial<UserShip | Ship>) {
        if (data.class) this.class = data.class;
        if (data.id) this.id = data.id;
        if (data.location) this.location = data.location;
        if (data.manufacturer) this.manufacturer = data.manufacturer;
        if (data.maxCargo !== undefined) this.maxCargo = data.maxCargo;
        if (data.plating !== undefined) this.plating = data.plating;
        if (data.spaceAvailable !== undefined) this.spaceAvailable = data.spaceAvailable;
        if (data.speed !== undefined) this.speed = data.speed;
        if (data.weapons !== undefined) this.weapons = data.weapons;
        if (data.x !== undefined) this.x = data.x;
        if (data.y !== undefined) this.y = data.y;
        if (data.type) this.type = data.type;
        if (data.cargo) this.cargo = data.cargo;

        return this;
    }

    updateCargo(goodType: GoodType, cargo: Partial<Cargo> | Cargo): Ship {
        let index = this.cargo.findIndex(c => c.good === goodType);
        if (index === -1 && isValidCargo(cargo)) {
            this.cargo.push(cargo);
            return this;
        }

        this.cargo[index] = {...this.cargo[index], ...cargo};
        return this;
    }
}