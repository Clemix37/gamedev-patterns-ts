import { Fleet } from "@/fleet";
import { Grid } from "@/grid";
import { Team } from "@/team";

export const mockFleetFactory = (team = Team.A, grid = new Grid()): Fleet => new Fleet(team, grid);
