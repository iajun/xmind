export default class Queue<T> {
  private index = -1;
  private queue: T[] = [];
  public length = 0;

  public canFore() {
    return this.index < this.length - 1;
  }

  public canBack() {
    return this.index >= 0;
  }

  public back() {
    if (this.canBack()) {
      this.index--;
    }
  }

  public fore() {
    if (this.canFore()) {
      this.index++;
    }
  }

  public push(item: T) {
    this.queue[++this.index] = item;
    this.length = this.index + 1;
  }

  get current() {
    return this.queue[this.index];
  }
}
