import { Fleet } from "@/fleet";
import { mockGridFactory } from "@/grid";
import { Team } from "@/team";

export const mockFleetFactory = (
    team = Team.A,
    grid = mockGridFactory()
): Fleet => new Fleet(team, grid);
