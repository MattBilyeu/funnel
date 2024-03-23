import { Stage } from "./stage.model";
import { User } from "./user.model";


export class Team {
    _id?: string;
    title: string;
    members: User[];
    stagesWorked: Stage[]
}