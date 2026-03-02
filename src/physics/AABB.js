export class AABB {
  constructor(minX, minY, minZ, maxX, maxY, maxZ) {
    this.minX = minX;
    this.minY = minY;
    this.minZ = minZ;
    this.maxX = maxX;
    this.maxY = maxY;
    this.maxZ = maxZ;
  }

  static fromPlayer(player) {
    const hw = player.width / 2;
    return new AABB(
      player.position.x - hw,
      player.position.y,
      player.position.z - hw,
      player.position.x + hw,
      player.position.y + player.height,
      player.position.z + hw
    );
  }

  intersects(other) {
    return (
      this.minX < other.maxX && this.maxX > other.minX &&
      this.minY < other.maxY && this.maxY > other.minY &&
      this.minZ < other.maxZ && this.maxZ > other.minZ
    );
  }

  clone() {
    return new AABB(this.minX, this.minY, this.minZ, this.maxX, this.maxY, this.maxZ);
  }

  translate(dx, dy, dz) {
    return new AABB(
      this.minX + dx, this.minY + dy, this.minZ + dz,
      this.maxX + dx, this.maxY + dy, this.maxZ + dz
    );
  }
}
