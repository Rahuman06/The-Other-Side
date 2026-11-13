import { GridPosition, GridPoint } from '../grid/GridPosition';

export class Shadow {
  private currentPos: GridPoint;
  private readonly exitPos: GridPoint | null;

  constructor(start: GridPosition, exit?: GridPosition) {
    this.currentPos = GridPoint.from(start);
    this.exitPos = exit ? GridPoint.from(exit) : null;
  }

  public get position(): GridPoint {
    return this.currentPos;
  }

  public get exit(): GridPoint | null {
    return this.exitPos;
  }

  public isAtExit(): boolean {
    return this.exitPos !== null && this.currentPos.equals(this.exitPos);
  }

  public setPosition(pos: GridPosition): void {
    this.currentPos = GridPoint.from(pos);
  }
}
