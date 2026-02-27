// Utility functions for creating platforms and floor
export function createFloor(scene, x, y, width, height) {
  const rect = scene.add.rectangle(x, y, width, height, 0x000000, 0);
  rect.setDepth(0);
  scene.platforms.add(rect);
}

export function createPlatform(scene, x, y, width, height, id) {
  let platform = scene.platforms.create(x, y, "platforme");
  // Resize the body
  platform.displayWidth = width;
  platform.displayHeight = height;
  platform.setDisplaySize(width, height);
  platform.refreshBody(); // VERY IMPORTANT
  platform.setDepth(1);
  platform.id = id;
  return platform;
}

export function createPlatformRelative(
  scene,
  x,
  heightAboveFloor,
  width,
  height,
  id
) {
  const y = scene.floorY - heightAboveFloor;
  return createPlatform(scene, x, y, width, height, id);
}
