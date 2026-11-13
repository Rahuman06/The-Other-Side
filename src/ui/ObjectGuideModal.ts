import Phaser from 'phaser';

export interface GuideObjectEntry {
  readonly id: string;
  readonly name: string;
  readonly category: 'HAZARDS' | 'MECHANISMS' | 'DIMENSIONAL' | 'ENVIRONMENT';
  readonly iconType: string;
  readonly functionText: string;
  readonly activationText: string;
  readonly dangerText: string;
  readonly crossWorldText: string;
}

export const ALL_GUIDE_OBJECTS: readonly GuideObjectEntry[] = [
  {
    id: 'saw',
    name: 'SAW BLADE',
    category: 'HAZARDS',
    iconType: 'saw',
    functionText: 'Heavy industrial circular cutting blade moving along predetermined patrol tracks.',
    activationText: 'Continuously active or triggered on movement cycles.',
    dangerText: 'Lethal on contact. Disintegrates character immediately.',
    crossWorldText: 'Operates independently in its host world, but mirrors patrol timing.',
  },
  {
    id: 'laser',
    name: 'LASER & EMITTER',
    category: 'HAZARDS',
    iconType: 'laser',
    functionText: 'High-energy coherent ionization beam emitted in straight cardinal directions.',
    activationText: 'Active by default or toggled via linked switches and receivers.',
    dangerText: 'Lethal on contact. Blocks character traversal completely.',
    crossWorldText: 'Can cross through inter-dimensional portals into the opposite world.',
  },
  {
    id: 'bomb',
    name: 'BOMB & COUNTDOWN',
    category: 'HAZARDS',
    iconType: 'bomb',
    functionText: 'Cast-iron explosive charge that counts down on player movement steps.',
    activationText: 'Armed on level start or triggered when stepped upon.',
    dangerText: 'Detonates when countdown reaches zero, destroying walls and lethal in blast radius.',
    crossWorldText: 'Detonations shockwave can break cracked barriers in both worlds.',
  },
  {
    id: 'portal',
    name: 'DIMENSIONAL PORTAL',
    category: 'DIMENSIONAL',
    iconType: 'portal',
    functionText: 'Space-folding singularity that instantly transports any character entering it.',
    activationText: 'Step onto the portal vortex.',
    dangerText: 'Corrupted portals feature unstable thorn rifts; observe target destination carefully.',
    crossWorldText: 'Transfers characters or laser beams across worlds or spatial coordinates.',
  },
  {
    id: 'mirror',
    name: 'REFLECTIVE MIRROR',
    category: 'DIMENSIONAL',
    iconType: 'mirror',
    functionText: 'Specular 45-degree optical prism that redirects laser beams at exact 90-degree angles.',
    activationText: 'Step onto mirror or flip linked switch to rotate orientation.',
    dangerText: 'Reroutes beams; beware creating accidental hazards across safe paths.',
    crossWorldText: 'Enables cross-world laser alignment into opposite-world receivers.',
  },
  {
    id: 'exit',
    name: 'EXIT GATEWAY',
    category: 'ENVIRONMENT',
    iconType: 'exit',
    functionText: 'Architectural doorway visibly labeled EXIT. Gateway to the next level.',
    activationText: 'Both characters must occupy their respective exit doors simultaneously.',
    dangerText: 'Safe zone. Arriving character illuminates doorway and awaits partner.',
    crossWorldText: 'Both Real World and Shadow World exits must be reached together.',
  },
  {
    id: 'switch',
    name: 'TOGGLE SWITCH',
    category: 'MECHANISMS',
    iconType: 'switch',
    functionText: 'Industrial mechanical relay lever that toggles linked mechanisms.',
    activationText: 'Step onto the switch tile to toggle state.',
    dangerText: 'None directly. Toggling may open or close hazardous barriers.',
    crossWorldText: 'Often controls linked doors or emitters in the opposite partner world.',
  },
  {
    id: 'pressure_plate',
    name: 'PRESSURE PLATE',
    category: 'MECHANISMS',
    iconType: 'plate',
    functionText: 'Heavy 3D beveled stone floor plate that sinks 4px into floor when weighted.',
    activationText: 'Occupied by a character or pushable stone block.',
    dangerText: 'Releases linked doors or shields as soon as weight is removed.',
    crossWorldText: 'Can hold open timed or locked mechanisms across the dimensional divide.',
  },
  {
    id: 'door',
    name: 'BLAST DOOR',
    category: 'MECHANISMS',
    iconType: 'door',
    functionText: 'Heavy steel blast barrier with interlocking chevron teeth.',
    activationText: 'Opens when linked switch, pressure plate, or laser receiver is satisfied.',
    dangerText: 'Impassable when closed. Blocks characters, crates, and laser beams.',
    crossWorldText: 'Paired doors often require simultaneous cooperative cross-world activation.',
  },
  {
    id: 'time_lock',
    name: 'TIME LOCK STASIS',
    category: 'MECHANISMS',
    iconType: 'timelock',
    functionText: 'Chronometer device that projects a temporal freeze dome over hazards and doors.',
    activationText: 'Step onto time chronometer tile.',
    dangerText: 'Stasis is temporary and counts down with every committed turn.',
    crossWorldText: 'Freezes moving hazards to create safe crossing windows in both worlds.',
  },
  {
    id: 'magnetic',
    name: 'MAGNETIC FIELD',
    category: 'MECHANISMS',
    iconType: 'magnetic',
    functionText: 'Generates directional electromagnetic flux that pulls or repels metal crates.',
    activationText: 'Step onto magnetic relay or power linked conduit.',
    dangerText: 'Can trap movable blocks if pulled into corners without alternate routes.',
    crossWorldText: 'Aligns magnetic polarity between Real and Shadow worlds.',
  },
  {
    id: 'collapsing_floor',
    name: 'CRACKED FLOOR',
    category: 'ENVIRONMENT',
    iconType: 'cracked',
    functionText: '4-quadrant segmented cross stone tile that fractures progressively under weight.',
    activationText: 'Step onto tile and step off.',
    dangerText: 'Collapses into an infinite void after 2 steps; becomes permanently impassable.',
    crossWorldText: 'Forces precise path planning without backtracking.',
  },
  {
    id: 'checkpoint',
    name: 'SANCTUARY BEACON',
    category: 'ENVIRONMENT',
    iconType: 'checkpoint',
    functionText: 'Luminous monolithic stone plinth that stores progress snapshot.',
    activationText: 'Step onto plinth to ignite ascending cyan light pillar.',
    dangerText: 'None. Safe respawn point on death.',
    crossWorldText: 'Preserves paired character positions and all puzzle object states.',
  },
  {
    id: 'moving_wall',
    name: 'MOVING WALL',
    category: 'ENVIRONMENT',
    iconType: 'wall',
    functionText: 'Ancient stone masonry block sliding along linear floor tracks.',
    activationText: 'Triggered by switches, pressure plates, or turn cycles.',
    dangerText: 'Can crush characters against solid walls or seal corridors.',
    crossWorldText: 'Alters available routes synchronously across both worlds.',
  },
];

export class ObjectGuideModal {
  private container: Phaser.GameObjects.Container;
  private contentContainer: Phaser.GameObjects.Container;
  private currentPage: number = 0;
  private readonly itemsPerPage: number = 2;
  private pageIndicatorText!: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, width: number, height: number, onClose: () => void) {
    this.container = scene.add.container(width / 2, height / 2);
    this.container.setDepth(160);
    this.container.setVisible(false);

    const modalW = Math.min(680, width - 40);
    const modalH = Math.min(520, height - 40);

    // Dark backdrop
    const backdrop = scene.add.graphics();
    backdrop.fillStyle(0x000000, 0.85);
    backdrop.fillRect(-width / 2, -height / 2, width, height);
    backdrop.setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);
    this.container.add(backdrop);

    // Modal frame
    const box = scene.add.graphics();
    box.fillStyle(0x0a0a0a, 0.98);
    box.fillRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    box.lineStyle(1.5, 0xffffff, 0.9);
    box.strokeRoundedRect(-modalW / 2, -modalH / 2, modalW, modalH, 8);
    this.container.add(box);

    // Title
    const title = scene.add
      .text(0, -modalH / 2 + 30, 'OBJECT GUIDE & MECHANICS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        fontStyle: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
      })
      .setOrigin(0.5);
    this.container.add(title);

    const subtitle = scene.add
      .text(0, -modalH / 2 + 55, 'DISCOVERED GAMEPLAY PUZZLE OBJECTS & SPECIFICATIONS', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        color: '#888888',
        letterSpacing: 1.5,
      })
      .setOrigin(0.5);
    this.container.add(subtitle);

    // Divider
    const div = scene.add.graphics();
    div.lineStyle(1, 0x333333, 0.8);
    div.lineBetween(-modalW / 2 + 25, -modalH / 2 + 75, modalW / 2 - 25, -modalH / 2 + 75);
    this.container.add(div);

    // Dynamic content container for cards
    this.contentContainer = scene.add.container(0, 0);
    this.container.add(this.contentContainer);

    // Bottom Navigation Bar
    const navY = modalH / 2 - 40;

    // Prev Button
    this.createNavButton(scene, -140, navY, 80, 32, '← PREV', () => {
      if (this.currentPage > 0) {
        this.currentPage--;
        this.renderPage(scene, modalW);
      }
    });

    // Page Indicator
    this.pageIndicatorText = scene.add
      .text(0, navY, 'PAGE 1 / 7', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#CCCCCC',
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(this.pageIndicatorText);

    // Next Button
    this.createNavButton(scene, 140, navY, 80, 32, 'NEXT →', () => {
      const maxPages = Math.ceil(ALL_GUIDE_OBJECTS.length / this.itemsPerPage);
      if (this.currentPage < maxPages - 1) {
        this.currentPage++;
        this.renderPage(scene, modalW);
      }
    });

    // Close button top right
    const closeBtn = scene.add
      .text(modalW / 2 - 30, -modalH / 2 + 25, '✕', {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '20px',
        color: '#AAAAAA',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#FFFFFF'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#AAAAAA'));
    closeBtn.on('pointerdown', onClose);
    this.container.add(closeBtn);

    // Render initial page
    this.renderPage(scene, modalW);
  }

  private renderPage(scene: Phaser.Scene, modalW: number): void {
    this.contentContainer.removeAll(true);

    const maxPages = Math.ceil(ALL_GUIDE_OBJECTS.length / this.itemsPerPage);
    this.pageIndicatorText.setText(`PAGE ${this.currentPage + 1} / ${maxPages}`);

    const startIndex = this.currentPage * this.itemsPerPage;
    const pageItems = ALL_GUIDE_OBJECTS.slice(startIndex, startIndex + this.itemsPerPage);

    const cardW = modalW - 60;
    const cardH = 155;
    const cardSpacing = 170;
    const topY = -85;

    pageItems.forEach((item, index) => {
      const cardY = topY + index * cardSpacing;
      const card = scene.add.container(0, cardY);

      // Card background
      const cardBg = scene.add.graphics();
      cardBg.fillStyle(0x121212, 0.95);
      cardBg.fillRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
      cardBg.lineStyle(1, 0x2e2e2e, 0.9);
      cardBg.strokeRoundedRect(-cardW / 2, -cardH / 2, cardW, cardH, 6);
      card.add(cardBg);

      // Procedural Icon Box on Left
      const iconBoxW = 90;
      const iconBoxH = cardH - 24;
      const iconX = -cardW / 2 + iconBoxW / 2 + 12;

      const iconBg = scene.add.graphics();
      iconBg.fillStyle(0x060606, 1);
      iconBg.fillRoundedRect(iconX - iconBoxW / 2, -iconBoxH / 2, iconBoxW, iconBoxH, 4);
      iconBg.lineStyle(1, 0x444444, 0.8);
      iconBg.strokeRoundedRect(iconX - iconBoxW / 2, -iconBoxH / 2, iconBoxW, iconBoxH, 4);
      card.add(iconBg);

      this.renderObjectIcon(scene, card, item.iconType, iconX, 0);

      // Content text on right
      const textX = iconX + iconBoxW / 2 + 16;
      const textMaxW = cardW - iconBoxW - 50;

      // Category badge & Name
      const nameText = scene.add
        .text(textX, -cardH / 2 + 18, `${item.name}  [ ${item.category} ]`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '14px',
          fontStyle: 'bold',
          color: '#00E5FF',
          letterSpacing: 1.2,
        })
        .setOrigin(0, 0);
      card.add(nameText);

      // Function
      const desc = scene.add
        .text(textX, -cardH / 2 + 42, `FUNCTION: ${item.functionText}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '11px',
          color: '#E0E0E0',
          wordWrap: { width: textMaxW },
          lineSpacing: 2,
        })
        .setOrigin(0, 0);
      card.add(desc);

      // Activation
      const act = scene.add
        .text(textX, -cardH / 2 + 76, `TRIGGER: ${item.activationText}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '11px',
          color: '#AAAAAA',
          wordWrap: { width: textMaxW },
        })
        .setOrigin(0, 0);
      card.add(act);

      // Danger / Effect & Cross-World
      const effect = scene.add
        .text(textX, -cardH / 2 + 104, `EFFECT: ${item.dangerText}\nCROSS-WORLD: ${item.crossWorldText}`, {
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontSize: '10.5px',
          color: '#888888',
          wordWrap: { width: textMaxW },
          lineSpacing: 2,
        })
        .setOrigin(0, 0);
      card.add(effect);

      this.contentContainer.add(card);
    });
  }

  private renderObjectIcon(scene: Phaser.Scene, parent: Phaser.GameObjects.Container, type: string, x: number, y: number): void {
    const g = scene.add.graphics();

    switch (type) {
      case 'saw':
        g.lineStyle(1.5, 0xff4400, 0.9);
        g.strokeCircle(x, y, 22);
        g.fillStyle(0x333333, 1);
        g.fillCircle(x, y, 8);
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          g.lineBetween(x + Math.cos(a) * 16, y + Math.sin(a) * 16, x + Math.cos(a) * 24, y + Math.sin(a) * 24);
        }
        break;

      case 'laser':
        g.lineStyle(4, 0x00e5ff, 0.4);
        g.lineBetween(x - 28, y, x + 28, y);
        g.lineStyle(2, 0xffffff, 1);
        g.lineBetween(x - 28, y, x + 28, y);
        g.fillStyle(0x00b0ff, 1);
        g.fillRect(x - 30, y - 8, 8, 16);
        break;

      case 'bomb':
        g.fillStyle(0x222222, 1);
        g.fillCircle(x, y + 2, 18);
        g.lineStyle(1.5, 0xff4400, 1);
        g.strokeCircle(x, y + 2, 18);
        g.lineStyle(2, 0xffaa00, 1);
        g.lineBetween(x, y - 16, x + 8, y - 24);
        break;

      case 'portal':
        g.lineStyle(2, 0x00e5ff, 0.85);
        g.strokeCircle(x, y, 20);
        g.lineStyle(1, 0xffffff, 0.9);
        g.strokeCircle(x, y, 12);
        break;

      case 'exit': {
        g.fillStyle(0x181818, 1);
        g.fillRect(x - 18, y - 24, 36, 48);
        g.lineStyle(1.5, 0x00e5ff, 0.9);
        g.strokeRect(x - 18, y - 24, 36, 48);
        const exitLabel = scene.add
          .text(x, y, 'EXIT', {
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: '10px',
            fontStyle: 'bold',
            color: '#00E5FF',
          })
          .setOrigin(0.5);
        parent.add(exitLabel);
        break;
      }

      case 'switch':
        g.fillStyle(0x222222, 1);
        g.fillRect(x - 16, y - 16, 32, 32);
        g.lineStyle(2, 0x00e5ff, 1);
        g.lineBetween(x, y + 8, x + 10, y - 12);
        break;

      case 'plate':
        g.fillStyle(0x333333, 1);
        g.fillRect(x - 20, y - 8, 40, 16);
        g.lineStyle(1.5, 0x00e5ff, 1);
        g.strokeRect(x - 20, y - 8, 40, 16);
        break;

      case 'door':
        g.fillStyle(0x282828, 1);
        g.fillRect(x - 20, y - 22, 40, 44);
        g.lineStyle(1.5, 0xffffff, 0.8);
        g.lineBetween(x - 12, y, x, y - 8);
        g.lineBetween(x, y - 8, x + 12, y);
        break;

      case 'mirror':
        g.lineStyle(2, 0x00e5ff, 1);
        g.lineBetween(x - 16, y + 16, x + 16, y - 16);
        g.fillStyle(0x00b0ff, 0.4);
        g.fillTriangle(x - 16, y + 16, x + 16, y - 16, x + 16, y + 16);
        break;

      case 'timelock':
        g.lineStyle(1.5, 0x00e5ff, 0.9);
        g.strokeCircle(x, y, 20);
        g.lineBetween(x, y, x, y - 12);
        g.lineBetween(x, y, x + 8, y);
        break;

      case 'magnetic':
        g.lineStyle(1.5, 0x00e5ff, 0.8);
        g.strokeCircle(x, y, 14);
        g.lineStyle(1, 0x00e5ff, 0.4);
        g.strokeCircle(x, y, 22);
        break;

      case 'cracked':
        g.fillStyle(0x222222, 1);
        g.fillRect(x - 18, y - 18, 36, 36);
        g.lineStyle(1.5, 0x666666, 1);
        g.lineBetween(x - 18, y, x + 18, y);
        g.lineBetween(x, y - 18, x, y + 18);
        break;

      case 'checkpoint':
        g.lineStyle(1.5, 0x00e5ff, 1);
        g.strokeCircle(x, y + 10, 14);
        g.lineBetween(x, y + 10, x, y - 18);
        g.fillStyle(0x00e5ff, 1);
        g.fillCircle(x, y - 18, 4);
        break;

      case 'wall':
        g.fillStyle(0x2a2a2a, 1);
        g.fillRect(x - 18, y - 18, 36, 36);
        g.lineStyle(1, 0x666666, 1);
        g.strokeRect(x - 18, y - 18, 36, 36);
        break;
    }

    parent.add(g);
  }

  private createNavButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    onClick: () => void
  ): void {
    const bg = scene.add.graphics();
    const render = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? 0x2a2a2a : 0x141414, 0.9);
      bg.fillRoundedRect(x - w / 2, y - h / 2, w, h, 4);
      bg.lineStyle(hover ? 1.5 : 1, hover ? 0xffffff : 0x666666, 0.9);
      bg.strokeRoundedRect(x - w / 2, y - h / 2, w, h, 4);
    };

    render(false);
    this.container.add(bg);

    const txt = scene.add
      .text(x, y, label, {
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#CCCCCC',
        letterSpacing: 1,
      })
      .setOrigin(0.5);
    this.container.add(txt);

    const hit = scene.add
      .zone(x, y, w, h)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    hit.on('pointerover', () => {
      render(true);
      txt.setColor('#FFFFFF');
    });

    hit.on('pointerout', () => {
      render(false);
      txt.setColor('#CCCCCC');
    });

    hit.on('pointerdown', onClick);
    this.container.add(hit);
  }

  public show(): void {
    this.currentPage = 0;
    this.container.setVisible(true);
  }

  public hide(): void {
    this.container.setVisible(false);
  }

  public isVisible(): boolean {
    return this.container.visible;
  }
}
