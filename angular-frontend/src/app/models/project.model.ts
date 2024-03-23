import { Stage } from "./stage.model";

export class Project {
    _id?: string;
    title: string;
    description: string;
    stages: Stage[];
    notes: string[]
}