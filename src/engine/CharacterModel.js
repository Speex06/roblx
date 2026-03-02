import * as THREE from 'three';

export class CharacterModel {
  constructor(scene) {
    this.group = new THREE.Group();

    const skinColor = 0xf0c090;
    const shirtColor = 0x3b82f6;
    const pantsColor = 0x1e3a5f;
    const shoeColor = 0x2a2a2a;
    const hairColor = 0x3a2a1a;

    const skinMat = new THREE.MeshLambertMaterial({ color: skinColor });
    const shirtMat = new THREE.MeshLambertMaterial({ color: shirtColor });
    const pantsMat = new THREE.MeshLambertMaterial({ color: pantsColor });
    const shoeMat = new THREE.MeshLambertMaterial({ color: shoeColor });
    const hairMat = new THREE.MeshLambertMaterial({ color: hairColor });

    // Head
    this.head = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.72, 0.72), skinMat);
    this.head.position.y = 1.76;
    this.head.castShadow = true;

    // Hair (flat cap on top)
    const hair = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.2, 0.76), hairMat);
    hair.position.set(0, 2.2, -0.02);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const leftEyeWhite = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.02), eyeWhiteMat);
    leftEyeWhite.position.set(-0.14, 1.82, 0.365);
    const rightEyeWhite = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.14, 0.02), eyeWhiteMat);
    rightEyeWhite.position.set(0.14, 1.82, 0.365);

    const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.03), eyeMat);
    leftEye.position.set(-0.14, 1.82, 0.37);
    const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.03), eyeMat);
    rightEye.position.set(0.14, 1.82, 0.37);

    // Smile
    const smile = new THREE.Mesh(
      new THREE.BoxGeometry(0.2, 0.04, 0.03),
      new THREE.MeshBasicMaterial({ color: 0x333333 })
    );
    smile.position.set(0, 1.65, 0.37);

    // Torso
    this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.95, 0.45), shirtMat);
    this.torso.position.y = 1.08;
    this.torso.castShadow = true;

    // Arms (pivot from shoulder)
    const armGeo = new THREE.BoxGeometry(0.3, 0.95, 0.3);
    armGeo.translate(0, -0.475, 0);

    this.leftArm = new THREE.Mesh(armGeo.clone(), shirtMat);
    this.leftArm.position.set(-0.55, 1.56, 0);
    this.leftArm.castShadow = true;

    this.rightArm = new THREE.Mesh(armGeo.clone(), shirtMat);
    this.rightArm.position.set(0.55, 1.56, 0);
    this.rightArm.castShadow = true;

    // Legs (pivot from hip)
    const legGeo = new THREE.BoxGeometry(0.34, 0.85, 0.34);
    legGeo.translate(0, -0.425, 0);

    this.leftLeg = new THREE.Mesh(legGeo.clone(), pantsMat);
    this.leftLeg.position.set(-0.2, 0.6, 0);
    this.leftLeg.castShadow = true;

    this.rightLeg = new THREE.Mesh(legGeo.clone(), pantsMat);
    this.rightLeg.position.set(0.2, 0.6, 0);
    this.rightLeg.castShadow = true;

    // Shoes
    const shoeGeo = new THREE.BoxGeometry(0.36, 0.15, 0.42);
    const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
    leftShoe.position.set(-0.2, 0.075, 0.02);
    const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
    rightShoe.position.set(0.2, 0.075, 0.02);

    this.group.add(
      this.head, hair,
      leftEyeWhite, rightEyeWhite, leftEye, rightEye, smile,
      this.torso,
      this.leftArm, this.rightArm,
      this.leftLeg, this.rightLeg,
      leftShoe, rightShoe
    );

    this.group.castShadow = true;
    scene.add(this.group);
    this.walkTime = 0;
  }

  update(player) {
    this.group.position.copy(player.position);
    this.group.rotation.y = player.rotation;

    const speed = Math.sqrt(
      player.velocity.x * player.velocity.x +
      player.velocity.z * player.velocity.z
    );

    const isSprinting = player.isSprinting;
    const animSpeed = isSprinting ? 0.18 : 0.12;
    const swingAmp = isSprinting ? 0.7 : 0.45;

    if (speed > 0.5) {
      this.walkTime += speed * animSpeed;
      const swing = Math.sin(this.walkTime) * swingAmp;
      this.leftArm.rotation.x = swing;
      this.rightArm.rotation.x = -swing;
      this.leftLeg.rotation.x = -swing * 0.8;
      this.rightLeg.rotation.x = swing * 0.8;

      // Subtle body bob
      this.torso.position.y = 1.08 + Math.abs(Math.sin(this.walkTime * 2)) * 0.02;
      this.head.position.y = 1.76 + Math.abs(Math.sin(this.walkTime * 2)) * 0.02;
    } else {
      // Smooth return to idle
      this.walkTime = 0;
      this.leftArm.rotation.x *= 0.85;
      this.rightArm.rotation.x *= 0.85;
      this.leftLeg.rotation.x *= 0.85;
      this.rightLeg.rotation.x *= 0.85;
      this.torso.position.y = 1.08;
      this.head.position.y = 1.76;
    }

    // In-air pose
    if (!player.onGround) {
      this.leftArm.rotation.x = -0.3;
      this.rightArm.rotation.x = -0.3;
      this.leftLeg.rotation.x = 0.2;
      this.rightLeg.rotation.x = -0.2;
    }
  }
}
