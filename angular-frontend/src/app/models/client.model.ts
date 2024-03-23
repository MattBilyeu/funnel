import { Project } from "./project.model";

export class Client {
    _id?: string;
    name: string;
    email: string;
    lifecycles: Project[]
}