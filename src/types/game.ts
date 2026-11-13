export type WorldType = 'real' | 'shadow';

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  readonly x: number;
  readonly y: number;
}

export type TileType = 'empty' | 'wall';

export interface Switch {
  readonly id: string;
  readonly position: Position;
  readonly targetDoorId: string;
  readonly world: WorldType;
  isActive: boolean;
}

export interface Door {
  readonly id: string;
  readonly position: Position;
  readonly world: WorldType;
  isOpen: boolean;
}

export interface PressurePlate {
  readonly id: string;
  readonly position: Position;
  readonly targetDoorId: string;
  readonly world: WorldType;
  isPressed: boolean;
}

export interface Hazard {
  readonly id: string;
  readonly position: Position;
  readonly world: WorldType;
}

export interface Checkpoint {
  readonly id: string;
  readonly realPosition: Position;
  readonly shadowPosition: Position;
  isActivated: boolean;
}

export interface Exit {
  readonly position: Position;
  readonly world: WorldType;
}

export interface LevelData {
  readonly id: number;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly realStart: Position;
  readonly shadowStart: Position;
  readonly realExit: Position;
  readonly shadowExit: Position;
  readonly realWalls: readonly Position[];
  readonly shadowWalls: readonly Position[];
  readonly switches?: readonly {
    id: string;
    position: Position;
    targetDoorId: string;
    world: WorldType;
    initialActive?: boolean;
  }[];
  readonly doors?: readonly {
    id: string;
    position: Position;
    world: WorldType;
    initialOpen?: boolean;
  }[];
  readonly pressurePlates?: readonly {
    id: string;
    position: Position;
    targetDoorId: string;
    world: WorldType;
  }[];
  readonly hazards?: readonly {
    id: string;
    position: Position;
    world: WorldType;
  }[];
  readonly checkpoints?: readonly {
    id: string;
    realPosition: Position;
    shadowPosition: Position;
  }[];
}

export type GameStatus = 'playing' | 'level_complete' | 'paused' | 'hazard_reset';

export interface MoveResult {
  readonly realMoved: boolean;
  readonly shadowMoved: boolean;
  readonly realNewPos: Position;
  readonly shadowNewPos: Position;
  readonly triggeredHazard: boolean;
  readonly activatedCheckpointId: string | null;
  readonly levelCompleted: boolean;
}

export interface GameSnapshot {
  readonly levelId: number;
  readonly realPos: Position;
  readonly shadowPos: Position;
  readonly status: GameStatus;
  readonly moveCount: number;
  readonly lastCheckpointId: string | null;
}
