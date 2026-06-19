export class AssetLoader {
  holderSheet: HTMLImageElement | null = null;
  jeetSheet: HTMLImageElement | null = null;
  projectileSheet: HTMLImageElement | null = null;
  coinImg: HTMLImageElement | null = null;
  tileImg: HTMLImageElement | null = null;

  private pending = 0;
  private resolveFn: (() => void) | null = null;

  private load(src: string): HTMLImageElement {
    this.pending++;
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.pending--;
      if (this.pending === 0 && this.resolveFn) this.resolveFn();
    };
    img.onerror = () => {
      this.pending--;
      if (this.pending === 0 && this.resolveFn) this.resolveFn();
    };
    return img;
  }

  loadAll(): Promise<void> {
    return new Promise((resolve) => {
      this.holderSheet = this.load('/assets/holders.png');
      this.jeetSheet = this.load('/assets/jeets.png');
      this.projectileSheet = this.load('/assets/projectiles.png');
      this.coinImg = this.load('/assets/coin.png');
      this.tileImg = this.load('/assets/tiles.png');
      this.resolveFn = resolve;
      if (this.pending === 0) resolve();
    });
  }

  get loaded(): boolean {
    return this.pending === 0;
  }
}
