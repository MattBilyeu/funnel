import { Team } from "./team.model";

export class User {
    _id?: string;
    name: string;
    email: string;
    password: string;
    apiKey: string;
    teams: Team[]
}